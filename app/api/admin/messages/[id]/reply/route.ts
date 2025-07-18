import { NextResponse } from 'next/server';
import prisma from '../../../../../../lib/prisma';
import { verifyAuth } from '../../../../../../lib/auth';
import { sendEmail, getReplyEmailTemplate } from '../../../../../../lib/email';

export async function POST(
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

    const { replyMessage } = await request.json();

    if (!replyMessage || !replyMessage.trim()) {
      return NextResponse.json(
        { error: 'Le message de réponse est requis' },
        { status: 400 }
      );
    }

    // Récupérer le message original
    const message = await prisma.message.findUnique({
      where: { id: params.id },
      include: {
        user: {
          select: {
            name: true,
            email: true
          }
        }
      }
    });

    if (!message) {
      return NextResponse.json(
        { error: 'Message non trouvé' },
        { status: 404 }
      );
    }

    // Créer le template HTML
    const htmlContent = getReplyEmailTemplate(
      message.user.name || 'Utilisateur',
      message.subject,
      replyMessage
    );

    // Envoyer l'email
    await sendEmail({
      to: message.user.email,
      subject: `Re: ${message.subject}`,
      html: htmlContent
    });

    // Mettre à jour le statut du message
    await prisma.message.update({
      where: { id: params.id },
      data: { 
        status: 'REPLIED',
        response: replyMessage
      }
    });

    return NextResponse.json({ 
      success: true, 
      message: 'Réponse envoyée avec succès' 
    });
  } catch (error) {
    console.error('Erreur envoi réponse:', error);
    return NextResponse.json(
      { error: 'Erreur lors de l\'envoi de la réponse' },
      { status: 500 }
    );
  }
} 