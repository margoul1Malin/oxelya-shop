'use client';

import { useState, useRef, useEffect } from 'react';
import { X, Upload, Loader } from 'lucide-react';
import { toast } from 'react-hot-toast';
import Image from 'next/image';
import { Product } from '../../types';

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface ProductFormProps {
  product?: Product;
  onClose: () => void;
  onSuccess: () => void;
}

export default function ProductForm({ product, onClose, onSuccess }: ProductFormProps) {
  const [formData, setFormData] = useState({
    name: product?.name || '',
    description: product?.description || '',
    price: product?.price || '',
    categoryId: product?.categoryId || '',
    image: product?.image || '',
    isCreated: product?.isCreated ?? true
  });
  const [categories, setCategories] = useState<Category[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [previewImage, setPreviewImage] = useState(product?.image || '');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch('/api/admin/categories');
        if (!res.ok) throw new Error('Erreur lors de la récupération des catégories');
        const data = await res.json();
        setCategories(data);
      } catch (error) {
        console.error('Erreur:', error);
        toast.error('Erreur lors du chargement des catégories');
      }
    };

    fetchCategories();
  }, []);

  const handleImageUpload = async (file: File) => {
    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/admin/upload', {
        method: 'POST',
        body: formData
      });

      if (!res.ok) {
        throw new Error('Erreur lors de l\'upload de l\'image');
      }

      const data = await res.json();
      return data.url;
    } catch (error) {
      console.error('Erreur upload:', error);
      throw error;
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      // Créer une URL temporaire pour la prévisualisation
      const previewUrl = URL.createObjectURL(file);
      setPreviewImage(previewUrl);

      // Upload le fichier
      const imageUrl = await handleImageUpload(file);
      setFormData(prev => ({ ...prev, image: imageUrl }));
    } catch (error) {
      toast.error('Erreur lors de l\'upload de l\'image');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const res = await fetch('/api/admin/products', {
        method: product ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(product ? { ...formData, id: product.id } : formData),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Une erreur est survenue');
      }

      toast.success(product ? 'Produit mis à jour' : 'Produit créé');
      onSuccess();
      onClose();
    } catch (error: any) {
      console.error('Erreur:', error);
      toast.error(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-gray-800 rounded-lg p-6 max-w-md w-full">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold">
            {product ? 'Modifier le produit' : 'Nouveau produit'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-gray-300 mb-2">Nom</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-gray-300 mb-2">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none h-32"
              required
            />
          </div>

          <div>
            <label className="block text-gray-300 mb-2">Prix</label>
            <input
              type="number"
              step="0.01"
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: e.target.value })}
              className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-gray-300 mb-2">Catégorie</label>
            <select
              value={formData.categoryId}
              onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
              className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              required
            >
              <option value="">Sélectionner une catégorie</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-gray-300 mb-2">Image</label>
            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg hover:bg-gray-600 flex items-center gap-2"
              >
                <Upload className="w-4 h-4" />
                Choisir une image
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
            </div>
            {previewImage && (
              <div className="mt-4 relative w-32 h-32">
                <Image
                  src={previewImage}
                  alt="Preview"
                  fill
                  className="object-cover rounded-lg"
                />
              </div>
            )}
          </div>

          <div>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.isCreated}
                onChange={(e) => setFormData({ ...formData, isCreated: e.target.checked })}
                className="w-4 h-4 text-blue-500 bg-gray-700 border-gray-600 rounded focus:ring-blue-500 focus:ring-2"
              />
              <div>
                <span className="text-gray-300 font-medium">Produit disponible</span>
                <p className="text-sm text-gray-400">
                  {formData.isCreated 
                    ? "Le produit est disponible à l'achat" 
                    : "Le produit sera affiché comme 'Coming Soon...' et ne sera pas achetable"
                  }
                </p>
              </div>
            </label>
          </div>

          <div className="flex justify-end gap-4 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-400 hover:text-white"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader className="w-4 h-4 animate-spin" />
                  Enregistrement...
                </>
              ) : (
                'Enregistrer'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 