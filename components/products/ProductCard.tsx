'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { ShoppingCart, Clock } from 'lucide-react';
import { useCart } from '../../hooks/useCart';
import Link from 'next/link';
import { toast } from 'react-hot-toast';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  isNew?: boolean;
  isCreated?: boolean;
  rating: number | null;
}

export default function ProductCard({ product }: { product: Product }) {
  const { state, dispatch } = useCart();
  const [isAdding, setIsAdding] = useState(false);
  
  // Par défaut, considérer le produit comme créé si isCreated n'est pas défini
  const isProductCreated = product.isCreated ?? true;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault(); // Empêcher la navigation du Link
    
    // Ne pas permettre d'ajouter au panier si le produit n'est pas créé
    if (!isProductCreated) {
      toast.error('Ce produit arrive bientôt !');
      return;
    }
    
    setIsAdding(true);
    
    try {
      dispatch({
        type: 'ADD_ITEM',
        payload: {
          id: product.id,
          name: product.name,
          price: product.price,
          image: product.image,
          quantity: 1
        }
      });
      
      toast.success('Produit ajouté au panier');
    } catch (error) {
      console.error('Erreur lors de l\'ajout au panier:', error);
      toast.error('Erreur lors de l\'ajout au panier');
    } finally {
      setIsAdding(false);
    }
  };

  const CardContent = (
    <motion.div
      whileHover={isProductCreated ? { y: -5 } : {}}
      className={`bg-gray-800 rounded-lg overflow-hidden group h-full flex flex-col relative
        ${isProductCreated ? 'cursor-pointer' : 'cursor-default'}
        ${!isProductCreated ? 'opacity-75' : ''}
      `}
    >
      <div className="relative aspect-square">
        <Image
          src={product.image}
          alt={product.name}
          fill
          className={`object-cover transition-transform duration-300 
            ${isProductCreated ? 'group-hover:scale-110' : 'grayscale'}
          `}
        />
        
        {/* Badge Coming Soon pour les produits non créés */}
        {!isProductCreated && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <div className="bg-orange-500 text-white px-3 py-2 rounded-full text-sm font-semibold flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Coming Soon
            </div>
          </div>
        )}
        
        {product.isNew && isProductCreated && (
          <span className="absolute top-2 right-2 bg-blue-500 text-white px-2 py-1 rounded-full text-xs">
            Nouveau
          </span>
        )}
      </div>
      
      <div className="p-4 flex flex-col flex-1">
        <div className="flex-1 flex flex-col">
          <h3 className={`text-lg font-semibold mb-2 transition-colors line-clamp-2
            ${isProductCreated 
              ? 'text-white group-hover:text-blue-400' 
              : 'text-gray-300'
            }
          `}>
            {product.name}
          </h3>
          <p className={`text-sm mb-4 line-clamp-3 flex-1 truncate
            ${isProductCreated ? 'text-gray-400' : 'text-gray-500'}
          `}>
            {!isProductCreated ? 'Ce produit sera bientôt disponible...' : product.description}
          </p>
        </div>
        
        <div className="flex items-center justify-between mt-auto pt-2">
          <span className={`text-xl font-bold 
            ${isProductCreated ? 'text-blue-500' : 'text-gray-500'}
          `}>
            {isProductCreated ? `${product.price.toFixed(2)} €` : 'Prix à venir'}
          </span>
          
          {isProductCreated ? (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleAddToCart}
              className="p-2 bg-blue-500 rounded-lg text-white hover:bg-blue-600 transition-colors flex-shrink-0"
              disabled={isAdding}
            >
              <ShoppingCart className="w-5 h-5" />
            </motion.button>
          ) : (
            <div className="p-2 bg-gray-600 rounded-lg text-gray-400 flex-shrink-0 cursor-not-allowed">
              <Clock className="w-5 h-5" />
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );

  // Si le produit n'est pas créé, ne pas entourer d'un Link
  if (!isProductCreated) {
    return CardContent;
  }

  // Si le produit est créé, entourer d'un Link comme avant
  return (
    <Link href={`/produits/${product.id}`} className="block w-full h-full">
      {CardContent}
    </Link>
  );
} 