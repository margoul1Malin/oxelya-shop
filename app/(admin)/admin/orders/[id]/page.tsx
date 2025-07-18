'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { ArrowLeft } from 'lucide-react';
import LoadingSpinner from '../../../../../components/ui/LoadingSpinner';
import toast from 'react-hot-toast';

interface OrderDetails {
  id: string;
  createdAt: string;
  status: string;
  total: number;
  paymentMethod: string;
  paymentStatus: string;
  paymentIntentId?: string;
  shippingAddress: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
  items: Array<{
    id: string;
    quantity: number;
    price: number;
    product: {
      id: string;
      name: string;
      image: string;
      price: number;
    };
  }>;
  legalAcceptances?: Array<{
    id: string;
    documentType: string;
    documentVersion: string;
    acceptedAt: string;
  }>;
}

export default function OrderDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const [order, setOrder] = useState<OrderDetails | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const res = await fetch(`/api/admin/orders/${params.id}`);
        if (!res.ok) {
          throw new Error('Erreur lors de la récupération de la commande');
        }
        const data = await res.json();
        setOrder(data);
      } catch (error) {
        console.error('Erreur:', error);
        toast.error('Erreur lors du chargement de la commande');
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      fetchOrder();
    }
  }, [params.id]);

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!order) {
    return (
      <div className="p-4 text-center">
        <p className="text-red-400">Erreur lors du chargement de la commande</p>
        <button
          onClick={() => router.back()}
          className="mt-4 text-blue-400 hover:text-blue-500"
        >
          Retour
        </button>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <button
          onClick={() => router.back()}
          className="flex items-center text-gray-400 hover:text-white"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Retour
        </button>
      </div>

      <div className="bg-gray-800 rounded-lg p-6">
        <h1 className="text-2xl font-bold mb-6 break-all">
          Commande #{order.id}
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <div>
            <h2 className="text-lg font-semibold mb-4">Informations client</h2>
            <div className="space-y-2 text-sm">
              <p><span className="text-gray-400">Nom:</span> {order.user.name || 'Non renseigné'}</p>
              <p><span className="text-gray-400">Email:</span> {order.user.email}</p>
              <p><span className="text-gray-400">ID:</span> <span className="font-mono text-xs">{order.user.id}</span></p>
            </div>
          </div>

          <div>
            <h2 className="text-lg font-semibold mb-4">Détails commande</h2>
            <div className="space-y-2 text-sm">
              <p><span className="text-gray-400">Date:</span> {format(new Date(order.createdAt), 'Pp', { locale: fr })}</p>
              <p><span className="text-gray-400">Statut:</span> <span className={`px-2 py-1 rounded text-xs ${
                order.status === 'PAID' ? 'bg-green-600' : 
                order.status === 'PENDING' ? 'bg-yellow-600' : 
                order.status === 'CANCELLED' ? 'bg-red-600' : 'bg-gray-600'
              }`}>{order.status}</span></p>
              <p><span className="text-gray-400">Paiement:</span> {order.paymentMethod}</p>
              <p><span className="text-gray-400">Statut paiement:</span> <span className={`px-2 py-1 rounded text-xs ${
                order.paymentStatus === 'COMPLETED' ? 'bg-green-600' : 
                order.paymentStatus === 'PENDING' ? 'bg-yellow-600' : 
                order.paymentStatus === 'FAILED' ? 'bg-red-600' : 'bg-gray-600'
              }`}>{order.paymentStatus}</span></p>
              {order.paymentIntentId && (
                <p><span className="text-gray-400">Payment Intent:</span> <span className="font-mono text-xs">{order.paymentIntentId}</span></p>
              )}
            </div>
          </div>

          <div>
            <h2 className="text-lg font-semibold mb-4">Adresse de livraison</h2>
            <div className="text-sm">
              {order.shippingAddress ? (
                <div className="bg-gray-700/50 p-3 rounded">
                  {(() => {
                    try {
                      const addr = JSON.parse(order.shippingAddress);
                      return (
                        <div className="space-y-1">
                          {addr.name && <p className="font-medium">{addr.name}</p>}
                          {addr.line1 && <p>{addr.line1}</p>}
                          {addr.line2 && <p>{addr.line2}</p>}
                          {(addr.postalCode || addr.city) && (
                            <p>{addr.postalCode} {addr.city}</p>
                          )}
                          {addr.country && <p>{addr.country}</p>}
                          {addr.phone && <p className="text-gray-400">Tel: {addr.phone}</p>}
                        </div>
                      );
                    } catch {
                      return <p className="text-gray-400">{order.shippingAddress}</p>;
                    }
                  })()}
                </div>
              ) : (
                <p className="text-gray-400">Adresse non renseignée</p>
              )}
            </div>
          </div>
        </div>

        <div className="mt-6">
          <h2 className="text-lg font-semibold mb-4">Articles</h2>
          <div className="space-y-4">
            {order.items.map((item) => (
              <div
                key={item.id}
                className="flex items-center gap-4 bg-gray-700/50 p-4 rounded-lg"
              >
                <div className="w-16 h-16 relative">
                  {item.product?.image && (
                    <img
                      src={item.product.image}
                      alt={item.product.name}
                      className="object-cover w-full h-full rounded"
                    />
                  )}
                </div>
                <div className="flex-1">
                  <p className="font-medium">{item.product?.name}</p>
                  <p className="text-gray-400">Quantité: {item.quantity}</p>
                </div>
                <p className="font-medium">{(item.price * item.quantity).toFixed(2)} €</p>
              </div>
            ))}
          </div>

          <div className="mt-6 text-right">
            <p className="text-lg font-semibold">Total: {order.total.toFixed(2)} €</p>
          </div>
        </div>

        {/* Acceptations légales */}
        {order.legalAcceptances && order.legalAcceptances.length > 0 && (
          <div className="mt-8">
            <h2 className="text-lg font-semibold mb-4">Acceptations légales</h2>
            <div className="bg-gray-700/50 rounded-lg p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {order.legalAcceptances.map((acceptance) => (
                  <div key={acceptance.id} className="bg-gray-600/50 p-3 rounded">
                    <div className="flex justify-between items-start mb-2">
                      <span className="font-medium text-sm">
                        {acceptance.documentType === 'CGV' ? 'Conditions Générales de Vente' :
                         acceptance.documentType === 'PRIVACY_POLICY' ? 'Politique de Confidentialité' :
                         acceptance.documentType === 'LEGAL_MENTIONS' ? 'Mentions Légales' :
                         acceptance.documentType === 'COOKIES_POLICY' ? 'Politique de Cookies' :
                         acceptance.documentType}
                      </span>
                      <span className="text-xs text-gray-400">v{acceptance.documentVersion}</span>
                    </div>
                    <p className="text-xs text-gray-400">
                      Accepté le {format(new Date(acceptance.acceptedAt), 'Pp', { locale: fr })}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 