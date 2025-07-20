'use client';

import { useCart } from '../../hooks/useCart';
import { toast } from 'react-hot-toast';

interface Product {
  id: string;
  name: string;
  price: number;
  image: string;
  isService?: boolean;
}

export default function AddToCartButton({ product }: { product: Product }) {
  const { addItem } = useCart();

  const handleAddToCart = () => {
    // Si c'est un service, rediriger vers Oxelya
    if (product.isService) {
      window.open('https://www.oxelya.com', '_blank');
      return;
    }
    
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
      className={`w-full px-4 py-2 rounded-lg ${
        product.isService 
          ? 'bg-green-600 hover:bg-green-700 text-white' 
          : 'bg-blue-600 hover:bg-blue-700 text-white'
      }`}
    >
      {product.isService ? 'En savoir plus' : 'Ajouter au panier'}
    </button>
  );
} 