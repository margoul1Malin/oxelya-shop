import { NextResponse } from 'next/server';
import prisma from '../../../lib/prisma';
import { verifyAuth } from '../../../lib/auth';

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

export async function POST(request: Request) {
  try {
    // Vérifier que l'utilisateur est connecté et est admin
    const user = await verifyAuth();
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Non autorisé - Seuls les administrateurs peuvent modifier les rôles' },
        { status: 401 }
      );
    }

    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: 'Email requis' },
        { status: 400 }
      );
    }

    // Vérifier que l'utilisateur existe
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (!existingUser) {
      return NextResponse.json(
        { error: 'Utilisateur non trouvé' },
        { status: 404 }
      );
    }

    const updatedUser = await prisma.user.update({
      where: { email },
      data: { role: 'ADMIN' },
      select: {
        id: true,
        email: true,
        role: true,
        name: true
      }
    });

    console.log('Utilisateur promu admin:', updatedUser);

    return NextResponse.json({ 
      success: true,
      user: updatedUser,
      message: 'Utilisateur promu administrateur avec succès'
    });
  } catch (error) {
    console.error('Erreur:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
