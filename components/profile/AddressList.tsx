'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import toast from 'react-hot-toast';

interface Address {
  id: string;
  name: string;
  street: string;
  city: string;
  state?: string;
  zipCode: string;
  country: string;
  phone: string;
  isDefault: boolean;
}

export default function AddressList() {
  const { data: session, status } = useSession();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);

  useEffect(() => {
    if (status === 'authenticated') {
      fetchAddresses();
    }
  }, [status]);

  const fetchAddresses = async () => {
    try {
      const response = await fetch('/api/user/addresses', {
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error('Erreur lors de la récupération des adresses');
      }
      
      const data = await response.json();
      setAddresses(data);
    } catch (error) {
      console.error('Erreur:', error);
      toast.error('Impossible de charger les adresses');
    } finally {
      setIsLoading(false);
    }
  };

  // ... reste du code du composant ...
} 