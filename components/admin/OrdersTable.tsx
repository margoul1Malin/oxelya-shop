'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import {
  Package,
  Truck,
  CheckCircle,
  XCircle,
  Clock,
  Download,
  AlertCircle,
  Trash,
  Eye,
  ChevronDown,
  AlertTriangle,
} from 'lucide-react';
import { PDFDocument } from 'pdf-lib';
import { saveAs } from 'file-saver';
import { toast } from 'react-hot-toast';
import Link from 'next/link';
import { formatOrdersForCSV } from '../../lib/exportHelpers';
import { Order } from '../../types';

interface Address {
  name: string;
  street: string;
  city: string;
  state?: string;
  zipCode: string;
  country: string;
  phone: string;
}

interface OrdersTableProps {
  orders: Order[];
  onOrderUpdate: () => Promise<void>;
}

const statusIcons = {
  PENDING: Clock,
  PAID: CheckCircle,
  PROCESSING: Package,
  SHIPPED: Truck,
  DELIVERED: CheckCircle,
  CANCELLED: XCircle,
};

const statusColors = {
  PENDING: 'text-yellow-500',
  PAID: 'text-green-500',
  PROCESSING: 'text-blue-500',
  SHIPPED: 'text-purple-500',
  DELIVERED: 'text-emerald-500',
  CANCELLED: 'text-red-500',
};

const paymentStatusColors = {
  PENDING: 'bg-yellow-500/20 text-yellow-500',
  COMPLETED: 'bg-green-500/20 text-green-500',
  FAILED: 'bg-red-500/20 text-red-500',
};

const paymentStatusIcons = {
  PENDING: Clock,
  COMPLETED: CheckCircle,
  FAILED: AlertCircle,
};

const statusOptions = [
  { value: 'PENDING', label: 'En attente' },
  { value: 'PROCESSING', label: 'En traitement' },
  { value: 'SHIPPED', label: 'Expédiée' },
  { value: 'DELIVERED', label: 'Livrée' },
  { value: 'CANCELLED', label: 'Annulée' },
];

const ORDER_STATUSES = {
  PENDING: { label: 'En attente', color: 'text-yellow-400', icon: Clock },
  PAID: { label: 'Payée', color: 'text-green-400', icon: CheckCircle },
  PROCESSING: { label: 'En traitement', color: 'text-blue-400', icon: Package },
  SHIPPED: { label: 'Expédiée', color: 'text-purple-400', icon: Truck },
  DELIVERED: { label: 'Livrée', color: 'text-emerald-400', icon: CheckCircle },
  CANCELLED: { label: 'Annulée', color: 'text-red-400', icon: XCircle }
} as const;

type OrderStatus = keyof typeof ORDER_STATUSES;

const STATUS_COLORS = {
  PENDING: 'bg-yellow-500/20 text-yellow-400',
  PAID: 'bg-green-500/20 text-green-400',
  PROCESSING: 'bg-blue-500/20 text-blue-400',
  SHIPPED: 'bg-purple-500/20 text-purple-400',
  DELIVERED: 'bg-emerald-500/20 text-emerald-400',
  CANCELLED: 'bg-red-500/20 text-red-400'
};

function formatAddress(addressString: string) {
  try {
    const address = JSON.parse(addressString);
    return (
      <div className="space-y-1">
        <p className="font-medium">{address.name}</p>
        <p>{address.street}</p>
        <p>{address.zipCode} {address.city}</p>
        <p>{address.country}</p>
      </div>
    );
  } catch {
    return (
      <div className="space-y-1">
        <p className="text-gray-300">{addressString || 'Adresse non disponible'}</p>
      </div>
    );
  }
}

export default function OrdersTable({ orders, onOrderUpdate }: OrdersTableProps) {
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [activeStatus, setActiveStatus] = useState<string>('PENDING');
  const [loading, setLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteStatus, setDeleteStatus] = useState('');

  const fetchOrders = async () => {
    try {
      const res = await fetch('/api/admin/orders');
      if (!res.ok) throw new Error('Erreur lors de la récupération des commandes');
      const data = await res.json();
      onOrderUpdate();
    } catch (error) {
      console.error('Erreur:', error);
      toast.error('Impossible de charger les commandes');
    } finally {
      setLoading(false);
    }
  };

  /* eslint-disable react-hooks/exhaustive-deps */
  useEffect(() => {
    fetchOrders();
  }, []);
  /* eslint-enable react-hooks/exhaustive-deps */

  if (!orders || !Array.isArray(orders)) {
    return (
      <div className="text-center py-8 text-gray-400">
        Aucune commande disponible
      </div>
    );
  }

  // Grouper les commandes par statut
  const ordersByStatus = {
    PENDING: orders.filter(order => order.status === 'PENDING'),
    PAID: orders.filter(order => order.status === 'PAID'),
    PROCESSING: orders.filter(order => order.status === 'PROCESSING'),
    SHIPPED: orders.filter(order => order.status === 'SHIPPED'),
    DELIVERED: orders.filter(order => order.status === 'DELIVERED'),
    CANCELLED: orders.filter(order => order.status === 'CANCELLED'),
  };

  const statusLabels = {
    PENDING: 'En attente',
    PAID: 'Payée',
    PROCESSING: 'En cours',
    SHIPPED: 'Expédiée',
    DELIVERED: 'Livrée',
    CANCELLED: 'Annulée',
  };

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/admin/orders/${orderId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!res.ok) throw new Error('Erreur lors de la mise à jour');
      
      await onOrderUpdate();
      toast.success('Statut mis à jour avec succès');
    } catch (error) {
      console.error('Erreur:', error);
      toast.error('Erreur lors de la mise à jour du statut');
    }
  };

  const handleDelete = async (orderId: string) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer cette commande ?')) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/orders/${orderId}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la suppression');
      }

      onOrderUpdate();
      toast.success('Commande supprimée avec succès');
    } catch (error) {
      console.error('Erreur:', error);
      toast.error('Erreur lors de la suppression');
    }
  };

  const handleExportCSV = async () => {
    try {
      const response = await fetch('/api/admin/orders/export');
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Erreur lors de l\'export');
      }
      
      const orders = await response.json();
      const csvContent = formatOrdersForCSV(orders);
      
      // Créer le blob avec BOM pour Excel
      const BOM = '\uFEFF';
      const blob = new Blob([BOM + csvContent], { 
        type: 'text/csv;charset=utf-8' 
      });
      
      // Utiliser saveAs de file-saver avec un nom plus descriptif
      const now = new Date();
      const dateStr = now.toISOString().split('T')[0];
      const timeStr = now.toTimeString().split(' ')[0].replace(/:/g, '-');
      const fileName = `commandes_export_${dateStr}_${timeStr}.csv`;
      saveAs(blob, fileName);
    } catch (error) {
      console.error('Erreur:', error);
      toast.error('Erreur lors de l\'export');
    }
  };

  const handleDeleteByStatus = async () => {
    if (!deleteStatus) {
      toast.error('Veuillez sélectionner un statut');
      return;
    }

    try {
      const response = await fetch('/api/admin/orders/delete-bulk', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: deleteStatus }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erreur lors de la suppression');
      }

      toast.success(data.message);
      setShowDeleteModal(false);
      setDeleteStatus('');
      fetchOrders(); // Recharger la liste
    } catch (error) {
      console.error('Erreur suppression commandes:', error);
      toast.error(error instanceof Error ? error.message : 'Erreur lors de la suppression');
    }
  };

  const exportToPDF = async (order: Order) => {
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([595.28, 841.89]); // A4
    const { width, height } = page.getSize();

    // En-tête
    page.drawText('Détails de la commande', {
      x: 50,
      y: height - 50,
      size: 20,
    });

    page.drawText(`Commande #${order.id.slice(-6)}`, {
      x: 50,
      y: height - 80,
      size: 14,
    });

    // Informations client
    page.drawText('Client:', { x: 50, y: height - 120, size: 12 });
    page.drawText(`${order.user?.name || 'Client inconnu'}`, { x: 50, y: height - 140, size: 10 });
    page.drawText(`${order.user?.email || 'Email inconnu'}`, { x: 50, y: height - 155, size: 10 });

    // Adresse
    page.drawText('Adresse de livraison:', { x: 50, y: height - 185, size: 12 });
    try {
      const address = JSON.parse(order.shippingAddress);
      page.drawText(`${address.name}`, { x: 50, y: height - 205, size: 10 });
      page.drawText(`${address.street}`, { x: 50, y: height - 220, size: 10 });
      page.drawText(`${address.zipCode} ${address.city}`, { x: 50, y: height - 235, size: 10 });
      page.drawText(`${address.country}`, { x: 50, y: height - 250, size: 10 });
    } catch {
      page.drawText(order.shippingAddress, { x: 50, y: height - 205, size: 10 });
    }

    // Articles
    page.drawText('Articles:', { x: 50, y: height - 265, size: 12 });
    let yOffset = 285;
    order.items.forEach((item) => {
      page.drawText(`${item.product?.name || 'Produit supprimé'} x${item.quantity}`, {
        x: 50,
        y: height - yOffset,
        size: 10,
      });
      page.drawText(`${item.price.toFixed(2)} €`, {
        x: 350,
        y: height - yOffset,
        size: 10,
      });
      yOffset += 20;
    });

    // Total
    page.drawText(`Total: ${order.total.toFixed(2)} €`, {
      x: width - 150,
      y: height - yOffset - 20,
      size: 14,
    });

    const pdfBytes = await pdfDoc.save();
    const blob = new Blob([pdfBytes], { type: 'application/pdf' });
    saveAs(blob, `commande_${order.id.slice(-6)}.pdf`);
  };

  const getOrderTimeline = (order: Order) => {
    const timeline = [
      { date: order.createdAt, label: 'Commande créée' },
      order.status === 'PROCESSING' && { 
        date: new Date().toISOString(), 
        label: 'En cours de traitement' 
      },
      order.status === 'SHIPPED' && { 
        date: new Date().toISOString(), 
        label: 'Expédiée' 
      },
      order.status === 'DELIVERED' && { 
        date: new Date().toISOString(), 
        label: 'Livrée' 
      },
    ].filter(Boolean);
    return timeline;
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-white">Commandes</h2>
        <div className="flex gap-3">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 rounded-lg text-white"
          >
            <Download className="w-4 h-4" />
            Exporter CSV
          </button>
          <button
            onClick={() => setShowDeleteModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-red-500 hover:bg-red-600 rounded-lg text-white"
          >
            <Trash className="w-4 h-4" />
            Supprimer par statut
          </button>
        </div>
      </div>

      {/* Onglets de statut */}
      <div className="flex space-x-2 border-b border-gray-700">
        {Object.entries(statusLabels).map(([status, label]) => (
          <button
            key={status}
            onClick={() => setActiveStatus(status)}
            className={`px-4 py-2 -mb-px font-medium transition-colors ${
              activeStatus === status
                ? 'text-blue-400 border-b-2 border-blue-400'
                : 'text-gray-400 hover:text-gray-300'
            }`}
          >
            <div className="flex items-center gap-2">
              {React.createElement(statusIcons[status as keyof typeof statusIcons], { 
                className: 'w-4 h-4' 
              })}
              {label}
              <span className="ml-2 px-2 py-0.5 text-xs rounded-full bg-gray-700">
                {ordersByStatus[status as keyof typeof ordersByStatus].length}
              </span>
            </div>
          </button>
        ))}
      </div>

      {/* Table des commandes filtrées */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-gray-300">
          <thead className="text-gray-400 bg-gray-800/50">
            <tr>
              <th className="p-4">ID</th>
              <th className="p-4">Client</th>
              <th className="p-4">Date</th>
              <th className="p-4">Total</th>
              <th className="p-4">Statut</th>
              <th className="p-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {ordersByStatus[activeStatus as keyof typeof ordersByStatus].map((order) => (
              <motion.tr
                key={order.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="border-b border-gray-700 hover:bg-gray-800/50"
              >
                <td className="p-4 font-mono text-xs break-all max-w-[120px]">{order.id}</td>
                <td className="p-4">
                  <div>
                    <div className="font-medium">{order.user?.name || 'Client inconnu'}</div>
                    <div className="text-sm text-gray-400">{order.user?.email || 'Email inconnu'}</div>
                  </div>
                </td>
                <td className="p-4">
                  {format(new Date(order.createdAt), 'Pp', { locale: fr })}
                </td>
                <td className="p-4">{order.total.toFixed(2)} €</td>
                <td className="p-4">
                  <div className="relative w-48">
                    <select
                      value={order.status}
                      onChange={(e) => handleStatusChange(order.id, e.target.value)}
                      className={`w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg appearance-none cursor-pointer ${
                        ORDER_STATUSES[order.status as OrderStatus]?.color || 'text-gray-400'
                      }`}
                    >
                      {Object.entries(ORDER_STATUSES).map(([value, { label }]) => (
                        <option 
                          key={value} 
                          value={value}
                          className="bg-gray-800 text-white"
                        >
                          {label}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 pointer-events-none text-current" />
                  </div>
                </td>
                <td className="p-4">
                  <div className="flex items-center gap-2">
                    <Link
                      href={`/admin/orders/${order.id}`}
                      className="p-2 bg-blue-500/10 text-blue-500 rounded-lg hover:bg-blue-500/20 transition-colors"
                    >
                      <Eye className="w-4 h-4" />
                    </Link>
                    <button
                      onClick={() => handleDelete(order.id)}
                      className="p-2 hover:bg-red-500/20 rounded-lg text-gray-400 hover:text-red-400"
                    >
                      <Trash className="w-5 h-5" />
                    </button>
                  </div>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal de détails */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-gray-800 rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto text-gray-100"
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-bold text-white">
                Commande #{selectedOrder.id}
              </h2>
              <div className="flex gap-2">
                <button
                  onClick={() => exportToPDF(selectedOrder)}
                  className="px-3 py-1 bg-blue-500 hover:bg-blue-600 rounded text-sm"
                >
                  PDF
                </button>
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="text-gray-400 hover:text-white text-2xl"
                >
                  ×
                </button>
              </div>
            </div>

            <div className="space-y-6">
              {/* Informations client */}
              <div>
                <h3 className="font-medium mb-2">Client</h3>
                <div className="bg-gray-700/50 p-4 rounded-lg">
                  <p>{selectedOrder.user?.name || 'Client inconnu'}</p>
                  <p className="text-gray-400">{selectedOrder.user?.email || 'Email inconnu'}</p>
                </div>
              </div>

              {/* Adresse de livraison */}
              <div>
                <h3 className="font-medium mb-2">Adresse de livraison</h3>
                <div className="bg-gray-700/50 p-4 rounded-lg">
                  {formatAddress(selectedOrder.shippingAddress)}
                </div>
              </div>

              {/* Articles */}
              <div>
                <h3 className="font-medium mb-2">Articles</h3>
                <div className="space-y-2">
                  {selectedOrder.items.map((item) => (
                    <div key={item.id} className="flex justify-between items-center py-2 border-b border-gray-700">
                      <div className="flex items-center gap-4">
                        {item.product?.image && (
                          <img
                            src={item.product.image}
                            alt={item.product.name}
                            className="w-12 h-12 object-cover rounded"
                          />
                        )}
                        <div>
                          <p className="font-medium">
                            {item.product?.name || 'Produit supprimé'} x{item.quantity}
                          </p>
                        </div>
                      </div>
                      <p>{(item.price * item.quantity).toFixed(2)} €</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Total et statuts */}
              <div className="flex justify-between items-center pt-4 border-t border-gray-700">
                <div>
                  <p className="text-lg font-medium">Total</p>
                  <p className="text-gray-400">
                    {selectedOrder.items.length} article(s)
                  </p>
                </div>
                <p className="text-2xl font-bold">
                  {selectedOrder.total.toFixed(2)} €
                </p>
              </div>

              {/* Ajout du suivi de commande */}
              <div className="mt-6 pt-6 border-t border-gray-700">
                <h3 className="font-medium mb-4">Suivi de commande</h3>
                <div className="relative">
                  <div className="absolute left-4 top-0 h-full w-0.5 bg-gray-700"></div>
                  {getOrderTimeline(selectedOrder).map((event, index) => (
                    event && (
                      <div key={index} className="ml-8 mb-4 relative">
                        <div className="absolute -left-10 top-1.5 w-4 h-4 rounded-full bg-blue-500"></div>
                        <p className="font-medium">{event.label}</p>
                        <p className="text-sm text-gray-400">
                          {format(new Date(event.date), 'Pp', { locale: fr })}
                        </p>
                      </div>
                    )
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Modal de suppression par statut */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-gray-800 rounded-lg p-6 max-w-md w-full"
          >
            <div className="flex items-center gap-3 mb-4">
              <AlertTriangle className="w-6 h-6 text-red-400" />
              <h3 className="text-lg font-bold text-white">Supprimer des commandes</h3>
            </div>
            
            <p className="text-gray-300 mb-4">
              Sélectionnez le statut des commandes à supprimer. Cette action est irréversible.
            </p>

            <div className="mb-4">
              <label className="block text-gray-300 mb-2">Statut des commandes</label>
              <select
                value={deleteStatus}
                onChange={(e) => setDeleteStatus(e.target.value)}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-red-500"
              >
                <option value="">Sélectionner un statut</option>
                <option value="PENDING">En attente</option>
                <option value="PAID">Payée</option>
                <option value="PROCESSING">En traitement</option>
                <option value="SHIPPED">Expédiée</option>
                <option value="DELIVERED">Livrée</option>
                <option value="CANCELLED">Annulée</option>
              </select>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setDeleteStatus('');
                }}
                className="flex-1 px-4 py-2 bg-gray-600 hover:bg-gray-700 rounded-lg text-white"
              >
                Annuler
              </button>
              <button
                onClick={handleDeleteByStatus}
                className="flex-1 px-4 py-2 bg-red-500 hover:bg-red-600 rounded-lg text-white"
              >
                Supprimer
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
} 