import { NextResponse } from 'next/server';
import prisma from '../../../../../lib/prisma';
import { verifyAuth } from '../../../../../lib/auth';

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Vérifier l'authentification admin
    const user = await verifyAuth();
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Non autorisé' },
        { status: 401 }
      );
    }

    const formData = await request.formData();
    const name = formData.get('name') as string;
    const description = formData.get('description') as string;
    const price = parseFloat(formData.get('price') as string);
    const categoryId = formData.get('categoryId') as string;
    const image = formData.get('image') as string;
    const isNew = formData.get('isNew') === 'true';

    const updatedProduct = await prisma.product.update({
      where: {
        id: params.id
      },
      data: {
        name,
        description,
        price,
        categoryId,
        image,
        isNew
      }
    });

    return NextResponse.json(updatedProduct);
  } catch (error) {
    console.error('Erreur mise à jour produit:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la mise à jour du produit' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.product.delete({
      where: { id: params.id }
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: "Erreur lors de la suppression du produit" },
      { status: 500 }
    );
  }
} 