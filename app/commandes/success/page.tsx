'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { CheckCircle } from 'lucide-react';
import { useCart } from '../../../hooks/useCart';

export default function SuccessPage() {
  const router = useRouter();
  const { clearCart } = useCart();
  const [isCleared, setIsCleared] = useState(false);

  useEffect(() => {
    if (!isCleared) {
      clearCart();
      setIsCleared(true);
    }
  }, [clearCart, isCleared]);

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-gray-800 rounded-lg p-8 text-center">
        <div className="mb-6 flex justify-center">
          <CheckCircle className="w-16 h-16 text-green-500" />
        </div>
        <h1 className="text-2xl font-bold text-white mb-4">
          Paiement réussi !
        </h1>
        <p className="text-gray-300 mb-8">
          Merci pour votre commande. Vous recevrez bientôt un email de confirmation.
        </p>
        <div className="space-y-4">
          <button
            onClick={() => router.push('/profil/commandes')}
            className="w-full px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            Voir mes commandes
          </button>
          <button
            onClick={() => router.push('/')}
            className="w-full px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
          >
            Retour à l'accueil
          </button>
        </div>
      </div>
    </div>
  );
} 