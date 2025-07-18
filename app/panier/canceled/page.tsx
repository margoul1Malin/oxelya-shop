'use client';

import { useRouter } from 'next/navigation';
import { XCircle } from 'lucide-react';

export default function CanceledPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-gray-800 rounded-lg p-8 text-center">
        <div className="mb-6 flex justify-center">
          <XCircle className="w-16 h-16 text-red-500" />
        </div>
        <h1 className="text-2xl font-bold text-white mb-4">
          Paiement annulé
        </h1>
        <p className="text-gray-300 mb-8">
          Votre paiement a été annulé. Aucun montant n'a été débité.
        </p>
        <div className="space-y-4">
          <button
            onClick={() => router.push('/panier')}
            className="w-full px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            Retourner au panier
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