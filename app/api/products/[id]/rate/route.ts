import { NextResponse } from 'next/server';
import prisma from '../../../../../lib/prisma';
import { verifyAuth } from '../../../../../lib/auth';

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Vérifier l'authentification
    const user = await verifyAuth();
    
    if (!user) {
      return NextResponse.json(
        { error: "Vous devez être connecté pour noter un produit" },
        { status: 401 }
      );
    }

    const { rating } = await request.json();

    // Vérifier que le produit existe
    const product = await prisma.product.findUnique({
      where: { id: params.id }
    });

    if (!product) {
      return NextResponse.json(
        { error: "Produit non trouvé" },
        { status: 404 }
      );
    }

    // Créer ou mettre à jour la note
    const userRating = await prisma.rating.upsert({
      where: {
        userId_productId: {
          userId: user.id,
          productId: params.id
        }
      },
      update: {
        value: rating
      },
      create: {
        userId: user.id,
        productId: params.id,
        value: rating
      }
    });

    // Calculer la nouvelle moyenne
    const ratings = await prisma.rating.findMany({
      where: {
        productId: params.id
      }
    });

    const averageRating = Math.round(
      ratings.reduce((acc, r) => acc + r.value, 0) / ratings.length
    );

    // Mettre à jour la note moyenne du produit
    await prisma.product.update({
      where: { id: params.id },
      data: { rating: averageRating }
    });

    return NextResponse.json({ success: true, rating: averageRating });
  } catch (error) {
    console.error('Erreur notation produit:', error);
    return NextResponse.json(
      { error: "Erreur lors de la notation du produit" },
      { status: 500 }
    );
  }
} 