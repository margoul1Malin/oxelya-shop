'use client';

import { motion } from 'framer-motion';
import { 
  Users, 
  DollarSign, 
  Package,
  ShoppingCart
} from 'lucide-react';

interface DashboardStats {
  totalUsers: number;
  totalProducts: number;
  totalOrders: number;
  totalRevenue: number;
  recentOrders: any[];
  topProducts: any[];
}

interface DashboardProps {
  stats: DashboardStats;
}

export default function Dashboard({ stats }: DashboardProps) {
  const statCards = [
    {
      title: 'Utilisateurs',
      value: stats.totalUsers,
      icon: Users,
      color: 'blue'
    },
    {
      title: 'Produits',
      value: stats.totalProducts,
      icon: Package,
      color: 'purple'
    },
    {
      title: 'Commandes',
      value: stats.totalOrders,
      icon: ShoppingCart,
      color: 'green'
    },
    {
      title: 'Revenus',
      value: `${stats.totalRevenue.toFixed(2)} €`,
      icon: DollarSign,
      color: 'yellow'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-gray-800 rounded-lg p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400">{stat.title}</p>
                <h3 className="text-2xl font-bold text-white mt-1">
                  {stat.value}
                </h3>
              </div>
              <div className={`p-3 bg-${stat.color}-500/20 rounded-lg`}>
                <stat.icon className={`w-6 h-6 text-${stat.color}-400`} />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Graphiques et autres widgets */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* ... Ajoutez vos graphiques ici ... */}
      </div>
    </div>
  );
} 