'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Download, FileText, Calendar, Euro, Search, Filter } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useAuth } from '../../../../hooks/useAuth';

interface Invoice {
  id: string;
  invoiceNumber: string;
  totalTTC: number;
  createdAt: string;
  dueDate: string;
  paymentStatus: string;
  order: {
    id: string;
    status: string;
  };
}

export default function FacturesPage() {
  const { user } = useAuth();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    fetchInvoices();
  }, []);

  const fetchInvoices = async () => {
    try {
      const response = await fetch('/api/user/invoices');
      if (response.ok) {
        const data = await response.json();
        setInvoices(data.invoices || []);
      } else {
        toast.error('Erreur lors du chargement des factures');
      }
    } catch (error) {
      console.error('Erreur fetch factures:', error);
      toast.error('Erreur lors du chargement des factures');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (invoiceId: string, invoiceNumber: string) => {
    try {
      const response = await fetch(`/api/invoices/${invoiceId}/download`);
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `facture-${invoiceNumber}.html`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        toast.success('Facture téléchargée avec succès');
      } else {
        toast.error('Erreur lors du téléchargement');
      }
    } catch (error) {
      console.error('Erreur téléchargement:', error);
      toast.error('Erreur lors du téléchargement');
    }
  };

  const filteredInvoices = invoices.filter(invoice => {
    const matchesSearch = invoice.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         invoice.order.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || invoice.paymentStatus === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return 'text-green-500 bg-green-500/10';
      case 'PENDING':
        return 'text-yellow-500 bg-yellow-500/10';
      case 'FAILED':
        return 'text-red-500 bg-red-500/10';
      default:
        return 'text-gray-500 bg-gray-500/10';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return 'Payée';
      case 'PENDING':
        return 'En attente';
      case 'FAILED':
        return 'Échouée';
      default:
        return status;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white pt-20">
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gray-900 text-white pt-20">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold mb-2">Mes Factures</h1>
          <p className="text-gray-400">Consultez et téléchargez vos factures</p>
        </motion.div>

        {/* Filtres et recherche */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="bg-gray-800 rounded-lg p-6 mb-6"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Rechercher par numéro de facture..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">Tous les statuts</option>
                <option value="COMPLETED">Payées</option>
                <option value="PENDING">En attente</option>
                <option value="FAILED">Échouées</option>
              </select>
            </div>
          </div>
        </motion.div>

        {/* Liste des factures */}
        {filteredInvoices.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-center py-12"
          >
            <FileText className="w-16 h-16 text-gray-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-300 mb-2">
              {invoices.length === 0 ? 'Aucune facture trouvée' : 'Aucune facture correspond à votre recherche'}
            </h3>
            <p className="text-gray-400">
              {invoices.length === 0 
                ? 'Vos factures apparaîtront ici après vos achats.'
                : 'Essayez de modifier vos critères de recherche.'
              }
            </p>
          </motion.div>
        ) : (
          <div className="grid gap-4">
            {filteredInvoices.map((invoice, index) => (
              <motion.div
                key={invoice.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 + index * 0.05 }}
                className="bg-gray-800 rounded-lg p-6 hover:bg-gray-750 transition-colors"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <FileText className="w-5 h-5 text-blue-500" />
                      <h3 className="text-lg font-semibold">Facture {invoice.invoiceNumber}</h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(invoice.paymentStatus)}`}>
                        {getStatusText(invoice.paymentStatus)}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-400">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        <span>Créée le {formatDate(invoice.createdAt)}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        <span>Échéance le {formatDate(invoice.dueDate)}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Euro className="w-4 h-4" />
                        <span className="font-semibold text-white">{invoice.totalTTC.toFixed(2)} €</span>
                      </div>
                    </div>
                    
                    <div className="mt-2 text-xs text-gray-500">
                      Commande #{invoice.order.id.slice(-8).toUpperCase()} - {invoice.order.status}
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleDownload(invoice.id, invoice.invoiceNumber)}
                      className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                    >
                      <Download className="w-4 h-4" />
                      Télécharger
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Informations légales */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-8 bg-blue-900/20 border border-blue-500/30 rounded-lg p-6"
        >
          <h3 className="text-lg font-semibold mb-3 text-blue-400">Informations importantes</h3>
          <div className="text-sm text-gray-300 space-y-2">
            <p>• Vos factures sont générées automatiquement après chaque achat réussi</p>
            <p>• Les factures sont disponibles au format HTML et peuvent être imprimées</p>
            <p>• Conformément à la réglementation, nous conservons vos factures pendant 10 ans</p>
            <p>• TVA non applicable, art. 293 B du CGI (auto-entrepreneur)</p>
          </div>
        </motion.div>
      </div>
    </main>
  );
} 