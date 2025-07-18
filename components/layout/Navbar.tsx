'use client';

import Link from 'next/link';
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag, Menu, X, User, LogOut, UserCog, Settings, Package, Bell, ShoppingCart, Shield, Check, Trash } from 'lucide-react';
import { useCart } from '../../components/cart/CartProvider';
import CartDrawer from '../cart/CartDrawer';
import { useAuth } from '../../hooks/useAuth';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useNotifications } from '../../hooks/useNotifications';

const navigation = [
  { name: 'Accueil', href: '/' },
  { name: 'Produits', href: '/produits' },
  { name: 'Catégories', href: '/categories' },
  { name: 'Support', href: '/support' },
  { name: 'Contact', href: '/contact' }
];

const categories = [
  { name: 'Gadgets', href: '/categories/gadgets' },
  { name: 'Softwares', href: '/categories/softwares' },
  { name: 'Services', href: '/categories/services' }
];

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const { state } = useCart();
  const { isAuthenticated, user, logout } = useAuth();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const notificationRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const { notifications, unreadCount, markAsRead, markAllAsRead, deleteNotification } = useNotifications();

  // Fermer les menus au clic en dehors
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowProfileMenu(false);
      }
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleNavigation = (path: string) => {
    setIsOpen(false); // Fermer le menu mobile
    router.push(path);
  };

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 bg-black/80 backdrop-blur-sm z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2">
              <ShoppingBag className="w-8 h-8 text-blue-500" />
              <span className="text-xl font-bold bg-gradient-to-r from-blue-300 to-purple-500 bg-clip-text text-transparent">
                Oxelya Shop
              </span>
            </Link>

            {/* Navigation desktop */}
            <div className="hidden md:flex items-center space-x-4">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={(e) => {
                    e.preventDefault();
                    handleNavigation(item.href);
                  }}
                  className="text-gray-300 hover:text-white px-3 py-2 rounded-lg hover:bg-gray-800/50 transition-all"
                >
                  {item.name}
                </Link>
              ))}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-4">
              {/* Panier */}
              <button
                onClick={() => setIsCartOpen(true)}
                className="relative p-2 text-gray-300 hover:text-white hover:bg-gray-800/50 rounded-lg transition-all"
              >
                <ShoppingCart className="w-6 h-6" />
                {state.items.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-gradient-to-r from-blue-500 to-purple-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                    {state.items.length}
                  </span>
                )}
              </button>

              {/* Notifications */}
              {isAuthenticated && (
                <div className="relative" ref={notificationRef}>
                  <button
                    onClick={() => setShowNotifications(!showNotifications)}
                    className="relative p-2 text-gray-300 hover:text-white hover:bg-gray-800/50 rounded-lg transition-all"
                  >
                    <Bell className="w-6 h-6" />
                    {unreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 bg-gradient-to-r from-red-500 to-orange-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                        {unreadCount > 99 ? '99+' : unreadCount}
                      </span>
                    )}
                  </button>

                  <AnimatePresence>
                    {showNotifications && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className="absolute right-0 mt-2 w-80 bg-gray-900/95 backdrop-blur-sm rounded-lg shadow-lg border border-gray-800 max-h-96 overflow-hidden"
                      >
                        <div className="p-4 border-b border-gray-700 flex justify-between items-center">
                          <h3 className="text-white font-medium">Notifications</h3>
                          {unreadCount > 0 && (
                            <button
                              onClick={markAllAsRead}
                              className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1"
                            >
                              <Check className="w-3 h-3" />
                              Tout marquer comme lu
                            </button>
                          )}
                        </div>

                        <div className="max-h-72 overflow-y-auto">
                          {notifications.length === 0 ? (
                            <div className="p-4 text-center text-gray-400">
                              Aucune notification
                            </div>
                          ) : (
                            notifications.slice(0, 10).map((notification) => (
                              <div
                                key={notification.id}
                                className={`p-3 border-b border-gray-700/50 hover:bg-gray-700/30 transition-colors ${
                                  !notification.isRead ? 'bg-blue-500/5 border-l-2 border-l-blue-500' : ''
                                }`}
                              >
                                <div className="flex justify-between items-start gap-2">
                                  <div className="flex-1 min-w-0">
                                    <h4 className={`text-sm font-medium truncate ${
                                      !notification.isRead ? 'text-white' : 'text-gray-300'
                                    }`}>
                                      {notification.title}
                                    </h4>
                                    <p className="text-xs text-gray-400 mt-1 line-clamp-2">
                                      {notification.message}
                                    </p>
                                    <p className="text-xs text-gray-500 mt-1">
                                      {new Date(notification.createdAt).toLocaleDateString('fr-FR', {
                                        day: '2-digit',
                                        month: '2-digit',
                                        hour: '2-digit',
                                        minute: '2-digit'
                                      })}
                                    </p>
                                  </div>
                                  <div className="flex items-center gap-1">
                                    {!notification.isRead && (
                                      <button
                                        onClick={() => markAsRead(notification.id)}
                                        className="p-1 text-blue-400 hover:text-blue-300 rounded"
                                        title="Marquer comme lu"
                                      >
                                        <Check className="w-3 h-3" />
                                      </button>
                                    )}
                                    <button
                                      onClick={() => deleteNotification(notification.id)}
                                      className="p-1 text-red-400 hover:text-red-300 rounded"
                                      title="Supprimer"
                                    >
                                      <Trash className="w-3 h-3" />
                                    </button>
                                  </div>
                                </div>
                              </div>
                            ))
                          )}
                        </div>

                        {notifications.length > 0 && (
                          <div className="p-3 border-t border-gray-700">
                            <Link
                              href="/profil/notifications"
                              onClick={() => setShowNotifications(false)}
                              className="block text-center text-sm text-blue-400 hover:text-blue-300"
                            >
                              Voir toutes les notifications
                            </Link>
                          </div>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}

              {/* Menu utilisateur */}
              {isAuthenticated ? (
                <div className="relative" ref={menuRef}>
                  <button
                    onClick={() => setShowProfileMenu(!showProfileMenu)}
                    className="flex items-center gap-2 text-gray-300 hover:text-white p-2 hover:bg-gray-800/50 rounded-lg transition-all"
                  >
                    <User className="w-6 h-6" />
                  </button>

                  <AnimatePresence>
                    {showProfileMenu && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className="absolute right-0 mt-2 w-48 bg-gray-900/95 backdrop-blur-sm rounded-lg shadow-lg py-1 border border-gray-800"
                      >
                        <div className="px-4 py-2 border-b border-gray-700">
                          <p className="text-sm text-white font-medium truncate">
                            {user?.name || user?.email || 'Utilisateur'}
                          </p>
                        </div>

                        <Link
                          href="/profil"
                          className="flex items-center gap-2 px-4 py-2 text-sm text-gray-300 hover:bg-gray-700/50 transition-colors"
                          onClick={() => setShowProfileMenu(false)}
                        >
                          <User className="w-4 h-4" />
                          Mon profil
                        </Link>

                        <Link
                          href="/profil/commandes"
                          className="flex items-center gap-2 px-4 py-2 text-sm text-gray-300 hover:bg-gray-700/50 transition-colors"
                          onClick={() => setShowProfileMenu(false)}
                        >
                          <Package className="w-4 h-4" />
                          Mes commandes
                        </Link>

                        <Link
                          href="/profil/notifications"
                          className="flex items-center gap-2 px-4 py-2 text-sm text-gray-300 hover:bg-gray-700/50 transition-colors"
                          onClick={() => setShowProfileMenu(false)}
                        >
                          <Bell className="w-4 h-4" />
                          Notifications
                        </Link>

                        <Link
                          href="/profil/parametres"
                          className="flex items-center gap-2 px-4 py-2 text-sm text-gray-300 hover:bg-gray-700/50 transition-colors"
                          onClick={() => setShowProfileMenu(false)}
                        >
                          <Settings className="w-4 h-4" />
                          Paramètres
                        </Link>

                        {user?.role === 'ADMIN' && (
                          <Link
                            href="/admin"
                            className="flex items-center gap-2 px-4 py-2 text-sm text-purple-400 hover:bg-gray-700/50 transition-colors"
                            onClick={() => setShowProfileMenu(false)}
                          >
                            <Shield className="w-4 h-4" />
                            Administration
                          </Link>
                        )}

                        <button
                          onClick={() => {
                            signOut();
                            setShowProfileMenu(false);
                          }}
                          className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-400 hover:bg-gray-700/50 transition-colors"
                        >
                          <LogOut className="w-4 h-4" />
                          Déconnexion
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <Link
                  href="/login"
                  className="text-gray-300 hover:text-white p-2 hover:bg-gray-800/50 rounded-lg transition-all"
                >
                  Connexion
                </Link>
              )}

              {/* Menu mobile */}
              <button
                onClick={() => setIsOpen(!isOpen)}
                className="md:hidden p-2 text-gray-300 hover:text-white hover:bg-gray-800/50 rounded-lg transition-all"
              >
                {isOpen ? (
                  <X className="w-6 h-6" />
                ) : (
                  <Menu className="w-6 h-6" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Menu mobile */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden bg-black/80 backdrop-blur-sm border-t border-gray-800"
            >
              <div className="px-2 pt-2 pb-3 space-y-1">
                {navigation.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={(e) => {
                      e.preventDefault();
                      handleNavigation(item.href);
                    }}
                    className="block px-3 py-2 text-gray-300 hover:text-white hover:bg-gray-800/50 rounded-lg transition-all"
                  >
                    {item.name}
                  </Link>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* Drawer du panier */}
      <CartDrawer 
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
      />
    </>
  );
} 