'use client';

import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { FileText, Download, Eye } from 'lucide-react';
import InvoicesTable from '../../../../components/admin/InvoicesTable';

export default function AdminInvoicesPage() {
  useEffect(() => {
    document.title = "Admin - Factures | Margoul1";
  }, []);

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Gestion des Factures</h1>
          <p className="text-gray-400">Consultez et gérez toutes les factures générées</p>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-400">
          <FileText className="w-5 h-5" />
          <span>Factures</span>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
        className="bg-gray-800 rounded-lg p-6"
      >
        <div className="flex items-center gap-4 mb-6">
          <div className="p-3 bg-blue-500/20 rounded-lg">
            <FileText className="w-6 h-6 text-blue-400" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-white">Factures Générées</h2>
            <p className="text-sm text-gray-400">
              Toutes les factures sont générées automatiquement lors des achats réussis
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-gray-700 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <Download className="w-5 h-5 text-blue-400" />
              <div>
                <p className="text-sm text-gray-400">Téléchargement</p>
                <p className="text-white font-medium">Format HTML</p>
              </div>
            </div>
          </div>
          <div className="bg-gray-700 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <Eye className="w-5 h-5 text-green-400" />
              <div>
                <p className="text-sm text-gray-400">Visualisation</p>
                <p className="text-white font-medium">Aperçu direct</p>
              </div>
            </div>
          </div>
          <div className="bg-gray-700 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <FileText className="w-5 h-5 text-purple-400" />
              <div>
                <p className="text-sm text-gray-400">Conformité</p>
                <p className="text-white font-medium">Légale française</p>
              </div>
            </div>
          </div>
        </div>

        <InvoicesTable />
      </motion.div>
    </div>
  );
} 