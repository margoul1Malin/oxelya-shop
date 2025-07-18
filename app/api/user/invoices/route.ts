import { NextResponse } from 'next/server';
import { verifyAuth } from '../../../../lib/auth';
import prisma from '../../../../lib/prisma';

export async function GET() {
  try {
    const user = await verifyAuth();
    if (!user) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const invoices = await prisma.invoice.findMany({
      where: {
        userId: user.id
      },
      include: {
        order: {
          select: {
            id: true,
            status: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json({
      success: true,
      invoices: invoices
    });

  } catch (error) {
    console.error('Erreur récupération factures:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des factures' },
      { status: 500 }
    );
  }
} 