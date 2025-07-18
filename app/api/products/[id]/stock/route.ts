import { NextResponse } from 'next/server';
import prisma from '../../../../../lib/prisma';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const product = await prisma.product.findUnique({
      where: { id: params.id }
    });

    if (!product) {
      return NextResponse.json(
        { error: 'Produit non trouvé' },
        { status: 404 }
      );
    }

    // Pour l'instant, on retourne une valeur par défaut puisque le stock n'existe pas encore
    return NextResponse.json({ stock: 10 });
  } catch (error) {
    console.error('Erreur vérification stock:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la vérification du stock' },
      { status: 500 }
    );
  }
} 