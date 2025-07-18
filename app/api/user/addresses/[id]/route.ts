import { NextResponse } from 'next/server';
import prisma from '../../../../../lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../../../../lib/auth';

// Mettre à jour une adresse
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Non autorisé' },
        { status: 401 }
      );
    }

    // Récupérer l'utilisateur
    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Utilisateur non trouvé' },
        { status: 404 }
      );
    }

    // Vérifier que l'adresse existe et appartient à l'utilisateur
    const existingAddress = await prisma.address.findFirst({
      where: {
        id: params.id,
        userId: user.id
      }
    });

    if (!existingAddress) {
      return NextResponse.json(
        { error: 'Adresse non trouvée' },
        { status: 404 }
      );
    }

    const data = await request.json();

    // Si la mise à jour définit l'adresse comme défaut
    if (data.isDefault) {
      // Mettre à jour toutes les autres adresses de l'utilisateur
      await prisma.$transaction([
        // D'abord, mettre toutes les adresses existantes à non-défaut
        prisma.address.updateMany({
          where: {
            userId: user.id,
            isDefault: true,
            id: { not: params.id }
          },
          data: {
            isDefault: false
          }
        }),
        // Ensuite, mettre à jour l'adresse actuelle
        prisma.address.update({
          where: { id: params.id },
          data: {
            name: data.name,
            street: data.street,
            city: data.city,
            state: data.state,
            zipCode: data.zipCode,
            country: data.country,
            phone: data.phone,
            isDefault: data.isDefault
          }
        })
      ]);
    } else {
      // Mise à jour simple sans modification du statut par défaut
      await prisma.address.update({
        where: { id: params.id },
        data: {
          name: data.name,
          street: data.street,
          city: data.city,
          state: data.state,
          zipCode: data.zipCode,
          country: data.country,
          phone: data.phone,
          isDefault: existingAddress.isDefault // Conserver le statut par défaut existant
        }
      });
    }

    return NextResponse.json({ message: 'Adresse mise à jour avec succès' });
  } catch (error) {
    console.error('Erreur mise à jour adresse:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la mise à jour de l\'adresse' },
      { status: 500 }
    );
  }
}

// Supprimer une adresse
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Non autorisé' },
        { status: 401 }
      );
    }

    // Récupérer l'utilisateur
    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Utilisateur non trouvé' },
        { status: 404 }
      );
    }

    // Vérifier que l'adresse existe et appartient à l'utilisateur
    const address = await prisma.address.findFirst({
      where: {
        id: params.id,
        userId: user.id
      }
    });

    if (!address) {
      return NextResponse.json(
        { error: 'Adresse non trouvée' },
        { status: 404 }
      );
    }

    // Si c'était l'adresse par défaut, définir une autre adresse comme défaut
    if (address.isDefault) {
      const nextDefaultAddress = await prisma.address.findFirst({
        where: {
          userId: user.id,
          id: { not: address.id }
        }
      });

      if (nextDefaultAddress) {
        await prisma.address.update({
          where: { id: nextDefaultAddress.id },
          data: { isDefault: true }
        });
      }
    }

    // Supprimer l'adresse
    await prisma.address.delete({
      where: { id: params.id }
    });

    return NextResponse.json({ message: 'Adresse supprimée avec succès' });
  } catch (error) {
    console.error('Erreur suppression adresse:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la suppression de l\'adresse' },
      { status: 500 }
    );
  }
} 