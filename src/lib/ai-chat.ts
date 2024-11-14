import OpenAI from 'openai'
import { rayContext, UserContext } from './user-context'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

function translateUserContext(userContext: UserContext): string {
  if (!userContext) return ''

  const profile = userContext.profile || {}
  const user = userContext.user || {}
  const consulate = userContext.consulate || {}
  const documents = userContext.documents || {}
  const address = profile.address || {}

  return `
User Information:
- Name: ${profile.firstName || 'N/A'} ${profile.lastName || 'N/A'}
- Gender: ${profile.gender || 'N/A'}
- Email: ${user.email || 'N/A'}
- Role: ${user.role || 'N/A'}
- Birth Date: ${profile.birthDate || 'N/A'}
- Country of Birth: ${profile.birthCountry || 'N/A'}
- Marital Status: ${profile.maritalStatus || 'N/A'}
- Work Status: ${profile.workStatus || 'N/A'}
- Country of Residence: ${address.country || 'N/A'}
- Profile Status: ${profile.status || 'N/A'}

Associated Consulate:
- Name: ${consulate.name || 'N/A'}
- Covered Countries: ${Array.isArray(consulate.countries) ? consulate.countries.join(', ') : 'N/A'}
- Is General Consulate: ${consulate.isGeneral ? 'Yes' : 'No'}

Documents:
- Passport: ${documents.hasPassport ? 'Provided' : 'Not provided'}
- Birth Certificate: ${documents.hasBirthCertificate ? 'Provided' : 'Not provided'}
- Residence Permit: ${documents.hasResidencePermit ? 'Provided' : 'Not provided'}
- Proof of Address: ${documents.hasAddressProof ? 'Provided' : 'Not provided'}

Use this information to personalize your responses and provide advice tailored to the user's situation.
  `
}

export async function chatWithGPT(message: string, defaultLanguage: string, userContext: UserContext | null): Promise<string> {
  try {
    let systemMessage = `${rayContext}\n\nAlways format your responses using Markdown syntax for better readability. Use lists, bold text, hyperlinks, and other Markdown elements when appropriate.`

    if (userContext) {
      systemMessage += `\n\n${translateUserContext(userContext)}`
    }

    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: systemMessage },
        { role: 'user', content: `User's default language: ${defaultLanguage}\n\nUser's message: ${message}` },
      ],
      max_tokens: 1000,
    })

    return response.choices[0].message.content || 'I couldn\'t generate a response. Please try again.'
  } catch (error) {
    console.error('Error chatting with GPT:', error)
    throw error
  }
}