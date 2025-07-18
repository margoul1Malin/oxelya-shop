interface OrderItem {
  quantity: number;
  price: number;
  product?: {
    name: string;
  } | null;
}

interface Order {
  id: string;
  createdAt: string;
  user?: {
    name: string | null;
    email: string;
  } | null;
  total: number;
  status: string;
  paymentMethod: string;
  paymentStatus: string;
  shippingAddress: string;
  items: OrderItem[];
}

export const formatOrdersForCSV = (orders: Order[]) => {
  const headers = [
    'Numéro de commande',
    'Date de création',
    'Heure de création', 
    'Nom du client',
    'Email du client',
    'Montant total (€)',
    'Statut de la commande',
    'Statut du paiement',
    'Méthode de paiement',
    'Nombre d\'articles',
    'Détail des produits',
    'Quantités',
    'Prix unitaires (€)',
    'Adresse de livraison'
  ];

  const statusLabels = {
    PENDING: 'En attente',
    PAID: 'Payée',
    PROCESSING: 'En cours de traitement',
    SHIPPED: 'Expédiée',
    DELIVERED: 'Livrée',
    CANCELLED: 'Annulée'
  };

  const paymentStatusLabels = {
    PENDING: 'En attente',
    PROCESSING: 'En cours',
    COMPLETED: 'Terminé',
    FAILED: 'Échoué',
    REFUNDED: 'Remboursé'
  };

  const paymentMethodLabels = {
    STRIPE: 'Carte bancaire (Stripe)',
    PAYPAL: 'PayPal',
    CRYPTO: 'Cryptomonnaie'
  };

  const parseAddress = (addressString: string) => {
    try {
      const addr = JSON.parse(addressString);
      return `${addr.name}, ${addr.street}, ${addr.zipCode} ${addr.city}${addr.state ? ', ' + addr.state : ''}, ${addr.country}`;
    } catch {
      return 'Adresse non disponible';
    }
  };

  const rows = orders.map(order => {
    const orderDate = new Date(order.createdAt);
    return [
      order.id, // ID complet
      orderDate.toLocaleDateString('fr-FR'),
      orderDate.toLocaleTimeString('fr-FR'),
      order.user?.name || 'Client inconnu',
      order.user?.email || 'Email inconnu',
      order.total.toFixed(2),
      statusLabels[order.status as keyof typeof statusLabels] || order.status,
      paymentStatusLabels[order.paymentStatus as keyof typeof paymentStatusLabels] || order.paymentStatus,
      paymentMethodLabels[order.paymentMethod as keyof typeof paymentMethodLabels] || order.paymentMethod,
      order.items.length.toString(),
      order.items.map((item: OrderItem) => 
        item.product?.name || 'Produit supprimé'
      ).join(' | '),
      order.items.map((item: OrderItem) => 
        `${item.quantity}`
      ).join(' | '),
      order.items.map((item: OrderItem) => 
        `${item.price.toFixed(2)}`
      ).join(' | '),
      parseAddress(order.shippingAddress)
    ];
  });

  return [headers, ...rows]
    .map(row => row.map(cell => `"${cell.toString().replace(/"/g, '""')}"`).join(','))
    .join('\n');
}; 