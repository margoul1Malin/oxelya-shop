import { headers } from 'next/headers';
import { NextResponse } from 'next/server';
import { stripe } from '../../../../lib/stripe';
import prisma from '../../../../lib/prisma';
import Stripe from 'stripe';

export async function POST(request: Request) {
  try {
    console.log('=== WEBHOOK STRIPE REÇU ===');
    console.log('Headers:', Object.fromEntries(request.headers.entries()));
    console.log('URL:', request.url);
    
    const body = await request.text();
    const signature = request.headers.get('stripe-signature')!;
    
    if (!signature) {
      console.error('Signature Stripe manquante');
      return NextResponse.json({ error: 'Signature manquante' }, { status: 400 });
    }

    const event = stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET!);
    console.log('Webhook reçu:', event.type);

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session;
      console.log('Session complétée:', session.id);
      console.log('Métadonnées:', session.metadata);

      // Vérifier que les métadonnées existent
      if (!session.metadata?.userId || !session.metadata?.orderId) {
        console.error('Métadonnées utilisateur ou orderId manquantes');
        return NextResponse.json({ error: 'Métadonnées manquantes' }, { status: 400 });
      }

      // Récupérer la commande temporaire créée avant le paiement
      const tempOrder = await prisma.order.findUnique({
        where: { id: session.metadata.orderId },
        include: { items: true }
      });

      if (!tempOrder) {
        console.error('Commande temporaire non trouvée:', session.metadata.orderId);
        return NextResponse.json({ error: 'Commande temporaire non trouvée' }, { status: 400 });
      }

      console.log('Commande temporaire trouvée:', tempOrder.id);

      // Mettre à jour la commande avec le statut PAYÉ
      const updatedOrder = await prisma.order.update({
        where: { id: tempOrder.id },
        data: {
          status: 'PAID',
          paymentStatus: 'COMPLETED',
          paymentIntentId: session.payment_intent as string || null,
          updatedAt: new Date()
        },
        include: {
          items: true
        }
      });

      console.log('Commande mise à jour:', updatedOrder.id);

      // Générer automatiquement la facture
      try {
        const invoiceResponse = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/invoices/generate`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ orderId: updatedOrder.id }),
        });

        if (invoiceResponse.ok) {
          const invoiceData = await invoiceResponse.json();
          console.log('Facture générée:', invoiceData.invoice.invoiceNumber);
        } else {
          console.error('Erreur lors de la génération de la facture');
        }
      } catch (error) {
        console.error('Erreur lors de la génération de la facture:', error);
        // Continue même si la génération de facture échoue
      }

      // Créer les acceptations légales
      try {
        const documentTypes = ['CGV', 'PRIVACY_POLICY'];
        const documentVersion = '1.0';
        
        // Utiliser l'IP du client stockée dans les métadonnées
        const clientIp = session.metadata?.clientIp || 'Unknown';
        
        console.log('=== INFORMATION CLIENT ===');
        console.log('IP client (depuis métadonnées):', clientIp);
        
        const customerDetails = session.customer_details;
        const userAgent = `Stripe: ${customerDetails?.name || 'Anonymous'} - ${customerDetails?.email || 'No email'}`;

        const legalAcceptances = await Promise.all(
          documentTypes.map(async (docType) => {
            console.log(`Création d'une nouvelle acceptation ${docType} pour la commande ${updatedOrder.id}`);
            
            return await prisma.legalAcceptance.create({
              data: {
                userId: session.metadata!.userId,
                documentType: docType as any,
                documentVersion: documentVersion,
                ipAddress: clientIp,
                userAgent: userAgent,
                orderId: updatedOrder.id
              }
            });
          })
        );

        console.log('Acceptations légales traitées:', legalAcceptances.length);
      } catch (error) {
        console.error('Erreur lors de la création des acceptations légales:', error);
        // Continue même si les acceptations légales échouent
      }

      // Créer une notification
      await prisma.notification.create({
        data: {
          userId: session.metadata.userId,
          type: 'ORDER',
          title: 'Commande confirmée',
          message: `Votre commande #${updatedOrder.id.slice(-6).toUpperCase()} a été confirmée et est en cours de traitement.`,
          orderId: updatedOrder.id
        }
      });
      console.log('Notification créée pour:', session.metadata.userId);

    } else if (event.type === 'checkout.session.expired') {
      const session = event.data.object as Stripe.Checkout.Session;
      console.log('Session expirée:', session.id);
      
      // Supprimer la commande temporaire si elle existe
      if (session.metadata?.orderId) {
        try {
          await prisma.order.delete({
            where: { id: session.metadata.orderId }
          });
          console.log('Commande temporaire supprimée:', session.metadata.orderId);
        } catch (error) {
          console.error('Erreur lors de la suppression de la commande temporaire:', error);
        }
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Erreur webhook Stripe:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Erreur serveur' },
      { status: 400 }
    );
  }
} 