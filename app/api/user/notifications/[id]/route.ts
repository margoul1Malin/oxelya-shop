import { NextResponse } from 'next/server';
import prisma from '../../../../../lib/prisma';
import { verifyAuth } from '../../../../../lib/auth';

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await verifyAuth();
    if (!user) {
      return NextResponse.json(
        { error: 'Non autorisé' },
        { status: 401 }
      );
    }

    const { isRead } = await request.json();

    const notification = await prisma.notification.update({
      where: {
        id: params.id,
        userId: user.id
      },
      data: { isRead }
    });

    return NextResponse.json(notification);
  } catch (error) {
    console.error('Erreur mise à jour notification:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la mise à jour de la notification' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await verifyAuth();
    if (!user) {
      return NextResponse.json(
        { error: 'Non autorisé' },
        { status: 401 }
      );
    }

    await prisma.notification.delete({
      where: {
        id: params.id,
        userId: user.id
      }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Erreur suppression notification:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la suppression de la notification' },
      { status: 500 }
    );
  }
} 