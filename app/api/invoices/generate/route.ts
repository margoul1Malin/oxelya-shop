import { NextResponse } from 'next/server';
import prisma from '../../../../lib/prisma';

export async function POST(request: Request) {
  try {
    const { orderId } = await request.json();

    if (!orderId) {
      return NextResponse.json({ error: 'OrderId requis' }, { status: 400 });
    }

    // Récupérer la commande avec tous les détails
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        items: {
          include: {
            product: true
          }
        },
        user: true
      }
    });

    if (!order) {
      return NextResponse.json({ error: 'Commande non trouvée' }, { status: 404 });
    }

    // Vérifier que la commande est payée
    if (order.status !== 'PAID') {
      return NextResponse.json({ error: 'La commande doit être payée pour générer une facture' }, { status: 400 });
    }

    // Vérifier si une facture existe déjà pour cette commande
    const existingInvoice = await prisma.invoice.findFirst({
      where: { orderId: orderId }
    });

    if (existingInvoice) {
      return NextResponse.json({ error: 'Une facture existe déjà pour cette commande' }, { status: 400 });
    }

    // Générer le numéro de facture unique (format: YYYY-XXXX)
    const currentYear = new Date().getFullYear();
    const lastInvoice = await prisma.invoice.findFirst({
      where: {
        invoiceNumber: {
          startsWith: currentYear.toString()
        }
      },
      orderBy: {
        invoiceNumber: 'desc'
      }
    });

    let invoiceNumber;
    if (lastInvoice) {
      const lastNumber = parseInt(lastInvoice.invoiceNumber.split('-')[1]);
      invoiceNumber = `${currentYear}-${(lastNumber + 1).toString().padStart(4, '0')}`;
    } else {
      invoiceNumber = `${currentYear}-0001`;
    }

    // Calculer les totaux
    const totalHT = order.total; // Auto-entrepreneur = pas de TVA
    const totalTTC = order.total;
    const tvaRate = 0; // Auto-entrepreneur

    // Date d'échéance (30 jours)
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 30);

    // Créer la facture
    const invoice = await prisma.invoice.create({
      data: {
        invoiceNumber,
        orderId: order.id,
        userId: order.userId,
        totalHT,
        totalTTC,
        tvaRate,
        dueDate,
        paymentStatus: 'COMPLETED', // Déjà payé
        tvaNote: 'TVA non applicable, art. 293 B du CGI',
        items: {
          create: order.items.map(item => ({
            label: item.product?.name || 'Produit non disponible',
            quantity: item.quantity,
            unitPrice: item.price,
            totalPrice: item.price * item.quantity
          }))
        }
      },
      include: {
        items: true,
        order: {
          include: {
            user: true
          }
        },
        user: true
      }
    });

    // Créer une notification pour informer l'utilisateur
    await prisma.notification.create({
      data: {
        userId: order.userId,
        type: 'ORDER',
        title: 'Facture générée',
        message: `Votre facture ${invoiceNumber} a été générée pour votre commande #${order.id.slice(-8)}.`,
        orderId: order.id
      }
    });

    return NextResponse.json({
      success: true,
      invoice: {
        id: invoice.id,
        invoiceNumber: invoice.invoiceNumber,
        totalTTC: invoice.totalTTC,
        dueDate: invoice.dueDate
      }
    });

  } catch (error) {
    console.error('Erreur génération facture:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la génération de la facture' },
      { status: 500 }
    );
  }
} 