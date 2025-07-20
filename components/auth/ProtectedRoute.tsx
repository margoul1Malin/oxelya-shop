'use client';

import { useAuth } from '../../hooks/useAuth';
import { useRouter } from 'next/navigation';
import { Loader2, LogIn } from 'lucide-react';

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-900 text-white pt-20">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="text-center">
            <LogIn className="w-16 h-16 text-blue-500 mx-auto mb-6" />
            <h1 className="text-3xl font-bold mb-4">Accès restreint</h1>
            <p className="text-gray-400 mb-6">
              Vous devez vous connecter pour accéder à cette page.
            </p>
            <div className="space-x-4">
              <button
                onClick={() => router.push('/login')}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors"
              >
                Se connecter
              </button>
              <button
                onClick={() => router.push('/register')}
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

  return <>{children}</>;
} 