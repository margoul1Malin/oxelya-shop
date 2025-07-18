'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import LoadingSpinner from '../../../../components/ui/LoadingSpinner';

export default function StripeCheckoutPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const initStripeCheckout = async () => {
      try {
        const cartItems = localStorage.getItem('cartItems');
        const shippingAddress = localStorage.getItem('shippingAddress');

        if (!cartItems || !shippingAddress) {
          throw new Error('Informations manquantes');
        }

        const items = JSON.parse(cartItems);
        const address = JSON.parse(shippingAddress);

        console.log('=== DÉBUT CREATION SESSION STRIPE CÔTÉ CLIENT ===');
        console.log('Items:', items);
        console.log('Adresse:', address);

        const response = await fetch('/api/payments/stripe/session', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            items,
            shippingAddress: address
          }),
        });

        console.log('Réponse API:', response.status, response.statusText);
        const data = await response.json();
        console.log('Data reçue:', data);

        if (!response.ok || !data.sessionId) {
          throw new Error(data.error || 'Session ID manquant');
        }

        // Charger Stripe et rediriger vers la session de checkout
        console.log('Chargement de Stripe...');
        const { loadStripe } = await import('@stripe/stripe-js');
        const stripe = await loadStripe(process.env.NEXT_PUBLIC_STRIPE_TEST_PUBLISHABLE_KEY!);
        
        if (!stripe) {
          throw new Error('Impossible d\'initialiser Stripe');
        }

        console.log('Redirection vers Stripe avec sessionId:', data.sessionId);
        const result = await stripe.redirectToCheckout({
          sessionId: data.sessionId
        });

        console.log('Résultat de la redirection Stripe:', result);

        if (result.error) {
          console.error('Erreur Stripe redirection:', result.error);
          throw new Error(result.error.message);
        }

        console.log('=== FIN REDIRECTION STRIPE ===');
      } catch (error: any) {
        console.error('Erreur:', error);
        setError(error.message);
        setTimeout(() => router.push('/checkout'), 3000);
      } finally {
        setIsLoading(false);
      }
    };

    initStripeCheckout();
  }, [router]);

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

  return (
    <div className="min-h-screen text-white pt-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center">
        <LoadingSpinner />
        <p className="mt-4 text-gray-400">Préparation du paiement...</p>
      </div>
    </div>
  );
} 