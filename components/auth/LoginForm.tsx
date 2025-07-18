'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { signIn } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Mail, Lock, AlertTriangle, Shield } from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';

export default function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isBlocked, setIsBlocked] = useState(false);
  const [blockTimeLeft, setBlockTimeLeft] = useState(0);
  const [attemptsLeft, setAttemptsLeft] = useState(5);
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || '/';

  // Vérifier le statut de blocage au chargement
  useEffect(() => {
    checkBruteforceStatus();
  }, []);

  // Timer pour le décompte du blocage
  useEffect(() => {
    if (blockTimeLeft > 0) {
      const timer = setTimeout(() => {
        setBlockTimeLeft(prev => prev - 1);
        if (blockTimeLeft <= 1) {
          setIsBlocked(false);
          setBlockTimeLeft(0);
        }
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [blockTimeLeft]);

  const checkBruteforceStatus = async () => {
    try {
      const response = await fetch('/api/auth/check-bruteforce', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({}),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.isBlocked) {
          setIsBlocked(true);
          setBlockTimeLeft(data.blockTimeLeft);
        } else {
          setAttemptsLeft(data.attemptsLeft);
        }
      }
    } catch (error) {
      console.error('Erreur lors de la vérification du statut:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isBlocked) {
      toast.error(`Compte temporairement bloqué. Réessayez dans ${Math.ceil(blockTimeLeft / 60)} minutes.`);
      return;
    }

    setIsLoading(true);

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
        callbackUrl
      });

      if (result?.error) {
        // Enregistrer la tentative échouée
        await recordFailedAttempt();
        
        if (attemptsLeft <= 1) {
          setIsBlocked(true);
          setBlockTimeLeft(300); // 5 minutes
          toast.error('Trop de tentatives échouées. Compte bloqué pendant 5 minutes.');
        } else {
          setAttemptsLeft(prev => prev - 1);
          toast.error(`Email ou mot de passe incorrect. ${attemptsLeft - 1} tentatives restantes.`);
        }
      } else {
        // Réinitialiser les tentatives en cas de succès
        await resetAttempts();
        toast.success('Connexion réussie');
        router.push(callbackUrl);
        router.refresh();
      }
    } catch (error) {
      console.error('Erreur:', error);
      toast.error('Une erreur est survenue');
    } finally {
      setIsLoading(false);
    }
  };

  const recordFailedAttempt = async () => {
    try {
      await fetch('/api/auth/record-attempt', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ success: false }),
      });
    } catch (error) {
      console.error('Erreur lors de l\'enregistrement de la tentative:', error);
    }
  };

  const resetAttempts = async () => {
    try {
      await fetch('/api/auth/record-attempt', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ success: true }),
      });
    } catch (error) {
      console.error('Erreur lors de la réinitialisation des tentatives:', error);
    }
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="max-w-md w-full space-y-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gray-900/50 p-8 rounded-2xl backdrop-blur-lg"
        >
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-purple-500">
              Connexion
            </h2>
            <p className="mt-2 text-gray-400">
              Connectez-vous pour accéder à votre compte
            </p>
          </div>

          {/* Alerte de blocage */}
          {isBlocked && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mb-6 p-4 bg-red-900/50 border border-red-500 rounded-lg"
            >
              <div className="flex items-center space-x-2">
                <AlertTriangle className="w-5 h-5 text-red-400" />
                <div>
                  <p className="text-red-400 font-medium">Compte temporairement bloqué</p>
                  <p className="text-red-300 text-sm">
                    Réessayez dans {formatTime(blockTimeLeft)}
                  </p>
                </div>
              </div>
            </motion.div>
          )}

          {/* Indicateur de sécurité */}
          {!isBlocked && attemptsLeft < 5 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mb-6 p-4 bg-yellow-900/50 border border-yellow-500 rounded-lg"
            >
              <div className="flex items-center space-x-2">
                <Shield className="w-5 h-5 text-yellow-400" />
                <div>
                  <p className="text-yellow-400 font-medium">Protection anti-bruteforce active</p>
                  <p className="text-yellow-300 text-sm">
                    {attemptsLeft} tentatives restantes
                  </p>
                </div>
              </div>
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="sr-only">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isBlocked}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-700 rounded-lg bg-gray-800 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
                  placeholder="Adresse email"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="sr-only">
                Mot de passe
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isBlocked}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-700 rounded-lg bg-gray-800 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
                  placeholder="Mot de passe"
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={isLoading || isBlocked}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Connexion...' : isBlocked ? 'Compte bloqué' : 'Se connecter'}
              </button>
            </div>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-700" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-gray-900/50 text-gray-400">
                  Pas encore de compte ?
                </span>
              </div>
            </div>

            <div className="mt-6">
              <Link
                href="/register"
                className="w-full flex justify-center py-2 px-4 border border-gray-700 rounded-lg shadow-sm text-sm font-medium text-gray-400 bg-transparent hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Créer un compte
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
} 