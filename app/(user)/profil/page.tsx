'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { 
  User, 
  Mail, 
  Shield, 
  Crown, 
  Settings, 
  Package, 
  Euro, 
  Bell, 
  Calendar,
  Eye,
  CheckCircle,
  Clock,
  Truck,
  XCircle
} from 'lucide-react';
import LoadingSpinner from '../../../components/ui/LoadingSpinner';
import ProtectedRoute from '../../../components/auth/ProtectedRoute';

type OrderStatus = 'PENDING' | 'PAID' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';

const ORDER_STATUSES = {
  PENDING: { label: 'En attente', color: 'text-yellow-400', bgColor: 'bg-yellow-400/10', icon: Clock },
  PAID: { label: 'Payée', color: 'text-green-400', bgColor: 'bg-green-400/10', icon: CheckCircle },
  PROCESSING: { label: 'En traitement', color: 'text-blue-400', bgColor: 'bg-blue-400/10', icon: Package },
  SHIPPED: { label: 'Expédiée', color: 'text-purple-400', bgColor: 'bg-purple-400/10', icon: Truck },
  DELIVERED: { label: 'Livrée', color: 'text-green-400', bgColor: 'bg-green-400/10', icon: CheckCircle },
  CANCELLED: { label: 'Annulée', color: 'text-red-400', bgColor: 'bg-red-400/10', icon: XCircle }
};

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === 'authenticated') {
      fetchUserData();
    }
  }, [status]);

  const fetchUserData = async () => {
    try {
      const res = await fetch('/api/user/profile');
      if (!res.ok) throw new Error('Erreur chargement profil');
      const data = await res.json();
      setUserData(data);
    } catch (error) {
      console.error('Erreur:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading || status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (!userData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-400 text-xl mb-2">Erreur de chargement</div>
          <div className="text-gray-400">Impossible de charger les données du profil</div>
        </div>
      </div>
    );
  }

  const stats = [
    {
      title: 'Commandes totales',
      value: userData.orders?.length || 0,
      icon: Package,
      color: 'from-blue-500 to-cyan-500',
      description: 'Toutes vos commandes'
    },
    {
      title: 'Total dépensé',
      value: `${userData.orders?.reduce((sum: number, order: any) => sum + order.total, 0)?.toFixed(2) || '0.00'} €`,
      icon: Euro,
      color: 'from-green-500 to-emerald-500',
      description: 'Montant total'
    },
    {
      title: 'Notifications',
      value: userData.notifications?.filter((n: any) => !n.isRead)?.length || 0,
      icon: Bell,
      color: 'from-purple-500 to-pink-500',
      description: 'Non lues'
    },
    {
      title: 'Membre depuis',
      value: userData.createdAt ? format(new Date(userData.createdAt), 'MMM yyyy', { locale: fr }) : 'N/A',
      icon: Calendar,
      color: 'from-orange-500 to-red-500',
      description: 'Date d\'inscription'
    }
  ];

  return (
    <ProtectedRoute>
      <div className="space-y-8">
        {/* En-tête du profil */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 rounded-2xl border border-gray-700"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 via-purple-600/10 to-blue-600/10"></div>
          <div className="relative p-8">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-6">
                <div className="relative">
                  <div className="w-20 h-20 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center">
                    <User className="w-10 h-10 text-white" />
                  </div>
                  {userData.role === 'ADMIN' && (
                    <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-gradient-to-r from-yellow-400 to-orange-500 flex items-center justify-center">
                      <Crown className="w-4 h-4 text-white" />
                    </div>
                  )}
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-white mb-2">
                    Bonjour, {userData.name || 'Utilisateur'} !
                  </h1>
                  <div className="flex items-center gap-4 text-gray-300">
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4" />
                      <span>{userData.email}</span>
                    </div>
                    {userData.role && (
                      <div className="flex items-center gap-2">
                        <Shield className="w-4 h-4" />
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          userData.role === 'ADMIN' 
                            ? 'bg-yellow-400/20 text-yellow-300' 
                            : 'bg-blue-400/20 text-blue-300'
                        }`}>
                          {userData.role === 'ADMIN' ? 'Administrateur' : 'Utilisateur'}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <Link
                href="/profil/parametres"
                className="flex items-center gap-2 px-4 py-2 bg-gray-700/50 hover:bg-gray-600/50 rounded-lg text-gray-300 hover:text-white transition-all"
              >
                <Settings className="w-4 h-4" />
                <span>Paramètres</span>
              </Link>
            </div>
          </div>
        </motion.div>

        {/* Statistiques */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="relative overflow-hidden bg-gray-900/50 backdrop-blur-sm rounded-xl border border-gray-700 p-6 hover:border-gray-600 transition-all"
            >
              <div className={`absolute inset-0 bg-gradient-to-r ${stat.color} opacity-5`}></div>
              <div className="relative">
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-3 rounded-lg bg-gradient-to-r ${stat.color} bg-opacity-20`}>
                    <stat.icon className="w-6 h-6 text-white" />
                  </div>
                </div>
                <div className="space-y-2">
                  <p className="text-2xl font-bold text-white">{stat.value}</p>
                  <p className="text-sm font-medium text-gray-300">{stat.title}</p>
                  <p className="text-xs text-gray-500">{stat.description}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Commandes récentes */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-gray-900/50 backdrop-blur-sm rounded-xl border border-gray-700 p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white flex items-center gap-3">
                <Package className="w-6 h-6 text-blue-400" />
                Commandes récentes
              </h2>
              <Link
                href="/profil/commandes"
                className="flex items-center gap-2 px-3 py-1 text-sm text-blue-400 hover:text-blue-300 bg-blue-400/10 hover:bg-blue-400/20 rounded-lg transition-all"
              >
                <Eye className="w-4 h-4" />
                Voir tout
              </Link>
            </div>
            
            <div className="space-y-4">
              {userData.orders?.slice(0, 3).map((order: any, index: number) => {
                const statusInfo = ORDER_STATUSES[order.status as OrderStatus];
                return (
                  <motion.div
                    key={order.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 + index * 0.1 }}
                    className="p-4 bg-gray-800/30 rounded-lg border border-gray-700/50 hover:border-gray-600/50 transition-all"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <p className="text-sm font-mono text-gray-400">
                        #{order.id.slice(-8)}
                      </p>
                      <div className={`flex items-center gap-2 px-2 py-1 rounded-full text-xs ${statusInfo.color} ${statusInfo.bgColor}`}>
                        <statusInfo.icon className="w-3 h-3" />
                        {statusInfo.label}
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="text-white font-semibold">
                        {order.total.toFixed(2)} €
                      </div>
                      <div className="text-xs text-gray-500">
                        {order.createdAt && format(new Date(order.createdAt), 'dd MMM yyyy', { locale: fr })}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
              
              {(!userData.orders || userData.orders.length === 0) && (
                <div className="text-center py-8 text-gray-400">
                  <Package className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>Aucune commande pour le moment</p>
                  <Link
                    href="/produits"
                    className="inline-flex items-center gap-2 mt-3 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all"
                  >
                    <Package className="w-4 h-4" />
                    Découvrir nos produits
                  </Link>
                </div>
              )}
            </div>
          </motion.div>

          {/* Notifications récentes */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-gray-900/50 backdrop-blur-sm rounded-xl border border-gray-700 p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white flex items-center gap-3">
                <Bell className="w-6 h-6 text-purple-400" />
                Notifications récentes
              </h2>
              <Link
                href="/profil/notifications"
                className="flex items-center gap-2 px-3 py-1 text-sm text-purple-400 hover:text-purple-300 bg-purple-400/10 hover:bg-purple-400/20 rounded-lg transition-all"
              >
                <Eye className="w-4 h-4" />
                Voir tout
              </Link>
            </div>
            
            <div className="space-y-4">
              {userData.notifications?.slice(0, 5).map((notif: any, index: number) => (
                <motion.div
                  key={notif.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 + index * 0.1 }}
                  className={`p-4 rounded-lg border transition-all ${
                    !notif.isRead 
                      ? 'bg-blue-500/5 border-blue-500/20 border-l-4 border-l-blue-500' 
                      : 'bg-gray-800/30 border-gray-700/50'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className={`font-medium mb-1 ${!notif.isRead ? 'text-white' : 'text-gray-300'}`}>
                        {notif.title}
                      </p>
                      <p className="text-sm text-gray-400 line-clamp-2">
                        {notif.message}
                      </p>
                      <p className="text-xs text-gray-500 mt-2">
                        {notif.createdAt && format(new Date(notif.createdAt), 'dd MMM à HH:mm', { locale: fr })}
                      </p>
                    </div>
                    {!notif.isRead && (
                      <div className="w-2 h-2 rounded-full bg-blue-500 mt-2 ml-3"></div>
                    )}
                  </div>
                </motion.div>
              ))}
              
              {(!userData.notifications || userData.notifications.length === 0) && (
                <div className="text-center py-8 text-gray-400">
                  <Bell className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>Aucune notification</p>
                  <p className="text-sm text-gray-500 mt-1">Vous êtes à jour !</p>
                </div>
              )}
            </div>
          </motion.div>
        </div>

        {/* Actions rapides */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="bg-gradient-to-r from-gray-900/50 to-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700 p-6"
        >
          <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
            <Package className="w-6 h-6 text-green-400" />
            Actions rapides
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link
              href="/profil/commandes"
              className="group flex items-center gap-4 p-4 bg-gray-800/30 hover:bg-gray-700/30 rounded-lg border border-gray-700/50 hover:border-gray-600/50 transition-all"
            >
              <div className="p-3 rounded-lg bg-blue-500/20 group-hover:bg-blue-500/30 transition-all">
                <Package className="w-6 h-6 text-blue-400" />
              </div>
              <div>
                <p className="font-medium text-white group-hover:text-blue-300 transition-all">Mes commandes</p>
                <p className="text-sm text-gray-400">Suivre vos achats</p>
              </div>
            </Link>
            
            <Link
              href="/profil/parametres"
              className="group flex items-center gap-4 p-4 bg-gray-800/30 hover:bg-gray-700/30 rounded-lg border border-gray-700/50 hover:border-gray-600/50 transition-all"
            >
              <div className="p-3 rounded-lg bg-purple-500/20 group-hover:bg-purple-500/30 transition-all">
                <Settings className="w-6 h-6 text-purple-400" />
              </div>
              <div>
                <p className="font-medium text-white group-hover:text-purple-300 transition-all">Paramètres</p>
                <p className="text-sm text-gray-400">Gérer votre compte</p>
              </div>
            </Link>
            
            <Link
              href="/produits"
              className="group flex items-center gap-4 p-4 bg-gray-800/30 hover:bg-gray-700/30 rounded-lg border border-gray-700/50 hover:border-gray-600/50 transition-all"
            >
              <div className="p-3 rounded-lg bg-green-500/20 group-hover:bg-green-500/30 transition-all">
                <Package className="w-6 h-6 text-green-400" />
              </div>
              <div>
                <p className="font-medium text-white group-hover:text-green-300 transition-all">Continuer shopping</p>
                <p className="text-sm text-gray-400">Découvrir nos produits</p>
              </div>
            </Link>
          </div>
        </motion.div>
      </div>
    </ProtectedRoute>
  );
} 