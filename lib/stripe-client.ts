import { loadStripe } from '@stripe/stripe-js';

let stripePromise: Promise<any> | null = null;

export const getClientStripe = () => {
  if (!stripePromise) {
    const publishableKey = process.env.NEXT_PUBLIC_STRIPE_TEST_PUBLISHABLE_KEY;
    if (!publishableKey) {
      throw new Error('Stripe publishable key non configurée');
    }
    
    // Forcer le mode test
    stripePromise = loadStripe(publishableKey, {
      apiVersion: '2023-10-16',
      stripeAccount: undefined,
      betas: undefined,
      locale: 'fr'
    });
  }
  return stripePromise;
}; 