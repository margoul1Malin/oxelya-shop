import { NextResponse } from 'next/server';
import prisma from '../../../../lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../../../lib/auth';

// Récupérer toutes les adresses
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Non autorisé' },
        { status: 401 }
      );
    }

    // Récupérer l'utilisateur à partir de l'email
    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Utilisateur non trouvé' },
        { status: 404 }
      );
    }

    // Récupérer uniquement les adresses de l'utilisateur connecté
    const addresses = await prisma.address.findMany({
      where: {
        userId: user.id
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json(addresses);
  } catch (error) {
    console.error('Erreur récupération adresses:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des adresses' },
      { status: 500 }
    );
  }
}

// Créer une nouvelle adresse
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Non autorisé' },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Utilisateur non trouvé' },
        { status: 404 }
      );
    }

    const data = await request.json();

    // Si c'est la première adresse ou si isDefault est true
    if (data.isDefault) {
      // Mettre à jour toutes les autres adresses de l'utilisateur
      await prisma.$transaction([
        // D'abord, mettre toutes les adresses existantes à non-défaut
        prisma.address.updateMany({
          where: {
            userId: user.id,
            isDefault: true
          },
          data: {
            isDefault: false
          }
        }),
        // Ensuite, créer la nouvelle adresse
        prisma.address.create({
          data: {
            ...data,
            userId: user.id
          }
        })
      ]);

      return NextResponse.json({ message: 'Adresse créée avec succès' });
    } else {
      // Création simple sans modification des autres adresses
      const address = await prisma.address.create({
        data: {
          ...data,
          userId: user.id
        }
      });

      return NextResponse.json(address);
    }
  } catch (error) {
    console.error('Erreur création adresse:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la création de l\'adresse' },
      { status: 500 }
    );
  }
} 