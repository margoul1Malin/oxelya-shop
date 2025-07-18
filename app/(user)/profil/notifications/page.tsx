'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSession } from 'next-auth/react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Bell, Trash2, Mail, MailOpen, Check, X, Filter, Search, Archive, AlertCircle, Info, CheckCircle, Package } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'ORDER' | 'PROMOTION' | 'SYSTEM' | 'SECURITY';
  isRead: boolean;
  createdAt: string;
}

const NOTIFICATION_TYPES = {
  ORDER: { label: 'Commande', icon: Package, color: 'text-blue-400', bgColor: 'bg-blue-400/10', borderColor: 'border-blue-400/20' },
  PROMOTION: { label: 'Promotion', icon: Info, color: 'text-green-400', bgColor: 'bg-green-400/10', borderColor: 'border-green-400/20' },
  SYSTEM: { label: 'Système', icon: AlertCircle, color: 'text-yellow-400', bgColor: 'bg-yellow-400/10', borderColor: 'border-yellow-400/20' },
  SECURITY: { label: 'Sécurité', icon: CheckCircle, color: 'text-red-400', bgColor: 'bg-red-400/10', borderColor: 'border-red-400/20' }
};

export default function NotificationsPage() {
  const { data: session, status } = useSession();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [deletingAll, setDeletingAll] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
      return;
    }

    if (status === 'authenticated') {
      fetchNotifications();
    }
  }, [status, router]);

  const fetchNotifications = async () => {
    try {
      const response = await fetch('/api/user/notifications');
      if (response.ok) {
        const data = await response.json();
        setNotifications(data);
      }
    } catch (error) {
      console.error('Erreur:', error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id: string) => {
    try {
      const response = await fetch(`/api/user/notifications/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isRead: true }),
      });

      if (response.ok) {
        setNotifications(notifications.map(notif => 
          notif.id === id ? { ...notif, isRead: true } : notif
        ));
      }
    } catch (error) {
      console.error('Erreur:', error);
    }
  };

  const deleteNotification = async (id: string) => {
    try {
      const response = await fetch(`/api/user/notifications/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setNotifications(notifications.filter(notif => notif.id !== id));
        toast.success('Notification supprimée');
      }
    } catch (error) {
      console.error('Erreur:', error);
      toast.error('Erreur lors de la suppression');
    }
  };

  const deleteAllNotifications = async () => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer toutes les notifications ? Cette action est irréversible.')) {
      return;
    }

    setDeletingAll(true);
    try {
      // Supprimer chaque notification individuellement
      const deletePromises = notifications.map(notification => 
        fetch(`/api/user/notifications/${notification.id}`, {
          method: 'DELETE',
        })
      );

      await Promise.all(deletePromises);
      setNotifications([]);
      toast.success('Toutes les notifications ont été supprimées');
    } catch (error) {
      console.error('Erreur:', error);
      toast.error('Erreur lors de la suppression de toutes les notifications');
    } finally {
      setDeletingAll(false);
    }
  };

  const markAllAsRead = async () => {
    try {
      const response = await fetch('/api/user/notifications/read-all', {
        method: 'PUT',
      });

      if (response.ok) {
        setNotifications(notifications.map(notif => ({ ...notif, isRead: true })));
        toast.success('Toutes les notifications ont été marquées comme lues');
      }
    } catch (error) {
      console.error('Erreur:', error);
      toast.error('Erreur lors du marquage');
    }
  };

  const filteredNotifications = notifications.filter(notification => {
    const matchesFilter = filter === 'ALL' || 
                         (filter === 'UNREAD' && !notification.isRead) ||
                         (filter === 'READ' && notification.isRead) ||
                         notification.type === filter;
    const matchesSearch = searchTerm === '' || 
                         notification.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         notification.message.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  if (loading || status === 'loading') {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-700 rounded w-1/4 mb-6"></div>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-700/50 rounded-xl"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const unreadCount = notifications.filter(n => !n.isRead).length;
  const stats = {
    total: notifications.length,
    unread: unreadCount,
    read: notifications.length - unreadCount,
    order: notifications.filter(n => n.type === 'ORDER').length,
    promotion: notifications.filter(n => n.type === 'PROMOTION').length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col lg:flex-row lg:items-center justify-between gap-4"
      >
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-white mb-2">Notifications</h1>
          <p className="text-gray-400">
            {unreadCount > 0 
              ? `${unreadCount} notification${unreadCount > 1 ? 's' : ''} non lue${unreadCount > 1 ? 's' : ''}`
              : 'Toutes vos notifications sont lues'
            }
          </p>
        </div>

        {/* Quick Actions */}
        <div className="flex gap-3">
          {notifications.length > 0 && (
            <>
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600/20 text-blue-400 rounded-lg hover:bg-blue-600/30 transition-colors text-sm"
                >
                  <Check className="w-4 h-4" />
                  <span className="hidden lg:inline">Tout marquer comme lu</span>
                  <span className="lg:hidden">Tout lire</span>
                </button>
              )}
              
              <button
                onClick={deleteAllNotifications}
                disabled={deletingAll}
                className="flex items-center gap-2 px-4 py-2 bg-red-600/20 text-red-400 rounded-lg hover:bg-red-600/30 transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Trash2 className="w-4 h-4" />
                <span className="hidden lg:inline">
                  {deletingAll ? 'Suppression...' : 'Tout supprimer'}
                </span>
                <span className="lg:hidden">
                  {deletingAll ? '...' : 'Tout supprimer'}
                </span>
              </button>
            </>
          )}
        </div>
      </motion.div>

      {/* Stats */}
      {notifications.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-2 lg:grid-cols-5 gap-4"
        >
          <div className="bg-gray-800/50 rounded-lg p-4 text-center border border-gray-700/50">
            <p className="text-lg font-bold text-white">{stats.total}</p>
            <p className="text-xs text-gray-400">Total</p>
          </div>
          <div className="bg-gray-800/50 rounded-lg p-4 text-center border border-gray-700/50">
            <p className="text-lg font-bold text-blue-400">{stats.unread}</p>
            <p className="text-xs text-gray-400">Non lues</p>
          </div>
          <div className="bg-gray-800/50 rounded-lg p-4 text-center border border-gray-700/50">
            <p className="text-lg font-bold text-green-400">{stats.read}</p>
            <p className="text-xs text-gray-400">Lues</p>
          </div>
          <div className="bg-gray-800/50 rounded-lg p-4 text-center border border-gray-700/50">
            <p className="text-lg font-bold text-purple-400">{stats.order}</p>
            <p className="text-xs text-gray-400">Commandes</p>
          </div>
          <div className="bg-gray-800/50 rounded-lg p-4 text-center border border-gray-700/50">
            <p className="text-lg font-bold text-orange-400">{stats.promotion}</p>
            <p className="text-xs text-gray-400">Promotions</p>
          </div>
        </motion.div>
      )}

      {/* Filters */}
      {notifications.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gray-800/50 rounded-xl p-4 border border-gray-700/50"
        >
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Rechercher dans les notifications..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-gray-700/50 border border-gray-600/50 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500/50 focus:border-transparent"
              />
            </div>

            {/* Filter */}
            <div className="relative">
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="appearance-none bg-gray-700/50 border border-gray-600/50 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-blue-500/50 focus:border-transparent min-w-[150px]"
              >
                <option value="ALL">Toutes</option>
                <option value="UNREAD">Non lues</option>
                <option value="read">Lues</option>
                <option value="ORDER">Commandes</option>
                <option value="PROMOTION">Promotions</option>
                <option value="SYSTEM">Système</option>
                <option value="SECURITY">Sécurité</option>
              </select>
            </div>
          </div>
        </motion.div>
      )}

      {/* Notifications List */}
      <div className="space-y-3">
        <AnimatePresence>
          {filteredNotifications.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-16"
            >
              <Bell className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-300 mb-2">
                {notifications.length === 0 ? 'Aucune notification' : 'Aucun résultat'}
              </h3>
              <p className="text-gray-500">
                {notifications.length === 0 
                  ? 'Vous recevrez ici vos notifications importantes'
                  : 'Essayez de modifier vos filtres de recherche'
                }
              </p>
            </motion.div>
          ) : (
            filteredNotifications.map((notification, index) => {
              const notifType = NOTIFICATION_TYPES[notification.type] || NOTIFICATION_TYPES.SYSTEM;
              const TypeIcon = notifType.icon;
              
              return (
                <motion.div
                  key={notification.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -100 }}
                  transition={{ delay: index * 0.05 }}
                  className={`bg-gray-800/50 backdrop-blur-sm rounded-xl border transition-all duration-200 overflow-hidden ${
                    notification.isRead 
                      ? 'border-gray-700/50 opacity-75' 
                      : 'border-blue-500/30 shadow-lg shadow-blue-500/10'
                  }`}
                >
                  <div className="p-4 lg:p-6">
                    <div className="flex items-start gap-4">
                      {/* Icon */}
                      <div className={`p-3 rounded-xl flex-shrink-0 border ${notifType.bgColor} ${notifType.borderColor}`}>
                        <TypeIcon className={`w-5 h-5 ${notifType.color}`} />
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-4 mb-2">
                          <h3 className={`font-medium text-sm lg:text-base ${notification.isRead ? 'text-gray-300' : 'text-white'}`}>
                            {notification.title}
                          </h3>
                          <button
                            onClick={() => deleteNotification(notification.id)}
                            className="p-2 text-gray-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all duration-200 flex-shrink-0"
                            title="Supprimer cette notification"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>

                        <p className="text-sm text-gray-400 mb-4 line-clamp-3">
                          {notification.message}
                        </p>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <span className={`text-xs px-2 py-1 rounded-lg border ${notifType.bgColor} ${notifType.borderColor} ${notifType.color}`}>
                              {notifType.label}
                            </span>
                            <span className="text-xs text-gray-500">
                              {format(new Date(notification.createdAt), 'dd MMM à HH:mm', { locale: fr })}
                            </span>
                          </div>

                          {!notification.isRead && (
                            <button
                              onClick={() => markAsRead(notification.id)}
                              className="text-xs text-blue-400 hover:text-blue-300 transition-colors flex items-center gap-1"
                            >
                              <Check className="w-3 h-3" />
                              Marquer comme lu
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })
          )}
        </AnimatePresence>
      </div>
    </div>
  );
} 