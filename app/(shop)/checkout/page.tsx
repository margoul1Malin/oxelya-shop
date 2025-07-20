'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useCart } from '../../../hooks/useCart';
import { useAuth } from '../../../hooks/useAuth';
import { useSession } from 'next-auth/react';
import AddressForm from '../../../components/checkout/AddressForm';
import { Shield, Truck, CreditCard, Clock, AlertCircle, CheckCircle, LogIn } from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function CheckoutPage() {
  const { state, clearCart } = useCart();
  const cart = state.items;
  const total = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const { user } = useAuth();
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [shippingAddress, setShippingAddress] = useState('');
  const [acceptedTerms, setAcceptedTerms] = useState(false);

  useEffect(() => {
    if (cart.length === 0) {
      router.push('/panier');
    }
  }, [cart, router]);

  // Vérification de l'authentification
  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gray-900 text-white pt-20">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-gray-400">Vérification de votre compte...</p>
          </div>
        </div>
      </div>
    );
  }

  if (status === 'unauthenticated') {
    return (
      <div className="min-h-screen bg-gray-900 text-white pt-20">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="text-center">
            <LogIn className="w-16 h-16 text-blue-500 mx-auto mb-6" />
            <h1 className="text-3xl font-bold mb-4">Connexion requise</h1>
            <p className="text-gray-400 mb-6">
              Vous devez vous connecter ou créer un compte pour finaliser votre commande.
            </p>
            <div className="space-x-4">
              <button
                onClick={() => router.push('/login?callbackUrl=' + encodeURIComponent('/checkout'))}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors"
              >
                Se connecter
              </button>
              <button
                onClick={() => router.push('/register?callbackUrl=' + encodeURIComponent('/checkout'))}
                className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-lg transition-colors"
              >
                Créer un compte
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const handleStripeCheckout = async () => {
    if (!acceptedTerms) {
      toast.error('Vous devez accepter les conditions générales de vente');
      return;
    }

    if (!shippingAddress.trim() || shippingAddress === 'Adresse non fournie') {
      toast.error('Veuillez saisir une adresse de livraison complète');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/payments/stripe/session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          items: cart,
          shippingAddress,
        }),
      });

      const data = await response.json();

      if (data.url) {
        window.location.href = data.url;
      } else {
        toast.error('Erreur lors de la création de la session de paiement');
      }
    } catch (error) {
      console.error('Erreur checkout:', error);
      toast.error('Erreur lors du processus de paiement');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePayPalCheckout = () => {
    toast.error('PayPal arrive bientôt !');
  };

  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-gray-900 text-white pt-20">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Votre panier est vide</h1>
            <p className="text-gray-400 mb-6">Ajoutez des produits avant de procéder au paiement.</p>
            <button
              onClick={() => router.push('/produits')}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors"
            >
              Voir les produits
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gray-900 text-white pt-20">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold mb-2">Finaliser votre commande</h1>
          <p className="text-gray-400">Vérifiez vos informations et choisissez votre mode de paiement</p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Colonne principale */}
          <div className="lg:col-span-2 space-y-6">
            {/* Adresse de livraison */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="bg-gray-800 rounded-lg p-6"
            >
              <h2 className="text-xl font-semibold mb-4 flex items-center">
                <Truck className="w-5 h-5 mr-2 text-blue-500" />
                Adresse de livraison
              </h2>
              <AddressForm onSubmit={(address) => setShippingAddress(JSON.stringify(address))} />
            </motion.div>

            {/* Informations précontractuelles obligatoires */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="bg-gray-800 rounded-lg p-6"
            >
              <h2 className="text-xl font-semibold mb-4 flex items-center">
                <AlertCircle className="w-5 h-5 mr-2 text-yellow-500" />
                Informations précontractuelles
              </h2>
              
              <div className="space-y-4 text-sm">
                <div className="flex justify-between items-center p-3 bg-gray-700 rounded">
                  <span>Prix TTC</span>
                  <span className="font-semibold">{total.toFixed(2)} €</span>
                </div>
                
                <div className="flex justify-between items-center p-3 bg-gray-700 rounded">
                  <span>Frais de livraison</span>
                  <span className="text-green-500 font-semibold">Inclus</span>
                </div>
                
                <div className="flex justify-between items-center p-3 bg-gray-700 rounded">
                  <span>Délais de livraison</span>
                  <span>2-5 jours ouvrés</span>
                </div>
                
                <div className="flex justify-between items-center p-3 bg-gray-700 rounded">
                  <span>Modes de paiement</span>
                  <span>Carte bancaire, PayPal (bientôt)</span>
                </div>
              </div>
            </motion.div>

            {/* Droit de rétractation */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-6"
            >
              <h2 className="text-xl font-semibold mb-4 flex items-center">
                <CheckCircle className="w-5 h-5 mr-2 text-blue-500" />
                Droit de rétractation
              </h2>
              <p className="text-gray-300 text-sm leading-relaxed">
                Conformément à la réglementation européenne, vous disposez d'un délai de <strong>14 jours</strong> à compter de la réception de votre commande pour exercer votre droit de rétractation sans avoir à justifier de motifs ni à payer de pénalité.
              </p>
              <div className="mt-4 p-3 bg-blue-500/10 rounded border border-blue-500/20">
                <p className="text-sm text-blue-300">
                  <strong>Exclusions :</strong> Produits numériques, services personnalisés, produits périssables.
                </p>
              </div>
            </motion.div>
          </div>

          {/* Résumé de la commande */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="lg:col-span-1"
          >
            <div className="bg-gray-800 rounded-lg p-6 sticky top-24">
              <h2 className="text-xl font-semibold mb-4">Résumé de la commande</h2>
              
              <div className="space-y-3 mb-6">
                {cart.map((item) => (
                  <div key={item.id} className="flex justify-between items-center py-2 border-b border-gray-700">
                    <div className="flex-1">
                      <p className="font-medium">{item.name}</p>
                      <p className="text-sm text-gray-400">Quantité: {item.quantity}</p>
                    </div>
                    <p className="font-semibold">{(item.price * item.quantity).toFixed(2)} €</p>
                  </div>
                ))}
              </div>

              <div className="border-t border-gray-700 pt-4 space-y-2">
                <div className="flex justify-between">
                  <span>Sous-total</span>
                  <span>{total.toFixed(2)} €</span>
                </div>
                <div className="flex justify-between">
                  <span>Livraison</span>
                  <span className="text-green-500">Gratuite</span>
                </div>
                <div className="flex justify-between text-lg font-bold pt-2 border-t border-gray-700">
                  <span>Total TTC</span>
                  <span>{total.toFixed(2)} €</span>
                </div>
              </div>

              {/* Conditions générales */}
              <div className="mt-6">
                <label className="flex items-start space-x-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={acceptedTerms}
                    onChange={(e) => setAcceptedTerms(e.target.checked)}
                    className="mt-1 w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500 focus:ring-2"
                  />
                  <span className="text-sm text-gray-300">
                    J'accepte les{' '}
                    <a href="/conditions-generales-de-vente" target="_blank" className="text-blue-500 hover:underline">
                      conditions générales de vente
                    </a>{' '}
                    et la{' '}
                    <a href="/politique-de-confidentialite" target="_blank" className="text-blue-500 hover:underline">
                      politique de confidentialité
                    </a>
                  </span>
                </label>
              </div>

              {/* Boutons de paiement */}
              <div className="mt-6 space-y-3">
                <button
                  onClick={handleStripeCheckout}
                  disabled={isLoading || !acceptedTerms}
                  className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white py-3 px-4 rounded-lg transition-colors flex items-center justify-center"
                >
                  {isLoading ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Traitement...
                    </div>
                  ) : (
                    <>
                      <CreditCard className="w-5 h-5 mr-2" />
                      Payer avec Stripe
                    </>
                  )}
                </button>

                <div className="relative">
                  <button
                    onClick={handlePayPalCheckout}
                    disabled={true}
                    className="w-full bg-gray-600 text-gray-400 py-3 px-4 rounded-lg cursor-not-allowed flex items-center justify-center relative"
                  >
                    <div className="flex items-center">
                      <Shield className="w-5 h-5 mr-2" />
                      Payer avec PayPal
                    </div>
                  </button>
                  <div className="absolute inset-0 bg-black/50 rounded-lg flex items-center justify-center">
                    <span className="text-white text-sm font-medium">Arrive bientôt</span>
                  </div>
                </div>
              </div>

              {/* Sécurité */}
              <div className="mt-4 flex items-center justify-center text-sm text-gray-400">
                <Shield className="w-4 h-4 mr-2" />
                Paiement sécurisé SSL
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </main>
  );
} 