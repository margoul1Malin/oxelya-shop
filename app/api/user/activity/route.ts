import { NextResponse } from 'next/server';
import prisma from '../../../../lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../../lib/auth';

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json([], { status: 401 });
    }

    // Récupérer les dernières commandes
    const orders = await prisma.order.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: 'desc' },
      take: 5,
      include: {
        items: {
          include: {
            product: {
              select: {
                name: true,
                image: true
              }
            }
          }
        }
      }
    });

    // Récupérer les dernières notifications
    const notifications = await prisma.notification.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: 'desc' },
      take: 5
    });

    // S'assurer que nous avons des tableaux même si les requêtes échouent
    const safeOrders = Array.isArray(orders) ? orders : [];
    const safeNotifications = Array.isArray(notifications) ? notifications : [];

    // Combiner et trier les activités
    const activities = [
      ...safeOrders.map(order => ({
        type: 'ORDER',
        id: order.id,
        title: `Commande #${order.id}`,
        description: `${order.items.length} article(s) - ${(order.total / 100).toFixed(2)}€`,
        status: order.status,
        createdAt: order.createdAt,
        data: order
      })),
      ...safeNotifications.map(notif => ({
        type: 'NOTIFICATION',
        id: notif.id,
        title: notif.title,
        description: notif.message,
        createdAt: notif.createdAt,
        data: notif
      }))
    ].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
    .slice(0, 10);

    return NextResponse.json(activities);
  } catch (error) {
    console.error('Erreur récupération activité:', error);
    return NextResponse.json([], { status: 500 });
  }
} 