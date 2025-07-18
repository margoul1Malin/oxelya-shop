import { NextResponse } from 'next/server';
import prisma from '../../../lib/prisma';
import { verifyAuth } from '../../../lib/auth';

export async function POST(request: Request) {
  try {
    const user = await verifyAuth();
    if (!user) {
      return NextResponse.json(
        { error: "Vous devez être connecté" },
        { status: 401 }
      );
    }

    const { items, shippingAddress, paymentIntentId, paymentMethod, total } = await request.json();

    // Vérifier que le total correspond
    const calculatedTotal = items.reduce(
      (acc: number, item: any) => acc + (item.price * item.quantity),
      0
    );

    if (Math.abs(calculatedTotal - total) > 0.01) {
      throw new Error('Le total ne correspond pas');
    }

    // Créer la commande
    const order = await prisma.order.create({
      data: {
        userId: user.id,
        total,
        shippingAddress: JSON.stringify(shippingAddress),
        paymentIntentId,
        paymentMethod,
        paymentStatus: 'COMPLETED',
        items: {
          create: items.map((item: any) => ({
            productId: item.id,
            quantity: item.quantity,
            price: item.price
          }))
        }
      },
      include: {
        items: true
      }
    });

    return NextResponse.json(order);
  } catch (error) {
    console.error('Erreur création commande:', error);
    return NextResponse.json(
      { error: "Erreur lors de la création de la commande" },
      { status: 500 }
    );
  }
} 