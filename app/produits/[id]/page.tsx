'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ShoppingCart, Loader } from 'lucide-react';
import Image from 'next/image';
import { toast } from 'react-hot-toast';
import { useCart } from '../../../hooks/useCart';
import { notFound, useRouter } from 'next/navigation';
import { MotionDiv } from '../../../components/ui/MotionDiv';
import { useSession } from 'next-auth/react';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  stock: number;
  isService?: boolean;
}

export default function ProductPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { data: session } = useSession();
  const { dispatch } = useCart();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await fetch(`/api/products/${params.id}`);
        if (!response.ok) {
          throw new Error('Erreur chargement produit');
        }
        const data = await response.json();
        setProduct(data);
      } catch (error) {
        console.error('Erreur:', error);
        notFound();
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [params.id]);

  const handleAddToCart = async () => {
    if (!product) return;

    // Si c'est un service, rediriger vers Oxelya
    if (product.isService) {
      window.open('https://www.oxelya.com', '_blank');
      return;
    }

    setIsLoading(true);
    try {
      dispatch({
        type: 'ADD_ITEM',
        payload: {
          id: product.id,
          name: product.name,
          price: product.price,
          image: product.image,
          quantity: quantity
        }
      });
      
      toast.success('Produit ajouté au panier');
      
      // Si l'utilisateur n'est pas connecté, afficher un message informatif
      if (!session) {
        toast.success('Vous devrez vous connecter pour finaliser votre commande', {
          duration: 4000
        });
      }
    } catch (error) {
      console.error('Erreur ajout au panier:', error);
      toast.error('Erreur lors de l\'ajout au panier');
    } finally {
      setIsLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black pt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="animate-pulse">
            {/* Placeholder loading state */}
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return notFound();
  }

  return (
    <div className="min-h-screen bg-black pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {/* Image */}
          <MotionDiv
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="relative aspect-square rounded-2xl overflow-hidden bg-gray-900"
          >
            <Image
              src={product.image}
              alt={product.name}
              fill
              className="object-cover"
              priority
            />
          </MotionDiv>

          {/* Informations */}
          <MotionDiv
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="flex flex-col"
          >
            <div className="flex items-center gap-4 mb-6">
              <h1 className="text-3xl font-bold text-white">
                {product.name}
              </h1>
              <span className={`text-2xl font-bold ${
                product.isService ? 'text-green-500' : 'text-blue-500'
              }`}>
                {product.isService ? 'Sur devis' : `${product.price.toFixed(2)} €`}
              </span>
            </div>

            <div className="text-gray-400 mb-8 whitespace-pre-wrap leading-relaxed">
              {product.description}
            </div>

            <div className="flex items-center gap-4 mt-6">
              {!product.isService && (
                <div className="flex items-center bg-gray-800 rounded-lg">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
                  >
                    -
                  </button>
                  <span className="px-4 text-white">{quantity}</span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
                  >
                    +
                  </button>
                </div>
              )}

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleAddToCart}
                disabled={isLoading}
                className={`flex items-center gap-2 px-6 py-2.5 text-white rounded-lg transition-all duration-200
                  ${product.isService 
                    ? 'bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700' 
                    : 'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700'
                  }
                  ${isLoading ? 'opacity-50 cursor-not-allowed' : 'hover:scale-[1.02]'}`}
              >
                {isLoading ? (
                  <>
                    <Loader className="w-5 h-5 animate-spin" />
                    {product.isService ? 'Redirection...' : 'Ajout en cours...'}
                  </>
                ) : (
                  <>
                    {product.isService ? (
                      <>
                        <ShoppingCart className="w-5 h-5" />
                        En savoir plus
                      </>
                    ) : (
                      <>
                        <ShoppingCart className="w-5 h-5" />
                        Ajouter au panier
                      </>
                    )}
                  </>
                )}
              </motion.button>
            </div>
          </MotionDiv>
        </div>
      </div>
    </div>
  );
} 