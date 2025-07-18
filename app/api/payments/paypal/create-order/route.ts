import { NextResponse } from 'next/server';
import { verifyAuth } from '../../../../../lib/auth';

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

    const { items, shippingAddress } = await request.json();

    // Validation des variables d'environnement
    if (!PAYPAL_CLIENT_ID || !PAYPAL_CLIENT_SECRET) {
      console.error('Variables PayPal manquantes:', {
        clientId: !!PAYPAL_CLIENT_ID,
        clientSecret: !!PAYPAL_CLIENT_SECRET
      });
      return NextResponse.json(
        { error: 'Configuration PayPal manquante' },
        { status: 500 }
      );
    }

    // Calculer le total
    const total = items.reduce((sum: number, item: any) => sum + item.price * item.quantity, 0);

    console.log('=== CRÉATION COMMANDE PAYPAL API ===');
    console.log('Items:', items);
    console.log('Total:', total);
    console.log('Adresse:', shippingAddress);

    // Obtenir le token d'accès
    const accessToken = await getPayPalAccessToken();

    // Détecter l'URL d'origine pour les URLs de retour
    const forwardedHost = request.headers.get('x-forwarded-host');
    const host = request.headers.get('host');
    const forwardedProto = request.headers.get('x-forwarded-proto');
    const protocol = forwardedProto || (request.url.startsWith('https') ? 'https' : 'http');
    
    let origin;
    if (forwardedHost) {
      origin = `${protocol}://${forwardedHost}`;
    } else if (host && !host.includes('0.0.0.0')) {
      origin = `${protocol}://${host}`;
    } else {
      const url = new URL(request.url);
      origin = `${url.protocol}//${url.host}`;
    }

    // Créer la commande PayPal
    const orderData = {
      intent: 'CAPTURE',
      purchase_units: [
        {
          amount: {
            currency_code: 'EUR',
            value: total.toFixed(2),
            breakdown: {
              item_total: {
                currency_code: 'EUR',
                value: total.toFixed(2)
              }
            }
          },
          items: items.map((item: any) => ({
            name: item.name,
            description: item.description || '',
            unit_amount: {
              currency_code: 'EUR',
              value: item.price.toFixed(2)
            },
            quantity: item.quantity.toString()
          })),
          shipping: shippingAddress ? {
            name: {
              full_name: `${shippingAddress.firstName} ${shippingAddress.lastName}`
            },
            address: {
              address_line_1: shippingAddress.address,
              address_line_2: shippingAddress.addressComplement || '',
              admin_area_2: shippingAddress.city,
              postal_code: shippingAddress.postalCode,
              country_code: shippingAddress.country || 'FR'
            }
          } : undefined
        }
      ],
      application_context: {
        brand_name: 'Margoul1 Store',
        locale: 'fr-FR',
        landing_page: 'BILLING',
        shipping_preference: 'SET_PROVIDED_ADDRESS',
        user_action: 'PAY_NOW',
        return_url: `${origin}/checkout/success`,
        cancel_url: `${origin}/checkout`
      }
    };

    console.log('Données commande PayPal:', JSON.stringify(orderData, null, 2));

    const response = await fetch(`${PAYPAL_BASE_URL}/v2/checkout/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
        'PayPal-Request-Id': `order-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      },
      body: JSON.stringify(orderData),
    });

    const paypalOrder = await response.json();
    console.log('Réponse PayPal:', paypalOrder);

    if (!response.ok) {
      console.error('Erreur PayPal:', paypalOrder);
      throw new Error(paypalOrder.details?.[0]?.description || 'Erreur lors de la création de la commande PayPal');
    }

    // Stocker les informations dans les métadonnées pour le webhook
    const metadata = {
      userId: user.id,
      userEmail: user.email,
      items: JSON.stringify(items),
      shippingAddress: JSON.stringify(shippingAddress),
      total: total.toString(),
      createdAt: new Date().toISOString()
    };

    console.log('Commande PayPal créée:', paypalOrder.id);
    console.log('Métadonnées:', metadata);

    return NextResponse.json({ 
      orderId: paypalOrder.id,
      approvalUrl: paypalOrder.links.find((link: any) => link.rel === 'approve')?.href
    });
  } catch (error: any) {
    console.error('Erreur création commande PayPal:', error);
    return NextResponse.json(
      { error: error.message || 'Erreur lors de la création de la commande PayPal' },
      { status: 500 }
    );
  }
} 