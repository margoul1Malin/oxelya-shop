'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Bell, Package, Info, CheckCircle, XCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { useSession } from 'next-auth/react';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: string;
  createdAt: string;
  isRead: boolean;
}

export default function NotificationsList() {
  const { data: session, status } = useSession();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (status === 'authenticated') {
      fetchNotifications();
    }
  }, [status]);

  const fetchNotifications = async () => {
    try {
      const response = await fetch('/api/user/notifications', {
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error('Erreur lors de la récupération des notifications');
      }
      
      const data = await response.json();
      setNotifications(data);
    } catch (error) {
      console.error('Erreur:', error);
      toast.error('Impossible de charger les notifications');
    } finally {
      setIsLoading(false);
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'ORDER':
        return <Package className="w-6 h-6 text-blue-500" />;
      case 'INFO':
        return <Info className="w-6 h-6 text-purple-500" />;
      case 'SUCCESS':
        return <CheckCircle className="w-6 h-6 text-green-500" />;
      case 'ERROR':
        return <XCircle className="w-6 h-6 text-red-500" />;
      default:
        return <Bell className="w-6 h-6 text-gray-500" />;
    }
  };

  if (status === 'loading' || isLoading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (status === 'unauthenticated') {
    return (
      <div className="text-center py-8">
        <p className="text-gray-400">Veuillez vous connecter pour voir vos notifications</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {notifications.length === 0 ? (
        <div className="text-center py-8">
          <Bell className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-400">Aucune notification</p>
        </div>
      ) : (
        <AnimatePresence>
          {notifications.map((notification) => (
            <motion.div
              key={notification.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className={`bg-gray-800/50 rounded-lg p-4 ${
                notification.isRead ? 'opacity-60' : ''
              }`}
            >
              <div className="flex gap-4">
                {getIcon(notification.type)}
                <div className="flex-1">
                  <h3 className="font-medium text-white">{notification.title}</h3>
                  <p className="text-gray-400 text-sm mt-1">{notification.message}</p>
                  <p className="text-xs text-gray-500 mt-2">
                    {format(new Date(notification.createdAt), 'dd MMMM yyyy à HH:mm', {
                      locale: fr
                    })}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      )}
    </div>
  );
} 