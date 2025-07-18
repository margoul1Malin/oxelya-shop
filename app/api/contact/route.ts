import { NextResponse } from 'next/server';
import prisma from '../../../lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../../lib/auth';

export async function POST(req: Request) {
  try {
    // Vérifier que l'utilisateur est connecté
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Vous devez être connecté pour envoyer un message' },
        { status: 401 }
      );
    }

    // Récupérer l'utilisateur connecté
    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Utilisateur non trouvé' },
        { status: 404 }
      );
    }

    const { subject, content } = await req.json();

    if (!subject || !content) {
      return NextResponse.json(
        { error: 'Le sujet et le contenu sont requis' },
        { status: 400 }
      );
    }

    const message = await prisma.message.create({
      data: {
        subject,
        content,
        userId: user.id // Utiliser l'ID de l'utilisateur connecté
      }
    });

    return NextResponse.json(
      { message: 'Message envoyé avec succès' },
      { status: 201 }
    );
  } catch (error) {
    console.error('Erreur envoi message contact:', error);
    return NextResponse.json(
      { error: 'Erreur lors de l\'envoi du message' },
      { status: 500 }
    );
  }
} 