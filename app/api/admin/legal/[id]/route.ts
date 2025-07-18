import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../../../lib/auth';
import prisma from '../../../../../lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Non autorisé' },
        { status: 401 }
      );
    }

    // Vérifier que l'utilisateur est admin
    const user = await prisma.user.findUnique({
      where: { id: session.user.id }
    });

    if (user?.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Accès refusé' },
        { status: 403 }
      );
    }

    // Récupérer l'acceptation légale avec toutes les informations
    const acceptance = await prisma.legalAcceptance.findUnique({
      where: { id: params.id },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true
          }
        },
        order: {
          select: {
            id: true,
            total: true,
            status: true,
            createdAt: true,
            paymentMethod: true
          }
        }
      }
    });

    if (!acceptance) {
      return NextResponse.json(
        { error: 'Acceptation légale non trouvée' },
        { status: 404 }
      );
    }

    return NextResponse.json(acceptance);

  } catch (error) {
    console.error('Erreur lors de la récupération de l\'acceptation légale:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Non autorisé' },
        { status: 401 }
      );
    }

    // Vérifier que l'utilisateur est admin
    const user = await prisma.user.findUnique({
      where: { id: session.user.id }
    });

    if (user?.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Accès refusé' },
        { status: 403 }
      );
    }

    // Supprimer l'acceptation légale
    await prisma.legalAcceptance.delete({
      where: { id: params.id }
    });

    return NextResponse.json({ 
      message: 'Acceptation légale supprimée avec succès' 
    });

  } catch (error) {
    console.error('Erreur lors de la suppression de l\'acceptation légale:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
} 