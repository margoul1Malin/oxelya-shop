import { NextResponse } from 'next/server';
import prisma from '../../../../lib/prisma';

export async function GET() {
  try {
    const admin = await prisma.user.findFirst({
      where: { role: 'ADMIN' },
      select: {
        id: true,
        email: true,
        name: true,
      },
    });

    return NextResponse.json({ 
      success: true,
      admin: admin ? {
        ...admin,
        password: undefined
      } : null
    });
  } catch (error) {
    return NextResponse.json({ 
      success: false,
      error: 'Erreur lors de la vérification de l&apos;admin' 
    }, { status: 500 });
  }
} 