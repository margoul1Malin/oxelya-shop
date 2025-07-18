'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useSession } from 'next-auth/react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { 
  Package, 
  Truck, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Euro, 
  Calendar, 
  MapPin, 
  CreditCard, 
  ArrowLeft,
  FileText,
  User,
  Mail,
  Phone,
  Receipt
} from 'lucide-react';
import LoadingSpinner from '../../../../../components/ui/LoadingSpinner';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';

const ORDER_STATUSES = {
  PENDING: { label: 'En attente', color: 'text-yellow-400', bgColor: 'bg-yellow-400/10', borderColor: 'border-yellow-400/20', icon: Clock },
  PAID: { label: 'Payée', color: 'text-green-400', bgColor: 'bg-green-400/10', borderColor: 'border-green-400/20', icon: CheckCircle },
  PROCESSING: { label: 'En traitement', color: 'text-blue-400', bgColor: 'bg-blue-400/10', borderColor: 'border-blue-400/20', icon: Package },
  SHIPPED: { label: 'Expédiée', color: 'text-purple-400', bgColor: 'bg-purple-400/10', borderColor: 'border-purple-400/20', icon: Truck },
  DELIVERED: { label: 'Livrée', color: 'text-green-400', bgColor: 'bg-green-400/10', borderColor: 'border-green-400/20', icon: CheckCircle },
  CANCELLED: { label: 'Annulée', color: 'text-red-400', bgColor: 'bg-red-400/10', borderColor: 'border-red-400/20', icon: XCircle }
} as const;

type OrderStatus = keyof typeof ORDER_STATUSES;

interface OrderItem {
  id: string;
  productId: string;
  quantity: number;
  price: number;
  product?: {
    id: string;
    name: string;
    image: string;
    description: string;
  };
}

interface Order {
  id: string;
  userId: string;
  total: number;
  status: OrderStatus;
  paymentMethod: string;
  paymentStatus: string;
  paymentIntentId?: string;
  shippingAddress: string;
  createdAt: string;
  updatedAt: string;
  items: OrderItem[];
  user: {
    id: string;
    email: string;
    name?: string;
  };
}

interface OrderPageProps {
  params: {
    id: string;
  };
}

export default function OrderPage({ params }: OrderPageProps) {
  const { data: session, status: authStatus } = useSession();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const fetchOrder = useCallback(async () => {
    try {
      const response = await fetch(`/api/orders/${params.id}`);
      if (!response.ok) {
        if (response.status === 404) {
          setError('Commande non trouvée');
        } else if (response.status === 403) {
          setError('Accès non autorisé');
        } else {
          setError('Erreur lors du chargement de la commande');
        }
        return;
      }
      const data = await response.json();
      setOrder(data);
    } catch (error) {
      console.error('Erreur:', error);
      setError('Erreur lors du chargement de la commande');
    } finally {
      setLoading(false);
    }
  }, [params.id]);

  useEffect(() => {
    if (authStatus === 'unauthenticated') {
      router.push('/login');
      return;
    }

    if (authStatus === 'authenticated') {
      fetchOrder();
    }
  }, [authStatus, router, fetchOrder]);

  if (loading || authStatus === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-16">
        <Package className="w-16 h-16 text-gray-600 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-300 mb-2">Erreur</h3>
        <p className="text-gray-500 mb-4">{error}</p>
        <Link
          href="/profil/commandes"
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Retour aux commandes
        </Link>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="text-center py-16">
        <Package className="w-16 h-16 text-gray-600 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-300 mb-2">Commande non trouvée</h3>
        <p className="text-gray-500 mb-4">La commande demandée n'existe pas ou vous n'y avez pas accès.</p>
        <Link
          href="/profil/commandes"
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Retour aux commandes
        </Link>
      </div>
    );
  }

  const orderStatusInfo = ORDER_STATUSES[order.status];
  const StatusIcon = orderStatusInfo.icon;

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col lg:flex-row lg:items-center justify-between gap-4"
      >
        <div className="flex items-center gap-4">
          <Link
            href="/profil/commandes"
            className="p-2 bg-gray-800/50 text-gray-400 rounded-lg hover:bg-gray-700/50 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-white mb-2">
              Commande #{order.id.slice(-8)}
            </h1>
            <p className="text-gray-400">
              Passée le {format(new Date(order.createdAt), 'dd MMMM yyyy à HH:mm', { locale: fr })}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className={`flex items-center gap-2 px-4 py-2 rounded-lg border ${orderStatusInfo.bgColor} ${orderStatusInfo.borderColor} ${orderStatusInfo.color}`}>
            <StatusIcon className="w-5 h-5" />
            <span className="font-medium">{orderStatusInfo.label}</span>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Informations principales */}
        <div className="lg:col-span-2 space-y-6">
          {/* Statut et paiement */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-gray-800/50 rounded-xl p-6 border border-gray-700/50"
          >
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <Receipt className="w-5 h-5" />
              Informations de commande
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-gray-400">
                  <Calendar className="w-4 h-4" />
                  <span className="text-sm">Date de commande</span>
                </div>
                <p className="text-white font-medium">
                  {format(new Date(order.createdAt), 'dd MMMM yyyy à HH:mm', { locale: fr })}
                </p>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-2 text-gray-400">
                  <CreditCard className="w-4 h-4" />
                  <span className="text-sm">Méthode de paiement</span>
                </div>
                <p className="text-white font-medium capitalize">
                  {order.paymentMethod.toLowerCase()}
                </p>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-2 text-gray-400">
                  <Euro className="w-4 h-4" />
                  <span className="text-sm">Total</span>
                </div>
                <p className="text-2xl font-bold text-white">
                  {order.total.toFixed(2)} €
                </p>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-2 text-gray-400">
                  <Package className="w-4 h-4" />
                  <span className="text-sm">Articles</span>
                </div>
                <p className="text-white font-medium">
                  {order.items.length} article{order.items.length > 1 ? 's' : ''}
                </p>
              </div>
            </div>
          </motion.div>

          {/* Articles */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-gray-800/50 rounded-xl p-6 border border-gray-700/50"
          >
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <Package className="w-5 h-5" />
              Articles commandés
            </h2>
            
            <div className="space-y-4">
              {order.items.map((item, index) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + index * 0.1 }}
                  className="flex items-center gap-4 p-4 bg-gray-700/30 rounded-lg"
                >
                  <div className="w-16 h-16 lg:w-20 lg:h-20 relative rounded-lg overflow-hidden bg-gray-600 flex-shrink-0">
                    {item.product?.image ? (
                      <Image
                        src={item.product.image}
                        alt={item.product.name}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Package className="w-8 h-8 text-gray-400" />
                      </div>
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-white mb-1">
                      {item.product?.name || 'Produit non disponible'}
                    </h3>
                    <p className="text-sm text-gray-400 line-clamp-2">
                      {item.product?.description || 'Description non disponible'}
                    </p>
                  </div>
                  
                  <div className="text-right">
                    <p className="text-sm text-gray-400">Quantité</p>
                    <p className="font-medium text-white">{item.quantity}</p>
                  </div>
                  
                  <div className="text-right">
                    <p className="text-sm text-gray-400">Prix unitaire</p>
                    <p className="font-medium text-white">{item.price.toFixed(2)} €</p>
                  </div>
                  
                  <div className="text-right">
                    <p className="text-sm text-gray-400">Total</p>
                    <p className="font-bold text-white">{(item.price * item.quantity).toFixed(2)} €</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Informations secondaires */}
        <div className="space-y-6">
          {/* Adresse de livraison */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-gray-800/50 rounded-xl p-6 border border-gray-700/50"
          >
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <MapPin className="w-5 h-5" />
              Adresse de livraison
            </h3>
            <p className="text-gray-300 text-sm leading-relaxed">
              {(() => {
                try {
                  const address = JSON.parse(order.shippingAddress);
                  return (
                    <div>
                      <p className="font-medium">{address.name}</p>
                      <p>{address.street}</p>
                      <p>{address.zipCode} {address.city}</p>
                      <p>{address.country}</p>
                    </div>
                  );
                } catch {
                  return order.shippingAddress;
                }
              })()}
            </p>
          </motion.div>

          {/* Informations client */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-gray-800/50 rounded-xl p-6 border border-gray-700/50"
          >
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <User className="w-5 h-5" />
              Informations client
            </h3>
            
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-gray-400">
                <User className="w-4 h-4" />
                <span className="text-sm">Nom</span>
              </div>
              <p className="text-white font-medium">
                {order.user.name || 'Non renseigné'}
              </p>
              
              <div className="flex items-center gap-2 text-gray-400">
                <Mail className="w-4 h-4" />
                <span className="text-sm">Email</span>
              </div>
              <p className="text-white font-medium">
                {order.user.email}
              </p>
            </div>
          </motion.div>

          {/* Actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-gray-800/50 rounded-xl p-6 border border-gray-700/50"
          >
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Actions
            </h3>
            
            <div className="space-y-3">
              <button className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm">
                Télécharger la facture
              </button>
              <button className="w-full px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors text-sm">
                Contacter le support
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
