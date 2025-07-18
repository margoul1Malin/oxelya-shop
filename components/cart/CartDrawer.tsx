'use client';

import React, { useState } from 'react';
import { ShoppingCart, X, Trash2, ExternalLink } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCart } from '../../hooks/useCart';
import { toast } from 'react-hot-toast';
import { getClientStripe } from '../../lib/stripe-client';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CartDrawer({ isOpen, onClose }: CartDrawerProps) {
  const router = useRouter();
  const { state, dispatch } = useCart();
  const [isProcessing, setIsProcessing] = useState(false);

  const items = state?.items || [];
  const total = items.reduce(
    (sum, item) => sum + item.price * item.quantity, 
    0
  );

  const removeFromCart = (id: string) => {
    dispatch({ type: 'REMOVE_ITEM', payload: id });
  };

  const updateQuantity = (id: string, quantity: number) => {
    dispatch({ 
      type: 'UPDATE_QUANTITY', 
      payload: { id, quantity } 
    });
  };

  const clearCart = () => {
    dispatch({ type: 'CLEAR_CART' });
  };

  const handleStripeCheckout = async () => {
    try {
      setIsProcessing(true);

      if (items.length === 0) {
        toast.error('Votre panier est vide');
        return;
      }

      // Fermer le panier et rediriger vers le checkout complet
      onClose();
      router.push('/checkout');
    } catch (error: any) {
      console.error('Erreur checkout:', error);
      toast.error('Erreur lors de la redirection');
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePayPalCheckout = async () => {
    try {
      setIsProcessing(true);

      if (items.length === 0) {
        toast.error('Votre panier est vide');
        return;
      }

      // Fermer le panier et rediriger vers le checkout complet
      onClose();
      router.push('/checkout');
    } catch (error: any) {
      console.error('Erreur checkout:', error);
      toast.error('Erreur lors de la redirection');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed right-4 top-4 bottom-4 w-full md:w-96 bg-gray-900 z-50 shadow-2xl rounded-2xl border border-gray-700"
          >
            {/* En-tête */}
            <div className="p-4 border-b border-gray-800 flex justify-between items-center rounded-t-2xl">
              <h2 className="text-xl font-bold">Panier</h2>
              <button onClick={onClose} className="p-2 hover:text-gray-400 rounded-lg hover:bg-gray-800 transition-colors">
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Contenu du panier avec scroll */}
            <div className="flex flex-col h-[calc(100vh-112px)]"> {/* Ajusté pour les marges top/bottom */}
              <div className="flex-1 overflow-y-auto p-4">
                {items.length === 0 ? (
                  <div className="text-center py-8">
                    <ShoppingCart className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                    <p className="text-gray-400">Votre panier est vide</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {items.map((item) => (
                      <div key={item.id} className="flex gap-4 bg-gray-800/50 p-4 rounded-lg">
                        <div className="relative w-20 h-20">
                          <Image
                            src={item.image}
                            alt={item.name}
                            fill
                            className="object-cover rounded-md"
                          />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-medium">{item.name}</h3>
                          <p className="text-gray-400">{item.price.toFixed(2)} €</p>
                          <div className="flex items-center gap-2 mt-2">
                            <button
                              onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}
                              className="p-1 hover:bg-gray-700 rounded"
                            >
                              -
                            </button>
                            <span>{item.quantity}</span>
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              className="p-1 hover:bg-gray-700 rounded"
                            >
                              +
                            </button>
                          </div>
                        </div>
                        <button
                          onClick={() => removeFromCart(item.id)}
                          className="p-2 text-red-400 hover:text-red-300"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Footer avec total et boutons */}
              <div className="border-t border-gray-800 p-4 bg-gray-900 rounded-b-2xl">
                <div className="flex justify-between items-center mb-4">
                  <span className="font-medium">Total</span>
                  <span className="font-bold text-xl">{total.toFixed(2)} €</span>
                </div>
                
                {/* Boutons */}
                <div className="space-y-2">
                  {/* Bouton voir panier complet */}
                  <Link
                    href="/panier"
                    onClick={onClose}
                    className="w-full px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors flex items-center justify-center gap-2"
                  >
                    <ExternalLink className="w-4 h-4" />
                    Voir le panier complet
                  </Link>
                  
                  <button
                    onClick={clearCart}
                    className="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                  >
                    Vider le panier
                  </button>
                  <button
                    onClick={handleStripeCheckout}
                    disabled={isProcessing || items.length === 0}
                    className={`w-full px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg hover:from-blue-600 hover:to-purple-600 transition-colors flex items-center justify-center gap-2 ${
                      (isProcessing || items.length === 0) ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                  >
                    {isProcessing ? (
                      <>
                        <span className="animate-spin">⚡</span>
                        Redirection...
                      </>
                    ) : (
                      'Finaliser la commande'
                    )}
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
} 