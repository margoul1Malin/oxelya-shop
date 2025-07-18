'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { PayPalScriptProvider } from '@paypal/react-paypal-js';
import PayPalPayment from '../../../../components/checkout/PayPalPayment';
import LoadingSpinner from '../../../../components/ui/LoadingSpinner';

export default function PayPalCheckoutPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [items, setItems] = useState<any[]>([]);
  const [shippingAddress, setShippingAddress] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    const cartItems = localStorage.getItem('cartItems');
    const shippingAddress = localStorage.getItem('shippingAddress');

    if (!cartItems || !shippingAddress) {
      setError('Informations manquantes');
      setTimeout(() => router.push('/checkout'), 3000);
      return;
    }

    setItems(JSON.parse(cartItems));
    setShippingAddress(JSON.parse(shippingAddress));
    setIsLoading(false);
  }, [router]);

  const handleSuccess = async (orderId: string) => {
    try {
      // Nettoyer le panier
      localStorage.removeItem('cartItems');
      localStorage.removeItem('shippingAddress');
      
      // Rediriger vers la page de succès
      router.push('/checkout/success');
    } catch (error) {
      setError('Erreur lors de la finalisation de la commande');
    }
  };

  if (error) {
    return (
      <div className="min-h-screen text-white pt-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center">
          <div className="bg-red-500/20 text-red-500 p-4 rounded-lg mb-4">
            {error}
          </div>
          <p className="text-gray-400">Redirection vers le checkout...</p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen text-white pt-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center">
          <LoadingSpinner />
          <p className="mt-4 text-gray-400">Chargement du paiement...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen text-white pt-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-3xl font-bold mb-8">Paiement PayPal</h1>
        <PayPalScriptProvider options={{
          clientId: process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID!,
          currency: 'EUR',
        }}>
          <PayPalPayment
            items={items}
            shippingAddress={shippingAddress}
            onSuccess={handleSuccess}
            onError={(error) => setError(error)}
          />
        </PayPalScriptProvider>
      </div>
    </div>
  );
} 