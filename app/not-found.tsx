'use client';

import { motion } from 'framer-motion';
import { Home, ArrowLeft, Search, AlertTriangle } from 'lucide-react';
import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-4">
      <div className="max-w-2xl mx-auto text-center">
        {/* Animation d'erreur */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <div className="relative">
            {/* Cercle de fond animé */}
            <motion.div
              animate={{ 
                scale: [1, 1.1, 1],
                rotate: [0, 5, -5, 0]
              }}
              transition={{ 
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className="absolute inset-0 bg-gradient-to-r from-red-500/20 to-purple-500/20 rounded-full blur-3xl"
            />
            
            {/* Icône d'erreur */}
            <div className="relative z-10">
              <AlertTriangle className="w-32 h-32 mx-auto text-red-500 mb-6" />
            </div>
          </div>
        </motion.div>

        {/* Titre principal */}
        <motion.h1
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-6xl md:text-8xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-red-500 via-purple-500 to-blue-500 mb-4"
        >
          404
        </motion.h1>

        {/* Sous-titre */}
        <motion.h2
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="text-2xl md:text-3xl font-semibold text-white mb-4"
        >
          Page introuvable
        </motion.h2>

        {/* Description */}
        <motion.p
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="text-gray-400 text-lg mb-8 max-w-md mx-auto"
        >
          Désolé, la page que vous recherchez n'existe pas ou a été déplacée. 
          Vérifiez l'URL ou utilisez les liens ci-dessous pour naviguer.
        </motion.p>

        {/* Boutons d'action */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="flex flex-col sm:flex-row gap-4 justify-center items-center"
        >
          {/* Bouton retour accueil */}
          <Link
            href="/"
            className="group flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-xl font-semibold hover:from-blue-600 hover:to-purple-600 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
          >
            <Home className="w-5 h-5 group-hover:animate-pulse" />
            Retour à l'accueil
          </Link>

          {/* Bouton retour précédent */}
          <button
            onClick={() => window.history.back()}
            className="group flex items-center gap-3 px-8 py-4 bg-gray-800 text-white rounded-xl font-semibold hover:bg-gray-700 transition-all duration-300 transform hover:scale-105 border border-gray-700 hover:border-gray-600"
          >
            <ArrowLeft className="w-5 h-5 group-hover:animate-pulse" />
            Page précédente
          </button>
        </motion.div>

        {/* Liens rapides */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="mt-12"
        >
          <h3 className="text-lg font-semibold text-white mb-4">Liens rapides</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { href: '/produits', label: 'Nos Produits', icon: Search },
              { href: '/contact', label: 'Contact', icon: Home },
              { href: '/categories', label: 'Catégories', icon: Home }
            ].map((link, index) => (
              <motion.div
                key={link.href}
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.7 + index * 0.1 }}
              >
                <Link
                  href={link.href}
                  className="block p-4 bg-gray-800/50 rounded-lg hover:bg-gray-700/50 transition-all duration-300 border border-gray-700 hover:border-gray-600"
                >
                  <div className="flex items-center gap-3">
                    <link.icon className="w-5 h-5 text-blue-400" />
                    <span className="text-white font-medium">{link.label}</span>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Message d'aide */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="mt-8 p-4 bg-blue-900/20 border border-blue-500/30 rounded-lg"
        >
          <p className="text-blue-300 text-sm">
            💡 <strong>Conseil :</strong> Utilisez la barre de recherche en haut de page 
            pour trouver rapidement ce que vous cherchez.
          </p>
        </motion.div>
      </div>

      {/* Particules de fond */}
      <div className="fixed inset-0 pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-blue-500/20 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -30, 0],
              opacity: [0.2, 0.8, 0.2],
            }}
            transition={{
              duration: 4 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
          />
        ))}
      </div>
    </div>
  );
} 