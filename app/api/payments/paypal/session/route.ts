import { NextResponse } from 'next/server';
import { verifyAuth } from '../../../../../lib/auth';
import prisma from '../../../../../lib/prisma';

export async function POST(request: Request) {
  try {
    const user = await verifyAuth();
    if (!user) {
      return NextResponse.json(
        { error: "Vous devez être connecté" },
        { status: 401 }
      );
    }

    const { items, shippingAddress } = await request.json();

    // Créer la commande en attente
    const order = await prisma.order.create({
      data: {
        userId: user.id,
        total: items.reduce((acc: number, item: any) => acc + (item.price * item.quantity), 0),
        status: 'PENDING',
        paymentMethod: 'PAYPAL',
        paymentStatus: 'PENDING',
        shippingAddress: JSON.stringify(shippingAddress),
        items: {
          create: items.map((item: any) => ({
            productId: item.id,
            quantity: item.quantity,
            price: item.price
          }))
        }
      }
    });

    // Formater les données pour PayPal
    const paypalOrder = {
      orderId: order.id,
      items: items.map((item: any) => ({
        name: item.name,
        description: item.description || '',
        quantity: item.quantity,
        unit_amount: {
          currency_code: 'EUR',
          value: item.price.toString()
        }
      })),
      total: order.total
    };

    return NextResponse.json(paypalOrder);
  } catch (error: any) {
    console.error('Erreur création session PayPal:', error);
    return NextResponse.json(
      { error: error.message || "Erreur lors de la création de la session" },
      { status: 500 }
    );
  }
} 