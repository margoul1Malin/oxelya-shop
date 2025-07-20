import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import prisma from '../../../../lib/prisma';
import { createNotification } from '../../../../lib/notifications';

// Force dynamic rendering for webhook
export const dynamic = 'force-dynamic';

const PAYPAL_WEBHOOK_ID = process.env.PAYPAL_WEBHOOK_ID;

// Fonction pour vérifier la signature PayPal
function verifyPayPalSignature(
  requestBody: string,
  signature: string,
  webhookId: string,
  certId: string,
  authAlgo: string,
  transmissionId: string,
  timestamp: string
): boolean {
  // Pour simplifier, on peut désactiver la vérification en développement
  // En production, il faut implémenter la vérification complète PayPal
  if (process.env.NODE_ENV === 'development') {
    console.log('Mode développement: signature PayPal non vérifiée');
    return true;
  }

  // TODO: Implémenter la vérification complète en production
  // https://developer.paypal.com/api/webhooks/v1/#verify-webhook-signature
  return true;
}

export async function POST(request: Request) {
  try {
    const body = await request.text();
    const headersList = headers();
    
    // Récupérer les headers PayPal pour la vérification
    const signature = headersList.get('paypal-transmission-sig');
    const certId = headersList.get('paypal-cert-id');
    const authAlgo = headersList.get('paypal-auth-algo');
    const transmissionId = headersList.get('paypal-transmission-id');
    const timestamp = headersList.get('paypal-transmission-time');

    console.log('=== WEBHOOK PAYPAL REÇU ===');
    console.log('Headers:', {
      signature,
      certId,
      authAlgo,
      transmissionId,
      timestamp
    });

    // Vérifier la signature PayPal
    if (!PAYPAL_WEBHOOK_ID) {
      console.error('PAYPAL_WEBHOOK_ID non configuré');
      return NextResponse.json({ error: 'Configuration webhook manquante' }, { status: 500 });
    }

    if (signature && certId && authAlgo && transmissionId && timestamp) {
      const isValid = verifyPayPalSignature(
        body,
        signature,
        PAYPAL_WEBHOOK_ID,
        certId,
        authAlgo,
        transmissionId,
        timestamp
      );

      if (!isValid) {
        console.error('Signature PayPal invalide');
        return NextResponse.json({ error: 'Signature invalide' }, { status: 400 });
      }
    }

    const event = JSON.parse(body);
    console.log('Événement PayPal:', event.event_type);
    console.log('Données:', JSON.stringify(event, null, 2));

    switch (event.event_type) {
      case 'CHECKOUT.ORDER.APPROVED':
        await handleOrderApproved(event);
        break;

      case 'PAYMENT.CAPTURE.COMPLETED':
        await handlePaymentCompleted(event);
        break;

      case 'PAYMENT.CAPTURE.DENIED':
      case 'PAYMENT.CAPTURE.DECLINED':
        await handlePaymentFailed(event);
        break;

      case 'PAYMENT.CAPTURE.REFUNDED':
        await handlePaymentRefunded(event);
        break;

      default:
        console.log(`Événement PayPal non traité: ${event.event_type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Erreur webhook PayPal:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

async function handleOrderApproved(event: any) {
  try {
    console.log('=== COMMANDE PAYPAL APPROUVÉE ===');
    const orderId = event.resource.id;
    console.log('Order ID:', orderId);

    // Pour l'instant on ne fait rien, la capture sera traitée séparément
    console.log('Commande approuvée, en attente de capture');
  } catch (error) {
    console.error('Erreur traitement commande approuvée:', error);
  }
}

async function handlePaymentCompleted(event: any) {
  try {
    console.log('=== PAIEMENT PAYPAL COMPLETÉ ===');
    const capture = event.resource;
    const orderId = capture.supplementary_data?.related_ids?.order_id;
    const captureId = capture.id;
    const amount = capture.amount.value;

    console.log('Capture ID:', captureId);
    console.log('Order ID:', orderId);
    console.log('Montant:', amount);

    if (!orderId) {
      console.error('Order ID manquant dans le webhook');
      return;
    }

    // Vérifier si la commande existe déjà
    const existingOrder = await prisma.order.findFirst({
      where: {
        paymentIntentId: orderId
      }
    });

    if (existingOrder) {
      console.log('Commande déjà existante:', existingOrder.id);
      
      // Mettre à jour le statut si nécessaire
      if (existingOrder.paymentStatus !== 'COMPLETED') {
        await prisma.order.update({
          where: { id: existingOrder.id },
          data: {
            paymentStatus: 'COMPLETED',
            status: 'PAID'
          }
        });

        // Notifier l'utilisateur
        await createNotification({
          userId: existingOrder.userId,
          title: 'Paiement confirmé',
          message: `Votre paiement PayPal de ${amount}€ a été confirmé. Commande: #${existingOrder.id}`,
          type: 'PAYMENT'
        });
      }
    } else {
      console.log('Commande non trouvée en base, sera créée lors de la capture côté client');
    }
  } catch (error) {
    console.error('Erreur traitement paiement completé:', error);
  }
}

async function handlePaymentFailed(event: any) {
  try {
    console.log('=== PAIEMENT PAYPAL ÉCHOUÉ ===');
    const capture = event.resource;
    const orderId = capture.supplementary_data?.related_ids?.order_id;
    const reason = capture.status_details?.reason || 'Raison inconnue';

    console.log('Order ID:', orderId);
    console.log('Raison:', reason);

    if (!orderId) return;

    // Trouver la commande
    const order = await prisma.order.findFirst({
      where: {
        paymentIntentId: orderId
      }
    });

    if (order) {
      // Mettre à jour le statut
      await prisma.order.update({
        where: { id: order.id },
        data: {
          paymentStatus: 'FAILED',
          status: 'CANCELLED'
        }
      });

      // Notifier l'utilisateur
      await createNotification({
        userId: order.userId,
        title: 'Paiement échoué',
        message: `Votre paiement PayPal a échoué. Raison: ${reason}. Commande: #${order.id}`,
        type: 'PAYMENT'
      });
    }
  } catch (error) {
    console.error('Erreur traitement paiement échoué:', error);
  }
}

async function handlePaymentRefunded(event: any) {
  try {
    console.log('=== REMBOURSEMENT PAYPAL ===');
    const refund = event.resource;
    const captureId = refund.links?.find((link: any) => link.rel === 'up')?.href?.split('/').pop();
    const amount = refund.amount.value;

    console.log('Capture ID:', captureId);
    console.log('Montant remboursé:', amount);

    // Trouver la commande via le capture ID (stocké dans paymentIntentId)
    const order = await prisma.order.findFirst({
      where: {
        paymentIntentId: { contains: captureId }
      }
    });

    if (order) {
      // Mettre à jour le statut
      await prisma.order.update({
        where: { id: order.id },
        data: {
          paymentStatus: 'REFUNDED',
          status: 'CANCELLED'
        }
      });

      // Notifier l'utilisateur
      await createNotification({
        userId: order.userId,
        title: 'Remboursement effectué',
        message: `Un remboursement de ${amount}€ a été effectué pour votre commande #${order.id}`,
        type: 'REFUND'
      });
    }
  } catch (error) {
    console.error('Erreur traitement remboursement:', error);
  }
} 