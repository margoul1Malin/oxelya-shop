'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Scale, Shield, FileText, ArrowLeft } from 'lucide-react';

const legalPages = [
  {
    href: '/mentions-legales',
    title: 'Mentions Légales',
    icon: FileText,
    description: 'Informations légales obligatoires'
  },
  {
    href: '/politique-de-confidentialite',
    title: 'Politique de Confidentialité',
    icon: Shield,
    description: 'Protection de vos données personnelles'
  },
  {
    href: '/conditions-generales-de-vente',
    title: 'Conditions Générales de Vente',
    icon: Scale,
    description: 'Termes et conditions de vente'
  }
];

export default function LegalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 pt-24">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="flex items-center justify-center gap-2 mb-4">
            <Scale className="w-8 h-8 text-blue-400" />
            <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              Informations Légales
            </h1>
          </div>
          <p className="text-gray-300 text-lg max-w-2xl mx-auto">
            Toutes les informations légales relatives à l'utilisation de notre site
          </p>
        </motion.div>

        {/* Navigation */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <div className="grid md:grid-cols-3 gap-4">
            {legalPages.map((page) => {
              const IconComponent = page.icon;
              const isActive = pathname === page.href;
              
              return (
                <Link
                  key={page.href}
                  href={page.href}
                  className={`block p-4 rounded-xl border transition-all duration-300 ${
                    isActive
                      ? 'bg-blue-500/20 border-blue-500/50 text-white'
                      : 'bg-gray-800/30 border-gray-700/50 text-gray-300 hover:bg-gray-700/30 hover:border-gray-600/50'
                  }`}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <IconComponent className={`w-5 h-5 ${isActive ? 'text-blue-400' : 'text-gray-400'}`} />
                    <h3 className="font-semibold">{page.title}</h3>
                  </div>
                  <p className="text-sm text-gray-400">{page.description}</p>
                </Link>
              );
            })}
          </div>
        </motion.div>

        {/* Back to home */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-8"
        >
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-blue-400 hover:text-blue-300 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Retour à l'accueil
          </Link>
        </motion.div>

        {/* Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-gray-800/30 backdrop-blur-sm rounded-2xl p-8 border border-gray-700/50"
        >
          {children}
        </motion.div>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-8 text-center text-gray-400 text-sm"
        >
          <p>
            Ces documents ont été mis à jour le {new Date().toLocaleDateString('fr-FR', {
              day: 'numeric',
              month: 'long',
              year: 'numeric'
            })}
          </p>
          <p className="mt-2">
            Pour toute question concernant ces informations légales, contactez-nous à{' '}
            <a href="mailto:contact@margoul1.dev" className="text-blue-400 hover:text-blue-300">
              contact@margoul1.dev
            </a>
          </p>
        </motion.div>
      </div>
    </div>
  );
} 