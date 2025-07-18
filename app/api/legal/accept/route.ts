import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../../lib/auth';
import prisma from '../../../../lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Non autorisé' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { documentTypes, orderId } = body;

    if (!documentTypes || !Array.isArray(documentTypes)) {
      return NextResponse.json(
        { error: 'Types de documents requis' },
        { status: 400 }
      );
    }

    // Récupérer les informations de traçabilité
    const ipAddress = request.headers.get('x-forwarded-for') || 
                     request.headers.get('x-real-ip') || 
                     request.ip || 
                     'unknown';
    
    const userAgent = request.headers.get('user-agent') || 'unknown';

    // Versions actuelles des documents (à adapter selon vos besoins)
    const documentVersions = {
      CGV: '1.0',
      PRIVACY_POLICY: '1.0',
      LEGAL_MENTIONS: '1.0',
      COOKIES_POLICY: '1.0'
    };

    // Créer les acceptations légales (nouvelle acceptation à chaque fois pour la conformité française)
    const acceptances = await Promise.all(
      documentTypes.map(async (docType: string) => {
        // Créer une nouvelle acceptation à chaque achat (conformité française)
        return await prisma.legalAcceptance.create({
          data: {
            userId: session.user.id,
            documentType: docType as any,
            documentVersion: documentVersions[docType as keyof typeof documentVersions],
            ipAddress: ipAddress,
            userAgent: userAgent,
            orderId: orderId || null
          }
        });
      })
    );

    return NextResponse.json({
      success: true,
      acceptances: acceptances
    });

  } catch (error) {
    console.error('Erreur lors de l\'enregistrement des acceptations légales:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}

// Vérifier les acceptations pour un utilisateur
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Non autorisé' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const orderId = searchParams.get('orderId');

    const acceptances = await prisma.legalAcceptance.findMany({
      where: {
        userId: session.user.id,
        ...(orderId && { orderId })
      },
      orderBy: {
        acceptedAt: 'desc'
      }
    });

    // Vérifier quels documents sont requis et acceptés
    const requiredDocuments = ['CGV', 'PRIVACY_POLICY'];
    const documentVersions = {
      CGV: '1.0',
      PRIVACY_POLICY: '1.0'
    };

    const acceptedDocuments = acceptances.reduce((acc, acceptance) => {
      if (acceptance.documentVersion === documentVersions[acceptance.documentType as keyof typeof documentVersions]) {
        acc[acceptance.documentType] = true;
      }
      return acc;
    }, {} as Record<string, boolean>);

    const allRequired = requiredDocuments.every(doc => acceptedDocuments[doc]);

    return NextResponse.json({
      acceptances,
      acceptedDocuments,
      allRequiredAccepted: allRequired
    });

  } catch (error) {
    console.error('Erreur lors de la vérification des acceptations:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
} 