import prisma from '../lib/prisma';

export async function createNotification({
  userId,
  title,
  message,
  type = 'SYSTEM'
}: {
  userId: string;
  title: string;
  message: string;
  type?: string;
}) {
  try {
    const notification = await prisma.notification.create({
      data: {
        userId,
        title,
        message,
        type
      }
    });

    console.log('Notification créée:', notification);
    return notification;
  } catch (error) {
    console.error('Erreur création notification:', error);
    throw error;
  }
}

export async function createOrderStatusNotification({
  userId,
  orderId,
  status,
  orderNumber
}: {
  userId: string;
  orderId: string;
  status: string;
  orderNumber: string;
}) {
  try {
    let title = '';
    let message = '';

    switch (status) {
      case 'PROCESSING':
        title = 'Commande en cours de traitement';
        message = `Votre commande #${orderNumber} est en cours de traitement.`;
        break;
      case 'SHIPPED':
        title = 'Commande expédiée';
        message = `Votre commande #${orderNumber} a été expédiée.`;
        break;
      case 'DELIVERED':
        title = 'Commande livrée';
        message = `Votre commande #${orderNumber} a été livrée.`;
        break;
      case 'CANCELLED':
        title = 'Commande annulée';
        message = `Votre commande #${orderNumber} a été annulée.`;
        break;
      default:
        title = 'Mise à jour de la commande';
        message = `Le statut de votre commande #${orderNumber} a été mis à jour.`;
    }

    const notification = await prisma.notification.create({
      data: {
        userId,
        title,
        message,
        type: 'ORDER',
        orderId
      }
    });

    return notification;
  } catch (error) {
    console.error('Erreur création notification:', error);
    throw error;
  }
} 