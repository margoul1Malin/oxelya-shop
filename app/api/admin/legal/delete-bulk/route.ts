import { NextResponse } from 'next/server';
import { verifyAuth } from '../../../../../lib/auth';
import prisma from '../../../../../lib/prisma';

export async function DELETE() {
  try {
    const user = await verifyAuth();
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Non autorisé' },
        { status: 401 }
      );
    }

    // Supprimer toutes les acceptations légales
    const result = await prisma.legalAcceptance.deleteMany({});

    return NextResponse.json({ 
      message: `${result.count} acceptation(s) légale(s) supprimée(s)`,
      deletedCount: result.count 
    });

  } catch (error) {
    console.error('Erreur suppression acceptations légales:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la suppression des acceptations légales' },
      { status: 500 }
    );
  }
} 