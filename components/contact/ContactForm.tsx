'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Send, Loader, User, MessageSquare } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

export default function ContactForm() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    subject: '',
    content: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.subject.trim() || !formData.content.trim()) {
      toast.error('Veuillez remplir tous les champs');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/messages', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Erreur lors de l\'envoi du message');
      }

      toast.success('Message envoyé avec succès');
      setFormData({ subject: '', content: '' });
      
      // Si l'utilisateur n'est pas connecté, afficher un message informatif
      if (!session) {
        toast.success('Vous devrez vous connecter pour recevoir une réponse', {
          duration: 4000
        });
      }
    } catch (error: any) {
      console.error('Erreur:', error);
      toast.error(error.message || 'Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.form
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gray-800/80 backdrop-blur-sm rounded-2xl p-8 shadow-2xl border border-gray-700/50"
      onSubmit={handleSubmit}
    >
      <div className="space-y-8">
        {/* En-tête du formulaire */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full mb-4">
            <MessageSquare className="w-8 h-8 text-white" />
          </div>
          <h3 className="text-2xl font-bold text-white mb-2">Envoyez votre message</h3>
          <p className="text-gray-400">Nous vous répondrons dans les plus brefs délais</p>
        </div>

        {/* Champ Sujet */}
        <div className="space-y-2">
          <label className="block text-gray-300 font-medium">Sujet</label>
          <div className="relative">
            <input
              type="text"
              value={formData.subject}
              onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
              className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600/50 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-white placeholder-gray-400 transition-all duration-300 hover:bg-gray-700/70"
              placeholder="Ex: Question sur un produit"
              required
              minLength={3}
            />
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
              <User className="h-5 w-5 text-gray-400" />
            </div>
          </div>
        </div>

        {/* Champ Message */}
        <div className="space-y-2">
          <label className="block text-gray-300 font-medium">Message</label>
          <div className="relative">
            <textarea
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600/50 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-white placeholder-gray-400 h-40 resize-none transition-all duration-300 hover:bg-gray-700/70"
              placeholder="Décrivez votre question ou problème..."
              required
              minLength={10}
            />
            <div className="absolute top-3 right-3 pointer-events-none">
              <MessageSquare className="h-5 w-5 text-gray-400" />
            </div>
          </div>
        </div>

        {/* Bouton d'envoi */}
        <div className="flex justify-end pt-4">
          <motion.button
            type="submit"
            disabled={loading}
            className="group relative px-8 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl hover:from-blue-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-3 font-medium transition-all duration-300 hover:scale-105 shadow-lg"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {loading ? (
              <>
                <Loader className="w-5 h-5 animate-spin" />
                Envoi en cours...
              </>
            ) : (
              <>
                <Send className="w-5 h-5 transition-transform group-hover:translate-x-1" />
                Envoyer le message
              </>
            )}
            <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-blue-500 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10" />
          </motion.button>
        </div>

        {/* Message de connexion */}
        {!session && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4 text-center"
          >
            <p className="text-blue-400 text-sm">
              Vous n'êtes pas connecté. Vous pouvez envoyer un message, mais vous devrez vous connecter pour recevoir une réponse.{' '}
              <button
                onClick={() => router.push('/login')}
                className="text-blue-300 hover:text-blue-200 underline font-medium transition-colors"
              >
                Se connecter
              </button>
            </p>
          </motion.div>
        )}

        {/* Informations supplémentaires */}
        <div className="text-center pt-4 border-t border-gray-700/50">
          <p className="text-gray-400 text-sm">
            Temps de réponse moyen : <span className="text-blue-400 font-medium">24h</span>
          </p>
        </div>
      </div>
    </motion.form>
  );
} 