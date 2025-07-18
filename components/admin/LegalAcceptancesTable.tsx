'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Eye, Filter, Search, Download, Trash, AlertTriangle } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface LegalAcceptance {
  id: string;
  documentType: string;
  documentVersion: string;
  ipAddress: string;
  userAgent: string;
  acceptedAt: string;
  user: {
    id: string;
    email: string;
    name: string | null;
  };
  order: {
    id: string;
    total: number;
    status: string;
  } | null;
}

interface LegalAcceptancesTableProps {
  className?: string;
}

const documentTypeLabels: Record<string, string> = {
  CGV: 'Conditions Générales de Vente',
  PRIVACY_POLICY: 'Politique de Confidentialité',
  LEGAL_MENTIONS: 'Mentions Légales',
  COOKIES_POLICY: 'Politique de Cookies'
};

export default function LegalAcceptancesTable({ className = '' }: LegalAcceptancesTableProps) {
  const [acceptances, setAcceptances] = useState<LegalAcceptance[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    documentType: '',
    search: ''
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    pages: 0
  });
  const [showDeleteAllModal, setShowDeleteAllModal] = useState(false);

  const fetchAcceptances = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
        ...(filters.documentType && { documentType: filters.documentType }),
        ...(filters.search && { userId: filters.search })
      });

      const response = await fetch(`/api/admin/legal?${params}`);
      if (!response.ok) throw new Error('Erreur lors du chargement');

      const data = await response.json();
      setAcceptances(data.acceptances);
      setPagination(data.pagination);
    } catch (error) {
      console.error('Erreur:', error);
      toast.error('Erreur lors du chargement des acceptations');
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.limit, filters.documentType, filters.search]);

  useEffect(() => {
    fetchAcceptances();
  }, [fetchAcceptances]);

  const exportToCSV = () => {
    const csvContent = [
      ['Date', 'Utilisateur', 'Email', 'Document', 'Version', 'IP', 'Commande', 'Total'].join(','),
      ...acceptances.map(acceptance => [
        new Date(acceptance.acceptedAt).toLocaleString('fr-FR'),
        acceptance.user.name || 'N/A',
        acceptance.user.email,
        documentTypeLabels[acceptance.documentType] || acceptance.documentType,
        acceptance.documentVersion,
        acceptance.ipAddress,
        acceptance.order?.id || 'N/A',
        acceptance.order?.total ? `${acceptance.order.total}€` : 'N/A'
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `acceptations-legales-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDeleteAll = async () => {
    try {
      const response = await fetch('/api/admin/legal/delete-bulk', {
        method: 'DELETE',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erreur lors de la suppression');
      }

      toast.success(data.message);
      setShowDeleteAllModal(false);
      fetchAcceptances(); // Recharger la liste
    } catch (error) {
      console.error('Erreur suppression acceptations:', error);
      toast.error(error instanceof Error ? error.message : 'Erreur lors de la suppression');
    }
  };

  const handleDeleteOne = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette acceptation légale ?')) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/legal/${id}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erreur lors de la suppression');
      }

      toast.success(data.message);
      fetchAcceptances(); // Recharger la liste
    } catch (error) {
      console.error('Erreur suppression acceptation:', error);
      toast.error(error instanceof Error ? error.message : 'Erreur lors de la suppression');
    }
  };

  if (loading) {
    return (
      <div className={`bg-gray-800 rounded-lg p-6 ${className}`}>
        <div className="animate-pulse">
          <div className="h-6 bg-gray-700 rounded mb-4"></div>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-12 bg-gray-700 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-gray-800 rounded-lg p-6 ${className}`}
    >
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-white">Acceptations Légales</h2>
        <div className="flex gap-3">
          <button
            onClick={exportToCSV}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-500 transition-colors"
          >
            <Download className="w-4 h-4" />
            Exporter CSV
          </button>
          <button
            onClick={() => setShowDeleteAllModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
          >
            <Trash className="w-4 h-4" />
            Supprimer tout
          </button>
        </div>
      </div>

      {/* Filtres */}
      <div className="flex gap-4 mb-6">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Rechercher par email utilisateur..."
            value={filters.search}
            onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
            className="w-full px-4 py-2 bg-gray-700 text-white rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <select
          value={filters.documentType}
          onChange={(e) => setFilters(prev => ({ ...prev, documentType: e.target.value }))}
          className="px-4 py-2 bg-gray-700 text-white rounded-lg focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Tous les documents</option>
          <option value="CGV">CGV</option>
          <option value="PRIVACY_POLICY">Politique de Confidentialité</option>
          <option value="LEGAL_MENTIONS">Mentions Légales</option>
          <option value="COOKIES_POLICY">Politique de Cookies</option>
        </select>
      </div>

      {/* Tableau */}
      <div className="overflow-x-auto">
        <table className="w-full text-white">
          <thead>
            <tr className="border-b border-gray-700">
              <th className="text-left py-3 px-2">Date</th>
              <th className="text-left py-3 px-2">Utilisateur</th>
              <th className="text-left py-3 px-2">Document</th>
              <th className="text-left py-3 px-2">Version</th>
              <th className="text-left py-3 px-2">IP</th>
              <th className="text-left py-3 px-2">Commande</th>
              <th className="text-left py-3 px-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {acceptances.map((acceptance) => (
              <tr key={acceptance.id} className="border-b border-gray-700 hover:bg-gray-700/50">
                <td className="py-3 px-2 text-sm">
                  {new Date(acceptance.acceptedAt).toLocaleString('fr-FR')}
                </td>
                <td className="py-3 px-2">
                  <div>
                    <div className="font-medium">{acceptance.user.name || 'Anonyme'}</div>
                    <div className="text-sm text-gray-400">{acceptance.user.email}</div>
                  </div>
                </td>
                <td className="py-3 px-2">
                  <span className="text-sm">
                    {documentTypeLabels[acceptance.documentType] || acceptance.documentType}
                  </span>
                </td>
                <td className="py-3 px-2 text-sm">{acceptance.documentVersion}</td>
                <td className="py-3 px-2 text-sm font-mono">{acceptance.ipAddress}</td>
                <td className="py-3 px-2">
                  {acceptance.order ? (
                    <div className="text-sm">
                      <div>#{acceptance.order.id.slice(-8)}</div>
                      <div className="text-gray-400">{acceptance.order.total}€</div>
                    </div>
                  ) : (
                    <span className="text-gray-400 text-sm">Aucune</span>
                  )}
                </td>
                <td className="py-3 px-2">
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        window.location.href = `/admin/legal/${acceptance.id}`;
                      }}
                      className="text-blue-400 hover:text-blue-300 transition-colors"
                      title="Voir les détails"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteOne(acceptance.id)}
                      className="text-red-400 hover:text-red-300 transition-colors"
                      title="Supprimer"
                    >
                      <Trash className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {acceptances.length === 0 && (
        <div className="text-center py-8 text-gray-400">
          Aucune acceptation légale trouvée
        </div>
      )}

      {/* Pagination */}
      {pagination.pages > 1 && (
        <div className="flex justify-center items-center gap-4 mt-6">
          <button
            onClick={() => setPagination(prev => ({ ...prev, page: Math.max(1, prev.page - 1) }))}
            disabled={pagination.page === 1}
            className="px-4 py-2 bg-gray-700 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-600"
          >
            Précédent
          </button>
          <span className="text-white">
            Page {pagination.page} sur {pagination.pages}
          </span>
          <button
            onClick={() => setPagination(prev => ({ ...prev, page: Math.min(prev.pages, prev.page + 1) }))}
            disabled={pagination.page === pagination.pages}
            className="px-4 py-2 bg-gray-700 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-600"
          >
            Suivant
          </button>
        </div>
      )}

      {/* Modal de suppression de toutes les acceptations */}
      {showDeleteAllModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-gray-800 rounded-lg p-6 max-w-md w-full"
          >
            <div className="flex items-center gap-3 mb-4">
              <AlertTriangle className="w-6 h-6 text-red-400" />
              <h3 className="text-lg font-bold text-white">Supprimer toutes les acceptations</h3>
            </div>
            
            <p className="text-gray-300 mb-6">
              Êtes-vous sûr de vouloir supprimer <strong>toutes</strong> les acceptations légales ? 
              Cette action est irréversible et supprimera définitivement toutes les preuves d'acceptation.
            </p>

            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteAllModal(false)}
                className="flex-1 px-4 py-2 bg-gray-600 hover:bg-gray-700 rounded-lg text-white"
              >
                Annuler
              </button>
              <button
                onClick={handleDeleteAll}
                className="flex-1 px-4 py-2 bg-red-500 hover:bg-red-600 rounded-lg text-white"
              >
                Supprimer tout
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </motion.div>
  );
} 