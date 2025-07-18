import { NextResponse } from 'next/server';
import { verifyAuth } from '../../../../lib/auth';
import prisma from '../../../../lib/prisma';

export async function GET(request: Request) {
  try {
    const user = await verifyAuth();
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Accès non autorisé' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') || 'all';

    const skip = (page - 1) * limit;

    // Construire les conditions de recherche
    const where: any = {};

    if (search) {
      where.OR = [
        { invoiceNumber: { contains: search, mode: 'insensitive' } },
        { order: { id: { contains: search, mode: 'insensitive' } } },
        { user: { name: { contains: search, mode: 'insensitive' } } },
        { user: { email: { contains: search, mode: 'insensitive' } } }
      ];
    }

    if (status !== 'all') {
      where.paymentStatus = status;
    }

    // Compter le total pour la pagination
    const total = await prisma.invoice.count({ where });

    // Récupérer les factures avec pagination
    const invoices = await prisma.invoice.findMany({
      where,
      include: {
        order: {
          select: {
            id: true,
            status: true
          }
        },
        user: {
          select: {
            name: true,
            email: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      skip,
      take: limit
    });

    return NextResponse.json({
      success: true,
      invoices,
      total,
      page,
      totalPages: Math.ceil(total / limit)
    });

  } catch (error) {
    console.error('Erreur récupération factures admin:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des factures' },
      { status: 500 }
    );
  }
} 