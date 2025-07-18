import { NextResponse } from 'next/server';
import prisma from '../../../lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../../lib/auth';
import { sendEmail, getNewMessageEmailTemplate } from '../../../lib/email';

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Vous devez être connecté pour envoyer un message" },
        { status: 401 }
      );
    }

    // Récupérer l'utilisateur
    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user) {
      return NextResponse.json(
        { error: "Utilisateur non trouvé" },
        { status: 404 }
      );
    }

    const { subject, content } = await request.json();

    if (!subject || !content) {
      return NextResponse.json(
        { error: "Le sujet et le contenu sont requis" },
        { status: 400 }
      );
    }

    const message = await prisma.message.create({
      data: {
        subject,
        content,
        userId: user.id,
        status: 'UNREAD'
      }
    });

    // Envoyer un email de notification à l'admin
    try {
      const adminEmail = process.env.ADMIN_EMAIL || process.env.SMTP_USER;
      if (adminEmail) {
        const emailHtml = getNewMessageEmailTemplate(
          user.name || user.email,
          subject,
          content
        );
        
        await sendEmail({
          to: adminEmail,
          subject: `Nouveau message de contact: ${subject}`,
          html: emailHtml
        });
      }
    } catch (emailError) {
      console.error('Erreur envoi email notification:', emailError);
      // Ne pas faire échouer la création du message si l'email échoue
    }

    return NextResponse.json(message);
  } catch (error) {
    console.error('Erreur création message:', error);
    return NextResponse.json(
      { error: "Erreur lors de l'envoi du message" },
      { status: 500 }
    );
  }
} 