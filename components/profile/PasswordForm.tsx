'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { toast } from 'react-hot-toast';
import { Eye, EyeOff, Lock, Check, Loader } from 'lucide-react';
import { motion } from 'framer-motion';

interface PasswordFormProps {
  onSubmit: (data: { currentPassword: string; newPassword: string }) => Promise<void>;
}

export default function PasswordForm({ onSubmit }: PasswordFormProps) {
  const { data: session, status } = useSession();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [isPeeking, setIsPeeking] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (status !== 'authenticated') {
      toast.error('Vous devez être connecté');
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error('Les mots de passe ne correspondent pas');
      return;
    }

    if (newPassword.length < 6) {
      toast.error('Le nouveau mot de passe doit contenir au moins 6 caractères');
      return;
    }

    setIsLoading(true);

    try {
      await onSubmit({
        currentPassword,
        newPassword
      });
      
      toast.success('Mot de passe mis à jour avec succès');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error) {
      console.error('Erreur détaillée:', error);
      toast.error(error instanceof Error ? error.message : 'Erreur lors de la mise à jour du mot de passe');
    } finally {
      setIsLoading(false);
    }
  };

  // Fonction pour gérer l'état de la saisie
  const handleInputFocus = () => setIsTyping(true);
  const handleInputBlur = (value: string) => {
    if (!value) setIsTyping(false);
  };

  // Fonction pour gérer le clic sur les icônes de visibilité
  const isAnyPasswordVisible = showCurrentPassword || showNewPassword || showConfirmPassword;

  return (
    <div className="bg-gray-800/50 rounded-xl p-6 backdrop-blur-sm border border-gray-700/50">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-500/10 rounded-lg">
            <Lock className="w-5 h-5 text-blue-500" />
          </div>
          <h2 className="text-xl font-semibold text-white">Changer le mot de passe</h2>
        </div>

        {/* Œil animé */}
        <motion.div
          className="relative w-10 h-10"
          initial="idle"
          animate={isTyping ? "hiding" : isAnyPasswordVisible ? "peeking" : "idle"}
        >
          {/* Contour de l'œil */}
          <div className="absolute inset-0 bg-gradient-to-br from-gray-700 to-gray-800 rounded-full border border-gray-600/50" />
          
          {/* Iris */}
          <motion.div
            className="absolute inset-2 rounded-full overflow-hidden"
            variants={{
              idle: { height: "auto", scaleY: 1 },
              hiding: { height: "2px", scaleY: 0 },
              peeking: { height: "auto", scaleY: 0.5 }
            }}
            transition={{ duration: 0.2 }}
          >
            {/* Dégradé de l'iris */}
            <div className="absolute inset-0 bg-gradient-to-b from-blue-400 to-blue-600" />
            
            {/* Reflet */}
            <div className="absolute inset-x-1 top-1 h-2 bg-blue-300/30 rounded-full blur-[1px]" />
            
            {/* Pupille */}
            <div className="absolute inset-2 bg-gray-900 rounded-full">
              {/* Reflet de la pupille */}
              <div className="absolute top-0.5 left-1 w-1.5 h-1.5 bg-blue-400/40 rounded-full" />
            </div>
          </motion.div>

          {/* Paupière supérieure */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-b from-gray-800 to-gray-900 rounded-full origin-top"
            variants={{
              idle: { scaleY: 0 },
              hiding: { scaleY: 0.5 },
              peeking: { scaleY: 0.3 }
            }}
            transition={{ duration: 0.15 }}
          />

          {/* Paupière inférieure */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-t from-gray-800 to-gray-900 rounded-full origin-bottom"
            variants={{
              idle: { scaleY: 0 },
              hiding: { scaleY: 0.5 },
              peeking: { scaleY: 0.3 }
            }}
            transition={{ duration: 0.15 }}
          />
        </motion.div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-4">
          {/* Mot de passe actuel */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Mot de passe actuel
            </label>
            <div className="relative">
              <input
                type={showCurrentPassword ? 'text' : 'password'}
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                onFocus={handleInputFocus}
                onBlur={(e) => handleInputBlur(e.target.value)}
                className="w-full px-4 py-2.5 bg-gray-900/50 rounded-lg border border-gray-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-white transition-colors"
                required
              />
              <button
                type="button"
                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
              >
                {showCurrentPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {/* Nouveau mot de passe */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Nouveau mot de passe
            </label>
            <div className="relative">
              <input
                type={showNewPassword ? 'text' : 'password'}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                onFocus={handleInputFocus}
                onBlur={(e) => handleInputBlur(e.target.value)}
                className="w-full px-4 py-2.5 bg-gray-900/50 rounded-lg border border-gray-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-white transition-colors"
                required
                minLength={6}
              />
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
              >
                {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            <p className="mt-1 text-xs text-gray-400">
              Le mot de passe doit contenir au moins 6 caractères
            </p>
          </div>

          {/* Confirmer le nouveau mot de passe */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Confirmer le nouveau mot de passe
            </label>
            <div className="relative">
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                onFocus={handleInputFocus}
                onBlur={(e) => handleInputBlur(e.target.value)}
                className="w-full px-4 py-2.5 bg-gray-900/50 rounded-lg border border-gray-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-white transition-colors"
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
              >
                {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isLoading}
            className={`flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-lg transition-all duration-200 ${
              isLoading ? 'opacity-50 cursor-not-allowed' : 'hover:scale-[1.02]'
            }`}
          >
            {isLoading ? (
              <>
                <Loader className="w-4 h-4 animate-spin" />
                Mise à jour...
              </>
            ) : (
              <>
                <Check className="w-4 h-4" />
                Mettre à jour
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
} 