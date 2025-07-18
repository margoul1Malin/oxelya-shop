export async function uploadImage(file: File): Promise<string> {
  try {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch('/api/upload', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error('Upload failed');
    }

    const data = await response.json();
    return data.secure_url; // Retourne le chemin local de l'image
  } catch (error) {
    console.error('Erreur lors de l\'upload de l\'image:', error);
    throw new Error('Erreur lors de l\'upload de l\'image');
  }
} 