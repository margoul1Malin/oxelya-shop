import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { verifyAuth } from '../../../../../lib/auth';
import { getServerStripe } from '../../../../../lib/stripe';
import prisma from '../../../../../lib/prisma';

export async function POST(request: Request) {
  try {
    const user = await verifyAuth();
    if (!user) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const { items, shippingAddress } = await request.json();
    
    // Calculer le total
    const total = items.reduce((sum: number, item: any) => sum + (item.price * item.quantity), 0);

    // Créer un identifiant de commande unique pour Stripe
    const orderNumber = `order_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Utiliser l'adresse JSON directement
    const shippingAddressString = shippingAddress || 'Adresse non fournie';

    // Récupérer l'IP réelle du client (pas du serveur)
    const clientForwardedFor = request.headers.get('x-forwarded-for');
    const clientRealIp = request.headers.get('x-real-ip');
    const clientCfIp = request.headers.get('cf-connecting-ip');
    
    let clientIp = 'Unknown';
    if (clientForwardedFor) {
      // Prendre la première IP dans la liste (l'IP du client original)
      clientIp = clientForwardedFor.split(',')[0].trim();
    } else if (clientRealIp) {
      clientIp = clientRealIp;
    } else if (clientCfIp) {
      clientIp = clientCfIp;
    }
    
    console.log('=== IP CLIENT DÉTECTÉE ===');
    console.log('X-Forwarded-For:', clientForwardedFor);
    console.log('X-Real-IP:', clientRealIp);
    console.log('CF-Connecting-IP:', clientCfIp);
    console.log('IP client utilisée:', clientIp);

    // Détecter l'URL d'origine de la requête
    const forwardedHost = request.headers.get('x-forwarded-host');
    const host = request.headers.get('host');
    const forwardedProto = request.headers.get('x-forwarded-proto');
    const protocol = forwardedProto || (request.url.startsWith('https') ? 'https' : 'http');
    
    // Prioriser l'host réel de la requête
    let origin;
    if (forwardedHost) {
      origin = `${protocol}://${forwardedHost}`;
    } else if (host && !host.includes('0.0.0.0')) {
      origin = `${protocol}://${host}`;
    } else {
      // Fallback vers l'URL de la requête
      const url = new URL(request.url);
      origin = `${url.protocol}//${url.host}`;
    }
    
    console.log('=== CRÉATION SESSION STRIPE ===');
    console.log('URL de la requête:', request.url);
    console.log('Headers - Host:', host);
    console.log('Headers - X-Forwarded-Host:', forwardedHost);
    console.log('Headers - X-Forwarded-Proto:', forwardedProto);
    console.log('Origin final utilisé:', origin);

    const stripe = getServerStripe();

    // Créer une commande temporaire dans la base de données
    const tempOrder = await prisma.order.create({
      data: {
        userId: user.id,
        total: total,
        status: 'PENDING',
        paymentMethod: 'STRIPE',
        shippingAddress: shippingAddressString,
        items: {
          create: items.map((item: any) => ({
            productId: item.id,
            quantity: item.quantity,
            price: item.price
          }))
        }
      }
    });

    const stripeSession = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: items.map((item: any) => ({
        price_data: {
          currency: 'eur',
          product_data: {
            name: item.name,
            images: item.image ? [new URL(item.image, origin).toString()] : [],
          },
          unit_amount: Math.round(item.price * 100),
        },
        quantity: item.quantity,
      })),
      mode: 'payment',
      locale: 'fr',
      success_url: `${origin}/commandes/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/panier/canceled`,
      customer_email: user.email,
      metadata: {
        orderId: tempOrder.id, // Utiliser l'ID MongoDB généré automatiquement
        orderNumber: orderNumber, // Garder le numéro personnalisé dans les métadonnées
        userId: user.id,
        total: total.toString(),
        itemCount: items.length.toString(),
        clientIp: clientIp
      }
    });

    console.log('URLs de redirection configurées:');
    console.log('- Success URL:', `${origin}/commandes/success?session_id={CHECKOUT_SESSION_ID}`);
    console.log('- Cancel URL:', `${origin}/panier/canceled`);
    console.log('Session Stripe créée:', stripeSession.id);
    console.log('Commande temporaire créée:', tempOrder.id);
    console.log('Numéro de commande:', orderNumber);
    console.log('=== FIN CRÉATION SESSION ===');

    return NextResponse.json({ url: stripeSession.url });
  } catch (error) {
    console.error('Erreur Stripe:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Erreur serveur' },
      { status: 500 }
    );
  }
}