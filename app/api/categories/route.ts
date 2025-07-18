import { NextResponse } from 'next/server';
import prisma from '../../../lib/prisma';

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

export async function GET() {
  try {
    const categories = await prisma.category.findMany({
      include: {
        products: {
          select: {
            id: true,
            name: true,
            price: true,
            image: true,
            rating: true,
            isNew: true,
            isCreated: true
          },
          take: 4, // Limiter à 4 produits par catégorie pour la page d'aperçu
          orderBy: {
            createdAt: 'desc'
          }
        },
        _count: {
          select: {
            products: true
          }
        }
      },
      orderBy: { name: 'asc' }
    });

    return NextResponse.json(categories);
  } catch (error) {
    console.error('Erreur récupération catégories:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
} 