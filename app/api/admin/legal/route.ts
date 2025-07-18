import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../../lib/auth';
import prisma from '../../../../lib/prisma';

export async function GET(request: NextRequest) {
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

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const userId = searchParams.get('userId');
    const documentType = searchParams.get('documentType');

    const where: any = {};
    if (userId) where.userId = userId;
    if (documentType) where.documentType = documentType;

    // Récupérer les acceptations avec pagination
    const [acceptances, total] = await Promise.all([
      prisma.legalAcceptance.findMany({
        where,
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
              status: true
            }
          }
        },
        orderBy: {
          acceptedAt: 'desc'
        },
        skip: (page - 1) * limit,
        take: limit
      }),
      prisma.legalAcceptance.count({ where })
    ]);

    return NextResponse.json({
      acceptances,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Erreur lors de la récupération des acceptations légales:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
} 