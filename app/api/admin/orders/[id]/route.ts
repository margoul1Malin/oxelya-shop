import { NextResponse } from 'next/server';
import prisma from '../../../../../lib/prisma';
import { getServerSession } from 'next-auth/next';
import { verifyAuth } from '../../../../../lib/auth';
import { createOrderStatusNotification } from '../../../../../lib/notifications';

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await verifyAuth();
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Non autorisé' },
        { status: 401 }
      );
    }

    const { status } = await request.json();

    // Récupérer la commande avec les informations de l'utilisateur
    const order = await prisma.order.findUnique({
      where: { id: params.id },
      include: {
        user: true
      }
    });

    if (!order) {
      return NextResponse.json(
        { error: 'Commande non trouvée' },
        { status: 404 }
      );
    }

    // Mettre à jour le statut de la commande
    const updatedOrder = await prisma.order.update({
      where: { id: params.id },
      data: { status },
      include: {
        user: true,
        items: {
          include: {
            product: true
          }
        }
      }
    });

    // Créer une notification pour l'utilisateur qui a passé la commande
    await createOrderStatusNotification({
      userId: order.userId,
      orderId: order.id,
      status,
      orderNumber: order.id // Utiliser l'ID complet comme numéro de commande
    });

    return NextResponse.json(updatedOrder);
  } catch (error) {
    console.error('Erreur mise à jour commande:', error);
    return NextResponse.json(
      { error: "Erreur lors de la mise à jour de la commande" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await verifyAuth();
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Non autorisé' },
        { status: 401 }
      );
    }

    // Supprimer d'abord les items de la commande
    await prisma.orderItem.deleteMany({
      where: { orderId: params.id }
    });

    // Puis supprimer la commande
    await prisma.order.delete({
      where: { id: params.id }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Erreur suppression commande:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la suppression de la commande' },
      { status: 500 }
    );
  }
}

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await verifyAuth();
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Non autorisé' },
        { status: 401 }
      );
    }

    const order = await prisma.order.findUnique({
      where: { id: params.id },
      include: {
        user: true,
        items: {
          include: {
            product: true
          }
        },
        legalAcceptances: {
          orderBy: {
            acceptedAt: 'asc'
          }
        }
      }
    });

    if (!order) {
      return NextResponse.json(
        { error: 'Commande non trouvée' },
        { status: 404 }
      );
    }

    return NextResponse.json(order);
  } catch (error) {
    console.error('Erreur:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
} 