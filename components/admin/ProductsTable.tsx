'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Edit, Trash, Package, Star, CheckCircle, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Product } from '../../types';
import ProductForm from './ProductForm';
import { toast } from 'react-hot-toast';

interface ProductsTableProps {
  products: Product[];
  onProductUpdate: () => Promise<void>;
}

export default function ProductsTable({ products, onProductUpdate }: ProductsTableProps) {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [showEditForm, setShowEditForm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleEdit = (product: Product) => {
    setSelectedProduct(product);
    setShowEditForm(true);
  };

  const handleDelete = async (productId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce produit ?')) return;

    try {
      setIsLoading(true);
      const response = await fetch(`/api/admin/products/${productId}`, {
        method: 'DELETE'
      });

      if (!response.ok) throw new Error('Erreur lors de la suppression');
      await onProductUpdate();
    } catch (error) {
      console.error('Erreur:', error);
      toast.error('Erreur lors de la suppression du produit');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-gray-800 rounded-lg overflow-hidden">
      <table className="w-full text-left">
        <thead className="text-gray-400 bg-gray-700/50">
          <tr>
            <th className="p-4">Produit</th>
            <th className="p-4">Catégorie</th>
            <th className="p-4">Prix</th>
            <th className="p-4">Statut</th>
            <th className="p-4">Note</th>
            <th className="p-4">Date de création</th>
            <th className="p-4">Actions</th>
          </tr>
        </thead>
        <tbody>
          {products.map((product) => (
            <motion.tr
              key={product.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="border-b border-gray-700 hover:bg-gray-700/30"
            >
              <td className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-700">
                    {product.image ? (
                      <img 
                        src={product.image} 
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <Package className="w-6 h-6 m-3 text-gray-400" />
                    )}
                  </div>
                  <div>
                    <p className="font-medium text-white">{product.name}</p>
                    <p className="text-sm text-gray-400 line-clamp-1">{product.description}</p>
                  </div>
                </div>
              </td>
              <td className="p-4">
                <span className="px-3 py-1 rounded-full text-sm bg-gray-700 text-gray-300">
                  {product.category?.name || 'Non catégorisé'}
                </span>
              </td>
              <td className="p-4">
                {product.isService ? (
                  <span className="text-green-400 font-medium">
                    Sur devis
                  </span>
                ) : (
                  <span className="text-green-400 font-medium">
                    {product.price.toFixed(2)} €
                  </span>
                )}
              </td>
              <td className="p-4">
                {(product.isCreated ?? true) ? (
                  <span className="flex items-center gap-2 px-3 py-1 rounded-full text-sm bg-green-500/20 text-green-400">
                    <CheckCircle className="w-4 h-4" />
                    Disponible
                  </span>
                ) : (
                  <span className="flex items-center gap-2 px-3 py-1 rounded-full text-sm bg-orange-500/20 text-orange-400">
                    <Clock className="w-4 h-4" />
                    Coming Soon
                  </span>
                )}
              </td>
              <td className="p-4">
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 text-yellow-400" />
                  <span className="text-gray-300">
                    {product.rating?.toFixed(1) || 'N/A'}
                  </span>
                </div>
              </td>
              <td className="p-4 text-gray-400">
                {format(new Date(product.createdAt), 'PPP', { locale: fr })}
              </td>
              <td className="p-4">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleEdit(product)}
                    className="p-2 hover:bg-blue-500/20 rounded-lg text-gray-400 hover:text-blue-400"
                  >
                    <Edit className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => handleDelete(product.id)}
                    disabled={isLoading}
                    className="p-2 hover:bg-red-500/20 rounded-lg text-gray-400 hover:text-red-400"
                  >
                    <Trash className="w-5 h-5" />
                  </button>
                </div>
              </td>
            </motion.tr>
          ))}
        </tbody>
      </table>

      {showEditForm && selectedProduct && (
        <ProductForm
          product={selectedProduct}
          onClose={() => {
            setShowEditForm(false);
            setSelectedProduct(null);
          }}
          onSuccess={() => {
            setShowEditForm(false);
            setSelectedProduct(null);
            onProductUpdate();
          }}
        />
      )}
    </div>
  );
} 
