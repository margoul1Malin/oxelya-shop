'use client';

import { useState, useEffect } from 'react';
import OrdersTable from '../../../components/admin/OrdersTable';
import { Order } from '../../../types';
import { toast } from 'react-hot-toast';
import LoadingSpinner from '../../../components/ui/loading';

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = async () => {
    try {
      const response = await fetch('/api/admin/orders');
      if (!response.ok) throw new Error('Erreur lors du chargement des commandes');
      const data = await response.json();
      setOrders(data);
    } catch (error) {
      console.error('Erreur:', error);
      toast.error('Erreur lors du chargement des commandes');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Gestion des commandes</h1>
      <OrdersTable 
        orders={orders} 
        onOrderUpdate={fetchOrders}
      />
    </div>
  );
} 