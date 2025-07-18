'use client';

import { PayPalButtons, usePayPalScriptReducer } from '@paypal/react-paypal-js';
import { toast } from 'react-hot-toast';

interface PayPalPaymentProps {
  items: any[];
  shippingAddress: any;
  onSuccess: (orderId: string) => void;
  onError: (error: string) => void;
}

export default function PayPalPayment({ items, shippingAddress, onSuccess, onError }: PayPalPaymentProps) {
  const [{ isPending, isResolved }] = usePayPalScriptReducer();

  const createOrder = async () => {
    try {
      console.log('=== CRÉATION COMMANDE PAYPAL ===');
      console.log('Items:', items);
      console.log('Adresse:', shippingAddress);

      const response = await fetch('/api/payments/paypal/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          items,
          shippingAddress
        }),
      });

      const data = await response.json();
      console.log('Réponse création:', data);

      if (!response.ok) {
        throw new Error(data.error || 'Erreur lors de la création de la commande');
      }

      return data.orderId;
    } catch (error: any) {
      console.error('Erreur création commande PayPal:', error);
      onError(error.message || 'Erreur lors de la création de la commande');
      throw error;
    }
  };

  const onApprove = async (data: any) => {
    try {
      console.log('=== CAPTURE PAIEMENT PAYPAL ===');
      console.log('OrderID:', data.orderID);

      const response = await fetch('/api/payments/paypal/capture', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId: data.orderID,
        }),
      });

      const result = await response.json();
      console.log('Résultat capture:', result);

      if (!response.ok) {
        throw new Error(result.error || 'Erreur lors de la capture du paiement');
      }

      toast.success('Paiement PayPal réussi !');
      onSuccess(data.orderID);
    } catch (error: any) {
      console.error('Erreur capture PayPal:', error);
      onError(error.message || 'Erreur lors de la finalisation du paiement');
    }
  };

  const onCancel = () => {
    console.log('Paiement PayPal annulé');
    toast.error('Paiement annulé');
  };

  const onErrorHandler = (err: any) => {
    console.error('Erreur PayPal:', err);
    onError('Une erreur est survenue avec PayPal');
  };

  if (isPending) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        <span className="ml-3 text-gray-400">Chargement de PayPal...</span>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="bg-gray-800 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Paiement PayPal</h3>
        <PayPalButtons
          createOrder={createOrder}
          onApprove={onApprove}
          onCancel={onCancel}
          onError={onErrorHandler}
          style={{ 
            layout: 'vertical',
            color: 'blue',
            shape: 'rect',
            label: 'paypal'
          }}
        />
      </div>
    </div>
  );
} 