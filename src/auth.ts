import { prisma } from "@/lib/prisma" // Connexion à Prisma (uniquement utilisée pour des opérations indépendantes)
import { NextRequest, NextResponse } from "next/server";

// Exemple d'une simple requête GET (sans authentification)
export async function GET(req: NextRequest) {
  try {
    const data = await prisma.exampleModel.findMany(); // Remplacez "exampleModel" par votre modèle Prisma
    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}

// Exemple d'une simple requête POST (sans authentification)
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const createdData = await prisma.exampleModel.create({ data: body }); // Remplacez "exampleModel" par votre modèle Prisma
    return NextResponse.json(createdData, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to create data" }, { status: 500 });
  }
}