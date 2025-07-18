import { NextResponse } from 'next/server';
import prisma from '../../../../lib/prisma';
import { verifyAuth } from '../../../../lib/auth';

// Récupérer les paramètres
export async function GET() {
  try {
    // Récupérer les premiers paramètres ou en créer
    let settings = await prisma.settings.findFirst();
    
    if (!settings) {
      settings = await prisma.settings.create({
        data: {
          siteName: 'Margoul1 Store',
          description: '',
          contactEmail: '',
          socialLinks: {},
        }
      });
    }

    return NextResponse.json(settings);
  } catch (error) {
    console.error('Erreur récupération paramètres:', error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération des paramètres" },
      { status: 500 }
    );
  }
}

// Mettre à jour les paramètres
export async function POST(request: Request) {
  try {
    const user = await verifyAuth();
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: "Non autorisé" },
        { status: 401 }
      );
    }

    const data = await request.json();
    
    // Récupérer les paramètres existants ou en créer
    let settings = await prisma.settings.findFirst();
    
    if (settings) {
      // Mettre à jour si existe
      settings = await prisma.settings.update({
        where: { id: settings.id },
        data: {
          siteName: data.siteName,
          description: data.description,
          contactEmail: data.contactEmail,
          socialLinks: data.socialLinks,
        }
      });
    } else {
      // Créer si n'existe pas
      settings = await prisma.settings.create({
        data: {
          siteName: data.siteName,
          description: data.description,
          contactEmail: data.contactEmail,
          socialLinks: data.socialLinks,
        }
      });
    }

    return NextResponse.json(settings);
  } catch (error) {
    console.error('Erreur mise à jour paramètres:', error);
    return NextResponse.json(
      { error: "Erreur lors de la mise à jour des paramètres" },
      { status: 500 }
    );
  }
} 