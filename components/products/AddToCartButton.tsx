'use client';

import { useCart } from '../../hooks/useCart';
import { toast } from 'react-hot-toast';

interface Product {
  id: string;
  name: string;
  price: number;
  image: string;
}

export default function AddToCartButton({ product }: { product: Product }) {
  const { addItem } = useCart();

  const handleAddToCart = () => {
    try {
      addItem({
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.image,
        quantity: 1
      });
      toast.success('Produit ajouté au panier');
    } catch (error) {
      console.error('Erreur ajout au panier:', error);
      toast.error('Erreur lors de l\'ajout au panier');
    }
  };

  return (
    <button
      onClick={handleAddToCart}
      className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
    >
      Ajouter au panier
    </button>
  );
} 