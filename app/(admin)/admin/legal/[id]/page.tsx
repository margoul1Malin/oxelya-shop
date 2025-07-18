'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { ArrowLeft, User, FileText, Calendar, MapPin, Monitor, ShoppingCart } from 'lucide-react';
import { motion } from 'framer-motion';
import LoadingSpinner from '../../../../../components/ui/LoadingSpinner';
import { toast } from 'react-hot-toast';

interface LegalAcceptanceDetails {
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
    createdAt: string;
    paymentMethod: string;
  } | null;
}

const documentTypeLabels: Record<string, string> = {
  CGV: 'Conditions Générales de Vente',
  PRIVACY_POLICY: 'Politique de Confidentialité',
  LEGAL_MENTIONS: 'Mentions Légales',
  COOKIES_POLICY: 'Politique de Cookies'
};

export default function LegalAcceptanceDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const [acceptance, setAcceptance] = useState<LegalAcceptanceDetails | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAcceptance = async () => {
      try {
        const res = await fetch(`/api/admin/legal/${params.id}`);
        if (!res.ok) {
          throw new Error('Erreur lors de la récupération de l\'acceptation légale');
        }
        const data = await res.json();
        setAcceptance(data);
      } catch (error) {
        console.error('Erreur:', error);
        toast.error('Erreur lors du chargement de l\'acceptation légale');
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      fetchAcceptance();
    }
  }, [params.id]);

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!acceptance) {
    return (
      <div className="min-h-screen bg-black text-white pt-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center">
          <p className="text-red-400 mb-4">Erreur lors du chargement de l'acceptation légale</p>
          <button
            onClick={() => router.back()}
            className="text-blue-400 hover:text-blue-300"
          >
            Retour
          </button>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-black text-white pt-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-6">
          <button
            onClick={() => router.back()}
            className="flex items-center text-gray-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Retour aux acceptations légales
          </button>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gray-800 rounded-lg p-6"
        >
          <div className="flex items-center gap-3 mb-6">
            <FileText className="w-8 h-8 text-blue-500" />
            <div>
              <h1 className="text-2xl font-bold">
                Acceptation Légale #{acceptance.id.slice(-8)}
              </h1>
              <p className="text-gray-400">
                {documentTypeLabels[acceptance.documentType] || acceptance.documentType}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {/* Informations du document */}
            <div className="bg-gray-700/50 rounded-lg p-4">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <FileText className="w-5 h-5 text-blue-400" />
                Document
              </h2>
              <div className="space-y-3">
                <div>
                  <span className="text-gray-400">Type:</span>
                  <p className="font-medium">
                    {documentTypeLabels[acceptance.documentType] || acceptance.documentType}
                  </p>
                </div>
                <div>
                  <span className="text-gray-400">Version:</span>
                  <p className="font-medium">{acceptance.documentVersion}</p>
                </div>
                <div>
                  <span className="text-gray-400">Date d'acceptation:</span>
                  <p className="font-medium">
                    {format(new Date(acceptance.acceptedAt), 'Pp', { locale: fr })}
                  </p>
                </div>
              </div>
            </div>

            {/* Informations utilisateur */}
            <div className="bg-gray-700/50 rounded-lg p-4">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <User className="w-5 h-5 text-green-400" />
                Utilisateur
              </h2>
              <div className="space-y-3">
                <div>
                  <span className="text-gray-400">Nom:</span>
                  <p className="font-medium">{acceptance.user.name || 'Non renseigné'}</p>
                </div>
                <div>
                  <span className="text-gray-400">Email:</span>
                  <p className="font-medium">{acceptance.user.email}</p>
                </div>
                <div>
                  <span className="text-gray-400">ID Utilisateur:</span>
                  <p className="font-mono text-xs text-gray-300">{acceptance.user.id}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {/* Informations techniques */}
            <div className="bg-gray-700/50 rounded-lg p-4">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Monitor className="w-5 h-5 text-purple-400" />
                Informations techniques
              </h2>
              <div className="space-y-3">
                <div>
                  <span className="text-gray-400">Adresse IP:</span>
                  <p className="font-mono text-sm">{acceptance.ipAddress}</p>
                </div>
                <div>
                  <span className="text-gray-400">User Agent:</span>
                  <p className="text-sm text-gray-300 break-all">{acceptance.userAgent}</p>
                </div>
              </div>
            </div>

            {/* Commande associée */}
            <div className="bg-gray-700/50 rounded-lg p-4">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <ShoppingCart className="w-5 h-5 text-orange-400" />
                Commande associée
              </h2>
              {acceptance.order ? (
                <div className="space-y-3">
                  <div>
                    <span className="text-gray-400">Numéro:</span>
                    <p className="font-medium break-all">#{acceptance.order.id}</p>
                  </div>
                  <div>
                    <span className="text-gray-400">Montant:</span>
                    <p className="font-medium">{acceptance.order.total.toFixed(2)} €</p>
                  </div>
                  <div>
                    <span className="text-gray-400">Statut:</span>
                    <span className={`px-2 py-1 rounded text-xs ml-2 ${
                      acceptance.order.status === 'PAID' ? 'bg-green-600' : 
                      acceptance.order.status === 'PENDING' ? 'bg-yellow-600' : 
                      'bg-gray-600'
                    }`}>
                      {acceptance.order.status}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-400">Paiement:</span>
                    <p className="font-medium">{acceptance.order.paymentMethod}</p>
                  </div>
                  <div>
                    <span className="text-gray-400">Date commande:</span>
                    <p className="text-sm">
                      {format(new Date(acceptance.order.createdAt), 'Pp', { locale: fr })}
                    </p>
                  </div>
                  <button
                    onClick={() => router.push(`/admin/orders/${acceptance.order!.id}`)}
                    className="mt-2 text-blue-400 hover:text-blue-300 text-sm underline"
                  >
                    Voir la commande complète
                  </button>
                </div>
              ) : (
                <p className="text-gray-400">Aucune commande associée</p>
              )}
            </div>
          </div>

          {/* Informations juridiques */}
          <div className="bg-blue-900/20 border border-blue-700/50 rounded-lg p-4">
            <h3 className="text-lg font-semibold mb-3 text-blue-400">
              Valeur juridique
            </h3>
            <p className="text-sm text-gray-300 mb-3">
              Cette acceptation constitue une preuve juridiquement valable de l'accord de l'utilisateur 
              aux conditions du document mentionné. Les informations d'horodatage, d'adresse IP et 
              d'identification technique permettent d'établir l'authenticité de cette acceptation.
            </p>
            <div className="text-xs text-gray-400">
              <p>• Horodatage certifié au moment de l'acceptation</p>
              <p>• Traçabilité technique complète</p>
              <p>• Identification unique de l'utilisateur</p>
              <p>• Conformité RGPD pour la collecte des données</p>
            </div>
          </div>
        </motion.div>
      </div>
    </main>
  );
} 