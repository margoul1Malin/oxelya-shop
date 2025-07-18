import Stripe from 'stripe';

const STRIPE_MODE = process.env.STRIPE_MODE || 'test';

export const getStripeKeys = () => {
  const secretKey = process.env.STRIPE_TEST_SECRET_KEY;
  const publishableKey = process.env.NEXT_PUBLIC_STRIPE_TEST_PUBLISHABLE_KEY;

  return {
    secretKey,
    publishableKey,
  };
};

let stripeInstance: Stripe | null = null;

export function getServerStripe() {
  if (!stripeInstance) {
    if (!process.env.STRIPE_TEST_SECRET_KEY) {
      throw new Error('La clé secrète Stripe n\'est pas configurée');
    }
    stripeInstance = new Stripe(process.env.STRIPE_TEST_SECRET_KEY, {
      apiVersion: '2025-02-24.acacia',
    });
  }
  return stripeInstance;
}

// Pour le côté client
let clientStripe: any = null;
export const getClientStripe = async () => {
  if (!process.env.NEXT_PUBLIC_STRIPE_TEST_PUBLISHABLE_KEY) {
    throw new Error('Stripe publishable key non configurée');
  }

  const { loadStripe } = await import('@stripe/stripe-js');
  return await loadStripe(process.env.NEXT_PUBLIC_STRIPE_TEST_PUBLISHABLE_KEY);
};

// N'exporter l'instance serveur que si on est côté serveur
export const stripeServer = typeof window === 'undefined' ? getServerStripe() : undefined;

export const stripe = getServerStripe();

