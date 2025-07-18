'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Package, Bell, Settings, Menu, X, ChevronRight, Home, FileText } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import ProtectedRoute from '../../../components/auth/ProtectedRoute';

const menuItems = [
  {
    title: 'Vue d\'ensemble',
    icon: User,
    href: '/profil',
    description: 'Vos informations personnelles'
  },
  {
    title: 'Commandes',
    icon: Package,
    href: '/profil/commandes',
    description: 'Historique de vos achats'
  },
  {
    title: 'Factures',
    icon: FileText,
    href: '/profil/factures',
    description: 'Vos factures et documents'
  },
  {
    title: 'Notifications',
    icon: Bell,
    href: '/profil/notifications',
    description: 'Messages et alertes'
  },
  {
    title: 'Paramètres',
    icon: Settings,
    href: '/profil/parametres',
    description: 'Configuration du compte'
  }
];

export default function ProfileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const getPageTitle = () => {
    const currentItem = menuItems.find(item => item.href === pathname);
    return currentItem?.title || 'Profil';
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-black">
        {/* Mobile Header */}
        <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-black/95 backdrop-blur-sm border-b border-gray-800 pt-16">
          <div className="flex items-center justify-between px-4 py-3">
            <div className="flex items-center gap-3">
              <Link 
                href="/"
                className="p-2 rounded-lg bg-gray-800/50 text-gray-300 hover:text-white hover:bg-gray-700/50 transition-all"
                title="Retour à l'accueil"
              >
                <Home className="w-5 h-5" />
              </Link>
              <div>
                <h1 className="text-lg font-bold text-white">{getPageTitle()}</h1>
                <p className="text-xs text-gray-400">Mon espace personnel</p>
              </div>
            </div>
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 rounded-lg bg-gray-800/50 text-gray-300 hover:text-white hover:bg-gray-700/50 transition-all"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu Overlay */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="lg:hidden fixed inset-0 z-40 bg-black/80"
              onClick={() => setIsMobileMenuOpen(false)}
            />
          )}
        </AnimatePresence>

        {/* Mobile Navigation */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 20, stiffness: 100 }}
              className="lg:hidden fixed left-0 top-0 bottom-0 z-50 w-80 bg-gray-900/95 backdrop-blur-sm border-r border-gray-800 pt-20"
            >
              <div className="p-6">
                {/* Lien vers l'accueil en haut du menu mobile */}
                <Link
                  href="/"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center p-4 mb-4 rounded-xl text-gray-300 hover:text-white hover:bg-gray-800/50 transition-all border border-gray-700/50"
                >
                  <Home className="w-5 h-5 mr-3" />
                  <div className="flex-1">
                    <p className="font-medium">Accueil</p>
                    <p className="text-xs text-gray-400">Retour à la boutique</p>
                  </div>
                  <ChevronRight className="w-4 h-4 opacity-50" />
                </Link>

                {/* Navigation */}
                <nav className="space-y-2">
                  {menuItems.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className={`group flex items-center p-4 rounded-xl transition-all duration-200 ${
                          isActive 
                            ? 'bg-gradient-to-r from-blue-600/20 to-purple-600/20 border border-blue-500/30 text-white' 
                            : 'text-gray-300 hover:text-white hover:bg-gray-800/50'
                        }`}
                      >
                        <item.icon className={`w-5 h-5 mr-3 ${isActive ? 'text-blue-400' : ''}`} />
                        <div className="flex-1">
                          <p className="font-medium">{item.title}</p>
                          <p className="text-xs text-gray-400">{item.description}</p>
                        </div>
                        <ChevronRight className="w-4 h-4 opacity-50 group-hover:opacity-100 transition-opacity" />
                      </Link>
                    );
                  })}
                </nav>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="lg:flex min-h-screen">
          {/* Desktop Sidebar */}
          <div className="hidden lg:block w-80 bg-gray-900/50 backdrop-blur-sm border-r border-gray-800">
            <div className="sticky top-20 p-6">
              {/* Navigation */}
              <nav className="space-y-3">
                {menuItems.map((item) => {
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`group flex items-center p-4 rounded-xl transition-all duration-200 ${
                        isActive 
                          ? 'bg-gradient-to-r from-blue-600/20 to-purple-600/20 border border-blue-500/30 text-white shadow-lg' 
                          : 'text-gray-300 hover:text-white hover:bg-gray-800/30'
                      }`}
                    >
                      <item.icon className={`w-6 h-6 mr-4 ${isActive ? 'text-blue-400' : ''}`} />
                      <div className="flex-1">
                        <p className="font-medium">{item.title}</p>
                        <p className="text-xs text-gray-500 mt-1">{item.description}</p>
                      </div>
                      {isActive && (
                        <div className="w-2 h-2 rounded-full bg-blue-400"></div>
                      )}
                    </Link>
                  );
                })}
              </nav>
            </div>
          </div>
          
          {/* Content */}
          <div className="flex-1 pt-20 lg:pt-6">
            <div className="p-4 lg:p-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="max-w-none"
              >
                {children}
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
} 