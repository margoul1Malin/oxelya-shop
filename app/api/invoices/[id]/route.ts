import { NextResponse } from 'next/server';
import { verifyAuth } from '../../../../lib/auth';
import prisma from '../../../../lib/prisma';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await verifyAuth();
    if (!user) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const invoice = await prisma.invoice.findUnique({
      where: { id: params.id },
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

    if (!invoice) {
      return NextResponse.json({ error: 'Facture non trouvée' }, { status: 404 });
    }

    // Vérifier que l'utilisateur peut accéder à cette facture
    if (invoice.userId !== user.id && user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Accès non autorisé' }, { status: 403 });
    }

    return NextResponse.json(invoice);
  } catch (error) {
    console.error('Erreur récupération facture:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération de la facture' },
      { status: 500 }
    );
  }
} 