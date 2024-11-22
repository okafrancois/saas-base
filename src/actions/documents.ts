'use server'

import { OpenAI } from 'openai'
import sharp from 'sharp'
import { DocumentField } from '@/lib/utils'
import Anthropic from '@anthropic-ai/sdk'
import { pdfToImages } from '@/actions/convert'
import { DocumentWithMetadata } from '@/types/document'
import { getCurrentUser } from '@/actions/user'
import { getUserByIdWithProfile, getUserProfile } from '@/lib/user/getters'
import { getProfileDocuments } from '@/lib/db/document'
import { db } from '@/lib/prisma'

// Types
interface DocumentAnalysisResult {
  documentType: string
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  extractedData: Record<string, any>
}

interface AnalysisResponse {
  success: boolean
  results: DocumentAnalysisResult[]
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  mergedData: Record<string, any>
  error?: string
}

async function optimizeImage(buffer: Buffer): Promise<Buffer> {
  return await sharp(buffer)
    .resize(1024, 1024, { fit: 'inside', withoutEnlargement: true })
    .jpeg({ quality: 80 })
    .toBuffer()
}

async function fileToImages(file: File): Promise<Buffer[]> {

  if (file.type === 'application/pdf') {
    return await pdfToImages(file)
  }

  if (file.type.startsWith('image/')) {
    const buffer = await file.arrayBuffer()
    const optimized = await optimizeImage(Buffer.from(buffer))
    return [optimized]
  }

  throw new Error(`Unsupported file type: ${file.type}`)
}

function generatePrompt(fields: DocumentField[]): string {
  return `Please analyze this document and extract ONLY the following information in JSON format.
You are analyzing Gabonese documents, which include handwritten text. Pay special attention to text recognition and interpretation.

When analyzing handwritten text, follow these guidelines:

1. Text Recognition Strategy:
   - Look for both cursive and print handwriting
   - Consider different handwriting styles (slanted, vertical, connected, disconnected)
   - Pay attention to character spacing and alignment
   - Look for text both in designated fields and margins
   - Check for crossed-out text and corrections

2. Name Analysis:
   - Names may be handwritten with varying legibility
   - Accents might be missing or varied (é,è,ë may appear as e)
   - Match against the common Gabonese names
   - Consider regional naming patterns and traditions
   - Look for family name prefixes (e.g., M', N', Ondo, Nze)

3. Number Recognition:
   - Pay attention to date formats (DD/MM/YYYY, DD-MM-YYYY)
   - Look for both European (7) and local number variations
   - Be careful with 1/7, 4/9, 3/8 similarities in handwriting
   - Check for numerical corrections or overwritten numbers

4. Document Context:
   - Consider the document type (ID, certificate, form)
   - Look for official stamps and watermarks near text
   - Check for signatures and their placement

5. Text Placement:
   - Look for text in both designated fields and margins
   - Check for continuations of text in different sections
   - Consider text orientation and alignment

Fields to extract:
${fields.map(field => {
    const description = [
      field.name,
      field.description,
      field.required ? '(Required)' : '(Optional)',
      field.type ? `[${field.type}]` : ''
    ].filter(Boolean).join(' - ');
    return `- ${description}`;
  }).join('\n')}

Return ONLY a valid JSON object with exact field names. Follow these format rules:
- Use UPPERCASE for gender (MALE/FEMALE)
- Use YYYY-MM-DD format for dates
- For addresses use the structure: { firstLine, secondLine?, city, zipCode, country }
- Use snail case for countries (e.g., gabon, france)
- Use snail case for nationality (e.g., gabonese)
- Only include fields that are found in the document
- Only include the fields to extract mentioned above
- Omit fields that are not found
- If a name matches a common Gabonese name with slight variation, use the standardized version
- For uncertain handwritten text, provide confidence levels if multiple interpretations are possible
- When encountering unclear text, consider the document context and field expectations

Special Cases:
- For unclear characters, consider common local writing patterns
- For partially obscured text, use context to make informed interpretations
- For overlapping text, try to separate based on ink color or writing style
- For faded text, enhance contrast in your analysis
- For stamps overlaying text, try to read through or around the stamp

Do not include any additional text, comments, or explanations outside of the JSON object.
If you're uncertain about a handwritten text interpretation, choose the most likely option based on common patterns in Gabonese documents.`;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function extractJsonFromResponse(content: string): Record<string, any> {
  try {
    // Supprimer tout texte avant le premier {
    const jsonStart = content.indexOf('{')
    const jsonEnd = content.lastIndexOf('}')

    if (jsonStart === -1 || jsonEnd === -1) {
      throw new Error('No valid JSON found in response')
    }

    const jsonString = content.slice(jsonStart, jsonEnd + 1)

    // Essayer de parser le JSON
    const parsed = JSON.parse(jsonString)

    // Nettoyer les valeurs
    return Object.entries(parsed).reduce((acc, [key, value]) => {
      // Ignorer les valeurs null, undefined ou vides
      if (value === null || value === undefined || value === '') {
        return acc
      }

      // Nettoyer les strings
      if (typeof value === 'string') {
        const cleanedValue = value.trim()
        if (cleanedValue) {
          acc[key] = cleanedValue
        }
        return acc
      }

      // Pour les objets (comme address), vérifier récursivement
      if (typeof value === 'object' && !Array.isArray(value)) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const cleanedObject = Object.entries(value as Record<string, any>).reduce(
          (objAcc, [objKey, objValue]) => {
            if (objValue !== null && objValue !== undefined && objValue !== '') {
              objAcc[objKey] = objValue
            }
            return objAcc
          },
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          {} as Record<string, any>
        )

        if (Object.keys(cleanedObject).length > 0) {
          acc[key] = cleanedObject
        }
        return acc
      }

      acc[key] = value
      return acc
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    }, {} as Record<string, any>)

  } catch (error) {
    console.error('Error extracting JSON:', error)
    return {}
  }
}

export async function analyzeDocuments(
  formData: FormData,
  fieldsToAnalyze: { key: string, fields: DocumentField[] }[],
  model: AIModel = 'gpt'
): Promise<AnalysisResponse> {
  try {
    const visionAnalyzer: VisionAnalyzer = createVisionAnalyzer(model);

    const analysisResults = await Promise.all(
      fieldsToAnalyze.map(async ({ key, fields }) => {
        const file = formData.get(key) as File | null;

        if (!file) {
          console.warn(`No file found for key: ${key}`);
          return null;
        }

        try {
          const images = await fileToImages(file);
          const prompt = generatePrompt(fields);

          const documentResults = await Promise.all(images.slice(0, 1).map(async (imageBuffer) => {
            const base64 = imageBuffer.toString('base64');
            const content = await visionAnalyzer.analyzeImage(base64, prompt);

            if (!content) {
              throw new Error(`No content in response for ${key}`);
            }

            console.log(`Raw response for ${key}:`, content);

            const extractedData = extractJsonFromResponse(content);
            console.log(`Cleaned data for ${key}:`, extractedData);

            return extractedData;
          }));

          const mergedResult = documentResults.reduce((acc, curr) => {
            return { ...acc, ...curr };
          }, {});

          return {
            documentType: key,
            extractedData: mergedResult,
          };

        } catch (error) {
          console.error(`Error analyzing ${key}:`, error);
          return null;
        }
      })
    );

    const validResults = analysisResults.filter(result => result !== null) as DocumentAnalysisResult[];

    const mergedData = validResults.reduce((finalData, result) => {
      const { extractedData } = result;
      return { ...finalData, ...extractedData };
    }, {});

    return {
      success: true,
      results: validResults,
      mergedData
    };

  } catch (error) {
    console.error('Document analysis error:', error);
    return {
      success: false,
      results: [],
      mergedData: {},
      error: error instanceof Error ? error.message : 'Unknown error during document analysis'
    };
  }
}

type AIModel = 'claude' | 'gpt';

interface VisionAnalyzer {
  analyzeImage(base64Image: string, prompt: string): Promise<string>;
}

class ClaudeVisionAnalyzer implements VisionAnalyzer {
  private client: Anthropic;

  constructor() {
    this.client = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY
    });
  }

  async analyzeImage(base64Image: string, prompt: string): Promise<string> {
    const response = await this.client.messages.create({
      model: "claude-3-5-sonnet-20240620",
      max_tokens: 1024,
      messages: [{
        role: "user",
        content: [
          {
            type: "text",
            text: prompt
          },
          {
            type: "image",
            source: {
              type: "base64",
              media_type: "image/jpeg",
              data: base64Image
            }
          }
        ]
      }]
    });

    const contentBlock = response.content[0] as { text: string };
    return contentBlock.text;
  }
}

class OpenAIVisionAnalyzer implements VisionAnalyzer {
  private client: OpenAI;

  constructor() {
    this.client = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });
  }

  async analyzeImage(base64Image: string, prompt: string): Promise<string> {
    const response = await this.client.chat.completions.create({
      model: "chatgpt-4o-latest",
      messages: [
        {
          role: "user",
          content: [
            { type: "text", text: prompt },
            {
              type: "image_url",
              image_url: {
                url: `data:image/jpeg;base64,${base64Image}`,
                detail: "high"
              }
            }
          ]
        }
      ]
    });

    return response.choices[0].message.content || '';
  }
}

function createVisionAnalyzer(model: AIModel): VisionAnalyzer {
  switch (model) {
    case 'claude':
      return new ClaudeVisionAnalyzer();
    case 'gpt':
      return new OpenAIVisionAnalyzer();
    default:
      throw new Error(`Unsupported model: ${model}`);
  }
}

export async function getUserDocumentsList(): Promise<DocumentWithMetadata[]> {
  try {
    const user = await getCurrentUser()
    if (!user) return []

    const profile = await getUserProfile(user.id)

    if (!profile) return []

    const documents = await getProfileDocuments(profile.id)

    console.log('User documents:', documents)

    return documents as DocumentWithMetadata[]
  } catch (error) {
    console.error('Error fetching user documents:', error)
    return []
  }
}

export async function getUserProfileDocuments(userId: string) {
  const profileWithDocument = await db.profile.findUnique({
    where: { userId },
    include: {
      passport: true,
      birthCertificate: true,
      residencePermit: true,
      addressProof: true,
    }
  })

  if (!profileWithDocument) return []

  const documents = [
    profileWithDocument.passport,
    profileWithDocument.birthCertificate,
    profileWithDocument.residencePermit,
    profileWithDocument.addressProof
  ]

  return documents.filter(Boolean) as DocumentWithMetadata[]
}