import { NextResponse } from 'next/server';
import prisma from '../../../../lib/prisma';
import { verifyAuth } from '../../../../lib/auth';

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

export async function GET() {
  try {
    const user = await verifyAuth();
    if (!user) {
      return NextResponse.json(
        { error: 'Non autorisé' },
        { status: 401 }
      );
    }

    const [orders, notifications, addresses] = await Promise.all([
      prisma.order.count({
        where: { userId: user.id }
      }),
      prisma.notification.count({
        where: { userId: user.id }
      }),
      prisma.address.count({
        where: { userId: user.id }
      })
    ]);

    return NextResponse.json({
      orders,
      notifications,
      addresses
    });
  } catch (error) {
    console.error('Erreur récupération statistiques:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des statistiques' },
      { status: 500 }
    );
  }
} 