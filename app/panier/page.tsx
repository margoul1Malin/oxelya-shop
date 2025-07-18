'use client';

import React, { useState } from 'react';
import { ShoppingCart, Trash2, Plus, Minus, ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCart } from '../../hooks/useCart';
import { toast } from 'react-hot-toast';

export default function PanierPage() {
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
    toast.success('Produit retiré du panier');
  };

  const updateQuantity = (id: string, quantity: number) => {
    if (quantity < 1) {
      removeFromCart(id);
      return;
    }
    dispatch({ 
      type: 'UPDATE_QUANTITY', 
      payload: { id, quantity } 
    });
  };

  const clearCart = () => {
    dispatch({ type: 'CLEAR_CART' });
    toast.success('Panier vidé');
  };

  const handleCheckout = async () => {
    try {
      setIsProcessing(true);

      if (items.length === 0) {
        toast.error('Votre panier est vide');
        return;
      }

      router.push('/checkout');
    } catch (error: any) {
      console.error('Erreur checkout:', error);
      toast.error('Erreur lors de la redirection');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <main className="min-h-screen bg-black text-white pt-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* En-tête */}
        <div className="flex items-center gap-4 mb-8">
          <Link 
            href="/produits"
            className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Continuer les achats
          </Link>
        </div>

        <div className="flex items-center gap-3 mb-8">
          <ShoppingCart className="w-8 h-8 text-blue-500" />
          <h1 className="text-3xl font-bold">Mon Panier</h1>
          <span className="text-gray-400">({items.length} article{items.length > 1 ? 's' : ''})</span>
        </div>

        {items.length === 0 ? (
          /* Panier vide */
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-16"
          >
            <ShoppingCart className="w-24 h-24 mx-auto text-gray-400 mb-6" />
            <h2 className="text-2xl font-bold mb-4">Votre panier est vide</h2>
            <p className="text-gray-400 mb-8">
              Découvrez nos produits et ajoutez-les à votre panier pour commencer vos achats.
            </p>
            <Link
              href="/produits"
              className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Découvrir nos produits
            </Link>
          </motion.div>
        ) : (
          /* Panier avec produits */
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Liste des produits */}
            <div className="lg:col-span-2">
              <div className="space-y-4">
                {items.map((item, index) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-gray-900/50 border border-gray-800 rounded-lg p-6"
                  >
                    <div className="flex gap-6">
                      {/* Image du produit */}
                      <div className="relative w-24 h-24 flex-shrink-0">
                        <Image
                          src={item.image}
                          alt={item.name}
                          fill
                          className="object-cover rounded-lg"
                        />
                      </div>

                      {/* Informations du produit */}
                      <div className="flex-1">
                        <h3 className="text-xl font-semibold mb-2">{item.name}</h3>
                        <p className="text-blue-400 text-lg font-medium mb-4">
                          {item.price.toFixed(2)} €
                        </p>

                        {/* Contrôles quantité */}
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-3 bg-gray-800 rounded-lg p-2">
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                              className="w-8 h-8 flex items-center justify-center hover:bg-gray-700 rounded transition-colors"
                            >
                              <Minus className="w-4 h-4" />
                            </button>
                            <span className="font-medium w-8 text-center">{item.quantity}</span>
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              className="w-8 h-8 flex items-center justify-center hover:bg-gray-700 rounded transition-colors"
                            >
                              <Plus className="w-4 h-4" />
                            </button>
                          </div>

                          <div className="text-gray-400">
                            Sous-total: <span className="text-white font-medium">
                              {(item.price * item.quantity).toFixed(2)} €
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Bouton supprimer */}
                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="p-3 text-red-400 hover:text-red-300 hover:bg-red-400/10 rounded-lg transition-colors"
                        title="Supprimer du panier"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Bouton vider le panier */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="mt-6"
              >
                <button
                  onClick={clearCart}
                  className="text-red-400 hover:text-red-300 transition-colors flex items-center gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                  Vider le panier
                </button>
              </motion.div>
            </div>

            {/* Résumé de commande */}
            <div className="lg:col-span-1">
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-gray-900/50 border border-gray-800 rounded-lg p-6 sticky top-24"
              >
                <h2 className="text-xl font-bold mb-6">Résumé de la commande</h2>

                <div className="space-y-4 mb-6">
                  <div className="flex justify-between text-gray-400">
                    <span>Sous-total ({items.length} article{items.length > 1 ? 's' : ''})</span>
                    <span>{total.toFixed(2)} €</span>
                  </div>
                  <div className="flex justify-between text-gray-400">
                    <span>Livraison</span>
                    <span className="text-green-400">Gratuite</span>
                  </div>
                  <div className="border-t border-gray-700 pt-4">
                    <div className="flex justify-between text-xl font-bold">
                      <span>Total</span>
                      <span className="text-blue-400">{total.toFixed(2)} €</span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={handleCheckout}
                  disabled={isProcessing || items.length === 0}
                  className={`w-full px-6 py-4 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg hover:from-blue-600 hover:to-purple-600 transition-colors flex items-center justify-center gap-2 font-medium ${
                    (isProcessing || items.length === 0) ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  {isProcessing ? (
                    <>
                      <span className="animate-spin">⚡</span>
                      Redirection...
                    </>
                  ) : (
                    'Procéder au paiement'
                  )}
                </button>

                <div className="mt-4 text-center">
                  <Link
                    href="/produits"
                    className="text-gray-400 hover:text-white transition-colors text-sm"
                  >
                    Ou continuer les achats
                  </Link>
                </div>
              </motion.div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
} 