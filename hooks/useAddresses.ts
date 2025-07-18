'use client';

import { useState, useCallback } from 'react';
import { toast } from 'react-hot-toast';

interface Address {
  id: string;
  name: string;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  isDefault: boolean;
}

export function useAddresses() {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchAddresses = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/user/addresses');
      if (!response.ok) throw new Error('Erreur lors de la récupération des adresses');
      const data = await response.json();
      setAddresses(data);
    } catch (error) {
      toast.error('Impossible de charger les adresses');
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    addresses,
    isLoading,
    fetchAddresses
  };
} 