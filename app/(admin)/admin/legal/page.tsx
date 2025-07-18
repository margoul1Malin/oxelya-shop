'use client';

import { motion } from 'framer-motion';
import LegalAcceptancesTable from '../../../../components/admin/LegalAcceptancesTable';

export default function AdminLegalPage() {
  return (
    <main className="min-h-screen text-white pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold mb-4">Gestion des Acceptations Légales</h1>
          <p className="text-gray-400">
            Traçabilité juridique des acceptations de CGV, politique de confidentialité et autres documents légaux.
          </p>
        </motion.div>

        <LegalAcceptancesTable />
      </div>
    </main>
  );
} 