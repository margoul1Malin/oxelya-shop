import { NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';
import { verifyAuth } from '../../../../lib/auth';

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

// Configuration de Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Interface pour la réponse Cloudinary
interface CloudinaryResponse {
  secure_url: string;
}

export async function POST(request: Request) {
  try {
    // Vérifier que l'utilisateur est connecté et est admin
    const user = await verifyAuth();
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Non autorisé - Seuls les administrateurs peuvent uploader des fichiers' },
        { status: 401 }
      );
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json(
        { error: 'Aucun fichier fourni' },
        { status: 400 }
      );
    }

    // Convertir le fichier en buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Upload vers Cloudinary
    const result = await new Promise<CloudinaryResponse>((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        {
          resource_type: 'auto',
          folder: 'products'
        },
        (error, result) => {
          if (error) reject(error);
          resolve(result as CloudinaryResponse);
        }
      ).end(buffer);
    });

    return NextResponse.json({ url: result.secure_url });
  } catch (error) {
    console.error('Erreur upload:', error);
    return NextResponse.json(
      { error: 'Erreur lors de l\'upload' },
      { status: 500 }
    );
  }
} 
