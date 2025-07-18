import { NextResponse } from 'next/server';
import { verifyAuth } from '../../../../../lib/auth';
import prisma from '../../../../../lib/prisma';
import { createNotification } from '../../../../../lib/notifications';

const PAYPAL_BASE_URL = process.env.PAYPAL_BASE_URL || 'https://api-m.sandbox.paypal.com';
const PAYPAL_CLIENT_ID = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID;
const PAYPAL_CLIENT_SECRET = process.env.PAYPAL_CLIENT_SECRET;

// Fonction pour obtenir un token d'accès PayPal
async function getPayPalAccessToken() {
  const response = await fetch(`${PAYPAL_BASE_URL}/v1/oauth2/token`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Authorization': `Basic ${Buffer.from(`${PAYPAL_CLIENT_ID}:${PAYPAL_CLIENT_SECRET}`).toString('base64')}`,
    },
    body: 'grant_type=client_credentials',
  });

  if (!response.ok) {
    throw new Error('Erreur lors de l\'authentification PayPal');
  }

  const data = await response.json();
  return data.access_token;
}

export async function POST(request: Request) {
  try {
    const user = await verifyAuth();
    if (!user) {
      return NextResponse.json(
        { error: "Vous devez être connecté" },
        { status: 401 }
      );
    }

    const { orderId } = await request.json();

    if (!orderId) {
      return NextResponse.json(
        { error: 'ID de commande PayPal manquant' },
        { status: 400 }
      );
    }

    console.log('=== CAPTURE COMMANDE PAYPAL ===');
    console.log('OrderID:', orderId);
    console.log('User:', user.email);

    // Obtenir le token d'accès
    const accessToken = await getPayPalAccessToken();

    // Capturer le paiement avec PayPal
    const response = await fetch(`${PAYPAL_BASE_URL}/v2/checkout/orders/${orderId}/capture`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
        'PayPal-Request-Id': `capture-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      },
    });

    const captureData = await response.json();
    console.log('Réponse capture PayPal:', captureData);

    if (!response.ok) {
      console.error('Erreur capture PayPal:', captureData);
      throw new Error(captureData.details?.[0]?.description || 'Erreur lors de la capture du paiement PayPal');
    }

    // Vérifier que le paiement est completé
    if (captureData.status !== 'COMPLETED') {
      throw new Error(`Paiement PayPal non completé. Statut: ${captureData.status}`);
    }

    // Récupérer les détails de la commande PayPal pour obtenir les items
    const orderResponse = await fetch(`${PAYPAL_BASE_URL}/v2/checkout/orders/${orderId}`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    });

    const orderDetails = await response.ok ? await orderResponse.json() : null;
    console.log('Détails commande PayPal:', orderDetails);

    // Récupérer les informations depuis localStorage côté client ou utiliser les détails PayPal
    const cartItems = request.headers.get('x-cart-items');
    const shippingAddress = request.headers.get('x-shipping-address');

    let items = [];
    let shipping = null;
    let total = 0;

    if (cartItems && shippingAddress) {
      // Utiliser les données du client
      items = JSON.parse(cartItems);
      shipping = JSON.parse(shippingAddress);
      total = items.reduce((sum: number, item: any) => sum + item.price * item.quantity, 0);
    } else if (orderDetails && orderDetails.purchase_units?.[0]) {
      // Fallback: utiliser les données PayPal
      const purchaseUnit = orderDetails.purchase_units[0];
      total = parseFloat(purchaseUnit.amount.value);
      
      if (purchaseUnit.items) {
        items = purchaseUnit.items.map((item: any) => ({
          id: item.reference_id || `paypal-${Date.now()}`,
          name: item.name,
          price: parseFloat(item.unit_amount.value),
          quantity: parseInt(item.quantity),
          description: item.description
        }));
      }

      if (purchaseUnit.shipping) {
        shipping = {
          firstName: purchaseUnit.shipping.name?.given_name || '',
          lastName: purchaseUnit.shipping.name?.surname || '',
          address: purchaseUnit.shipping.address?.address_line_1 || '',
          addressComplement: purchaseUnit.shipping.address?.address_line_2 || '',
          city: purchaseUnit.shipping.address?.admin_area_2 || '',
          postalCode: purchaseUnit.shipping.address?.postal_code || '',
          country: purchaseUnit.shipping.address?.country_code || 'FR'
        };
      }
    }

    // Créer la commande dans la base de données
    const order = await prisma.order.create({
      data: {
        userId: user.id,
        total,
        status: 'PAID',
        paymentMethod: 'PAYPAL',
        paymentStatus: 'COMPLETED',
        paymentIntentId: orderId, // ID de la commande PayPal
        shippingAddress: JSON.stringify(shipping),
        items: {
          create: items.map((item: any) => ({
            productId: item.id,
            quantity: item.quantity,
            price: item.price
          }))
        }
      },
      include: {
        items: {
          include: {
            product: true
          }
        }
      }
    });

    console.log('Commande créée en base:', order.id);

    // Créer une notification pour l'utilisateur
    await createNotification({
      userId: user.id,
      title: 'Commande confirmée',
      message: `Votre commande #${order.id} a été confirmée et payée via PayPal. Montant: ${total.toFixed(2)}€`,
      type: 'ORDER'
    });

    // Créer une notification pour les admins
    const adminUsers = await prisma.user.findMany({
      where: { role: 'ADMIN' }
    });

    for (const admin of adminUsers) {
      await createNotification({
        userId: admin.id,
        title: 'Nouvelle commande PayPal',
        message: `Nouvelle commande #${order.id} de ${user.email} via PayPal. Montant: ${total.toFixed(2)}€`,
        type: 'ORDER'
      });
    }

    return NextResponse.json({
      success: true,
      orderId: order.id,
      paypalOrderId: orderId,
      captureId: captureData.purchase_units?.[0]?.payments?.captures?.[0]?.id,
      status: captureData.status,
      total
    });
  } catch (error: any) {
    console.error('Erreur capture PayPal:', error);
    return NextResponse.json(
      { error: error.message || 'Erreur lors de la capture du paiement PayPal' },
      { status: 500 }
    );
  }
} 