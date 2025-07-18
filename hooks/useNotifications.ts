'use client';

import { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-hot-toast';
import { useSession } from 'next-auth/react';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  createdAt: string;
  orderId?: string;
}

export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const { data: session } = useSession();

  const fetchNotifications = useCallback(async () => {
    if (!session?.user) return;
    
    try {
      setIsLoading(true);
      const response = await fetch('/api/user/notifications', {
        cache: 'no-store'
      });
      
      if (!response.ok) {
        if (response.status === 401) return; // Utilisateur non connecté
        throw new Error('Erreur lors de la récupération des notifications');
      }
      
      const data = await response.json();
      setNotifications(data);
      setUnreadCount(data.filter((n: Notification) => !n.isRead).length);
    } catch (error) {
      console.error('Erreur notifications:', error);
      // Ne pas afficher d'erreur si l'utilisateur n'est pas connecté
      if (session?.user) {
        toast.error('Impossible de charger les notifications');
      }
    } finally {
      setIsLoading(false);
    }
  }, [session?.user]);

  const markAsRead = useCallback(async (notificationId: string) => {
    try {
      const response = await fetch(`/api/user/notifications/${notificationId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ isRead: true }),
      });

      if (!response.ok) throw new Error('Erreur lors de la mise à jour');

      // Mettre à jour localement
      setNotifications(prev => 
        prev.map(notification => 
          notification.id === notificationId 
            ? { ...notification, isRead: true }
            : notification
        )
      );
      
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Erreur:', error);
      toast.error('Erreur lors de la mise à jour de la notification');
    }
  }, []);

  const markAllAsRead = useCallback(async () => {
    try {
      const response = await fetch('/api/user/notifications/read-all', {
        method: 'POST',
      });

      if (!response.ok) throw new Error('Erreur lors de la mise à jour');

      // Mettre à jour localement
      setNotifications(prev => 
        prev.map(notification => ({ ...notification, isRead: true }))
      );
      setUnreadCount(0);
      toast.success('Toutes les notifications ont été marquées comme lues');
    } catch (error) {
      console.error('Erreur:', error);
      toast.error('Erreur lors de la mise à jour des notifications');
    }
  }, []);

  const deleteNotification = useCallback(async (notificationId: string) => {
    try {
      const response = await fetch(`/api/user/notifications/${notificationId}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Erreur lors de la suppression');

      // Mettre à jour localement
      const deletedNotification = notifications.find(n => n.id === notificationId);
      setNotifications(prev => 
        prev.filter(notification => notification.id !== notificationId)
      );
      
      if (deletedNotification && !deletedNotification.isRead) {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
      
      toast.success('Notification supprimée');
    } catch (error) {
      console.error('Erreur:', error);
      toast.error('Erreur lors de la suppression de la notification');
    }
  }, [notifications]);

  // Rafraîchir les notifications au chargement et périodiquement
  useEffect(() => {
    fetchNotifications();
    
    // Rafraîchir toutes les 30 secondes si l'utilisateur est connecté
    const interval = session?.user ? setInterval(fetchNotifications, 30000) : null;
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [fetchNotifications, session?.user]);

  return {
    notifications,
    unreadCount,
    isLoading,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    refetch: fetchNotifications
  };
} 