import { NextResponse } from 'next/server';
import { verifyAuth } from '../../../../../lib/auth';
import prisma from '../../../../../lib/prisma';

export async function DELETE(request: Request) {
  try {
    const user = await verifyAuth();
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Non autorisé' },
        { status: 401 }
      );
    }

    const { status } = await request.json();

    if (!status) {
      return NextResponse.json(
        { error: 'Statut requis' },
        { status: 400 }
      );
    }

    // Supprimer toutes les commandes avec le statut spécifié
    const result = await prisma.order.deleteMany({
      where: {
        status: status
      }
    });

    return NextResponse.json({ 
      message: `${result.count} commande(s) supprimée(s)`,
      deletedCount: result.count 
    });

  } catch (error) {
    console.error('Erreur suppression commandes:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la suppression des commandes' },
      { status: 500 }
    );
  }
} 