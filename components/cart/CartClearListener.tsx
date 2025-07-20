'use client';

import { useEffect } from 'react';
import { useCart } from '../../hooks/useCart';
import { useAuth } from '../../hooks/useAuth';

export function CartClearListener() {
  const { clearCart } = useCart();
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;

    // Fonction pour vérifier les notifications de vidage de panier
    const checkCartClearNotifications = async () => {
      try {
        const response = await fetch('/api/user/notifications');
        if (response.ok) {
          const data = await response.json();
          const cartClearNotifications = data.notifications.filter(
            (notification: any) => notification.type === 'CART_CLEAR' && !notification.isRead
          );

          if (cartClearNotifications.length > 0) {
            console.log('Notification de vidage de panier détectée, vidage du panier...');
            clearCart();
            
            // Marquer les notifications comme lues
            await Promise.all(
              cartClearNotifications.map((notification: any) =>
                fetch(`/api/user/notifications/${notification.id}`, {
                  method: 'PUT',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ isRead: true })
                })
              )
            );
          }
        }
      } catch (error) {
        console.error('Erreur lors de la vérification des notifications de vidage de panier:', error);
      }
    };

    // Vérifier immédiatement
    checkCartClearNotifications();

    // Vérifier toutes les 5 secondes
    const interval = setInterval(checkCartClearNotifications, 5000);

    return () => clearInterval(interval);
  }, [user, clearCart]);

  return null; // Ce composant ne rend rien
} 