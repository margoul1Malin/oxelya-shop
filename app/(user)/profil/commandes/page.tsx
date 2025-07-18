'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSession } from 'next-auth/react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Package, Truck, CheckCircle, XCircle, Clock, Euro, Calendar, Filter, Search, ChevronDown, Eye } from 'lucide-react';
import LoadingSpinner from '../../../../components/ui/LoadingSpinner';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

const ORDER_STATUSES = {
  PENDING: { label: 'En attente', color: 'text-yellow-400', bgColor: 'bg-yellow-400/10', borderColor: 'border-yellow-400/20', icon: Clock },
  PAID: { label: 'Payée', color: 'text-green-400', bgColor: 'bg-green-400/10', borderColor: 'border-green-400/20', icon: CheckCircle },
  PROCESSING: { label: 'En traitement', color: 'text-blue-400', bgColor: 'bg-blue-400/10', borderColor: 'border-blue-400/20', icon: Package },
  SHIPPED: { label: 'Expédiée', color: 'text-purple-400', bgColor: 'bg-purple-400/10', borderColor: 'border-purple-400/20', icon: Truck },
  DELIVERED: { label: 'Livrée', color: 'text-green-400', bgColor: 'bg-green-400/10', borderColor: 'border-green-400/20', icon: CheckCircle },
  CANCELLED: { label: 'Annulée', color: 'text-red-400', bgColor: 'bg-red-400/10', borderColor: 'border-red-400/20', icon: XCircle }
} as const;

type OrderStatus = keyof typeof ORDER_STATUSES;

export default function OrdersPage() {
  const { data: session, status } = useSession();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
      return;
    }

    if (status === 'authenticated') {
      fetchOrders();
    }
  }, [status, router]);

  const fetchOrders = async () => {
    try {
      const res = await fetch('/api/user/orders', {
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!res.ok) throw new Error('Erreur chargement commandes');
      const data = await res.json();
      setOrders(data);
    } catch (error) {
      console.error('Erreur:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredOrders = orders.filter(order => {
    const matchesFilter = filter === 'ALL' || order.status === filter;
    const matchesSearch = searchTerm === '' || 
      order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.items.some((item: any) => 
        item.product?.name?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    return matchesFilter && matchesSearch;
  });

  const orderStats = {
    total: orders.length,
    paid: orders.filter(o => o.status === 'PAID').length,
    processing: orders.filter(o => o.status === 'PROCESSING').length,
    shipped: orders.filter(o => o.status === 'SHIPPED').length,
    delivered: orders.filter(o => o.status === 'DELIVERED').length,
  };

  if (loading || status === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col lg:flex-row lg:items-center justify-between gap-4"
      >
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-white mb-2">Mes commandes</h1>
          <p className="text-gray-400">
            {orders.length > 0 ? `${orders.length} commande${orders.length > 1 ? 's' : ''} au total` : 'Aucune commande'}
          </p>
        </div>

        {/* Quick Stats */}
        {orders.length > 0 && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
            <div className="bg-gray-800/50 rounded-lg p-3 text-center border border-gray-700/50">
              <p className="text-lg font-bold text-green-400">{orderStats.delivered}</p>
              <p className="text-xs text-gray-400">Livrées</p>
            </div>
            <div className="bg-gray-800/50 rounded-lg p-3 text-center border border-gray-700/50">
              <p className="text-lg font-bold text-purple-400">{orderStats.shipped}</p>
              <p className="text-xs text-gray-400">Expédiées</p>
            </div>
            <div className="bg-gray-800/50 rounded-lg p-3 text-center border border-gray-700/50">
              <p className="text-lg font-bold text-blue-400">{orderStats.processing}</p>
              <p className="text-xs text-gray-400">En cours</p>
            </div>
            <div className="bg-gray-800/50 rounded-lg p-3 text-center border border-gray-700/50">
              <p className="text-lg font-bold text-yellow-400">{orderStats.paid}</p>
              <p className="text-xs text-gray-400">Payées</p>
            </div>
          </div>
        )}
      </motion.div>

      {/* Filters */}
      {orders.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gray-800/50 rounded-xl p-4 border border-gray-700/50"
        >
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Rechercher par ID ou produit..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-gray-700/50 border border-gray-600/50 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500/50 focus:border-transparent"
              />
            </div>

            {/* Status Filter */}
            <div className="relative">
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="appearance-none bg-gray-700/50 border border-gray-600/50 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-blue-500/50 focus:border-transparent min-w-[150px]"
              >
                <option value="ALL">Tous les statuts</option>
                <option value="PAID">Payées</option>
                <option value="PROCESSING">En traitement</option>
                <option value="SHIPPED">Expédiées</option>
                <option value="DELIVERED">Livrées</option>
                <option value="CANCELLED">Annulées</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
            </div>
          </div>
        </motion.div>
      )}

      {/* Orders List */}
      <AnimatePresence>
        <div className="space-y-4">
          {filteredOrders.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-16"
            >
              <Package className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-300 mb-2">
                {orders.length === 0 ? 'Aucune commande' : 'Aucun résultat'}
              </h3>
              <p className="text-gray-500">
                {orders.length === 0 
                  ? 'Vous n\'avez pas encore passé de commande' 
                  : 'Essayez de modifier vos filtres de recherche'
                }
              </p>
            </motion.div>
          ) : (
            filteredOrders.map((order, index) => {
              const status = ORDER_STATUSES[order.status as OrderStatus];
              const StatusIcon = status.icon;
              
              return (
                <motion.div
                  key={order.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700/50 overflow-hidden hover:border-gray-600/50 transition-all duration-200"
                >
                  {/* Order Header */}
                  <div className="p-4 lg:p-6 border-b border-gray-700/50">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <p className="text-sm font-mono text-gray-300">
                            #{order.id.slice(-8)}
                          </p>
                          <div className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium border ${status.bgColor} ${status.borderColor} ${status.color}`}>
                            <StatusIcon className="w-3 h-3" />
                            {status.label}
                          </div>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-gray-400">
                          <div className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {format(new Date(order.createdAt), 'dd MMM yyyy à HH:mm', { locale: fr })}
                          </div>
                          <div className="flex items-center gap-1">
                            <Package className="w-3 h-3" />
                            {order.items.length} article{order.items.length > 1 ? 's' : ''}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <p className="text-lg font-bold text-white flex items-center">
                            <Euro className="w-4 h-4 mr-1" />
                            {order.total.toFixed(2)}
                          </p>
                        </div>
                        <Link
                          href={`/profil/commandes/${order.id}`}
                          className="p-2 bg-blue-600/20 text-blue-400 rounded-lg hover:bg-blue-600/30 transition-colors"
                        >
                          <Eye className="w-4 h-4" />
                        </Link>
                      </div>
                    </div>
                  </div>

                  {/* Order Items */}
                  <div className="p-4 lg:p-6">
                    <div className="grid gap-3">
                      {order.items.slice(0, 3).map((item: any) => (
                        <div
                          key={item.id}
                          className="flex items-center gap-3 p-3 bg-gray-700/30 rounded-lg"
                        >
                          <div className="w-12 h-12 lg:w-16 lg:h-16 relative rounded-lg overflow-hidden bg-gray-600 flex-shrink-0">
                            {item.product?.image ? (
                              <img
                                src={item.product.image}
                                alt={item.product.name}
                                className="object-cover w-full h-full"
                              />
                            ) : (
                              <Package className="w-6 h-6 text-gray-400 absolute inset-0 m-auto" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-white text-sm lg:text-base truncate">
                              {item.product?.name || 'Produit indisponible'}
                            </p>
                            <p className="text-xs lg:text-sm text-gray-400">
                              Quantité: {item.quantity} × {item.price.toFixed(2)} €
                            </p>
                          </div>
                          <p className="font-medium text-white text-sm lg:text-base">
                            {(item.price * item.quantity).toFixed(2)} €
                          </p>
                        </div>
                      ))}
                      
                      {order.items.length > 3 && (
                        <div className="text-center py-2">
                          <p className="text-sm text-gray-400">
                            ... et {order.items.length - 3} autre{order.items.length - 3 > 1 ? 's' : ''} article{order.items.length - 3 > 1 ? 's' : ''}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })
          )}
        </div>
      </AnimatePresence>
    </div>
  );
} 