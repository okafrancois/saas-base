import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import OpenAI from 'openai';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    // Récupérer les données du formulaire
    const formData = await request.formData();
    const file = formData.get('file');

    if (!file || !(file instanceof File)) {
      return NextResponse.json(
        { error: 'Fichier invalide ou manquant' },
        { status: 400 }
      );
    }

    // Instancier le client OpenAI
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    // Convertir le fichier en base64
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64 = buffer.toString('base64');

    // Faire une requête OpenAI pour analyser le fichier
    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo', // Modèle optimisé pour réduire les coûts
      messages: [
        {
          role: 'system',
          content: "Analyse ce document et extrais les informations importantes.",
        },
        {
          role: 'user',
          content: `Voici un fichier au format base64 : data:${file.type};base64,${base64}`,
        },
      ],
      max_tokens: 300, // Limite pour réduire la consommation
    });

    // Extraire les métadonnées du contenu retourné
    const metadata = JSON.parse(response.choices[0].message?.content || '{}');

    // Enregistrer les résultats dans la base de données avec Prisma
    const result = await prisma.documentAnalysis.create({
      data: {
        fileName: file.name,
        metadata: metadata,
      },
    });

    // Retourner les résultats
    return NextResponse.json(result);

  } catch (error: any) {
    console.error('Erreur:', error);

    // Gestion des erreurs d'API OpenAI (ex.: Quota dépassé)
    if (error.response) {
      if (error.response.code === 'insufficient_quota') {
        return NextResponse.json(
          { error: 'Votre quota OpenAI est insuffisant. Veuillez vérifier votre plan.' },
          { status: 402 } // Code de réponse pour quota insuffisant
        );
      }
      if (error.response.status === 429) {
        return NextResponse.json(
          { error: 'Trop de requêtes envoyées. Veuillez réessayer plus tard.' },
          { status: 429 }
        );
      }
    }

    // Gestion de toute autre erreur
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Erreur interne du serveur.',
      },
      { status: 500 }
    );
  }
}