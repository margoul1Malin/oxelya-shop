'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { User, MapPin, Plus, Trash2 } from 'lucide-react';
import { useAuth } from '../../../../hooks/useAuth';
import AddressForm from '../../../../components/profile/AddressForm';
import toast from 'react-hot-toast';
import { useSession } from 'next-auth/react';
import PasswordForm from '../../../../components/profile/PasswordForm';

interface UserSettings {
  name: string;
  email: string;
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

interface Address {
  id: string;
  name: string;
  street: string;
  city: string;
  state: string;
  phone: string;
  zipCode: string;
  country: string;
  isDefault: boolean;
}

export default function SettingsPage() {
  const { user, updateSession } = useAuth();
  const { data: session } = useSession();
  const [settings, setSettings] = useState<UserSettings>({
    name: '',
    email: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setSettings(prev => ({
        ...prev,
        name: user.name || '',
        email: user.email || ''
      }));
      fetchAddresses();
    }
  }, [user]);

  const fetchAddresses = async () => {
    try {
      const res = await fetch('/api/user/addresses');
      if (!res.ok) throw new Error('Erreur lors de la récupération des adresses');
      const data = await res.json();
      if (Array.isArray(data)) {
        setAddresses(data);
      } else {
        console.error('Les données reçues ne sont pas un tableau', data);
      }
    } catch (error) {
      console.error('Erreur chargement adresses:', error);
      toast.error('Impossible de charger les adresses');
    }
  };

  const handlePasswordChange = async (data: { currentPassword: string; newPassword: string }) => {
    try {
      const response = await fetch('/api/user/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Erreur lors de la mise à jour');
      }
    } catch (error) {
      console.error('Erreur:', error);
      throw error;
    }
  };

  const handleAddressSubmit = async (address: Partial<Address>) => {
    try {
      let url = '/api/user/addresses';
      let method = 'POST';

      // Si on modifie une adresse existante
      if (editingAddress) {
        url = `/api/user/addresses/${editingAddress.id}`;
        method = 'PUT';
      }

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...address,
          // Conserver le statut par défaut si on modifie une adresse par défaut
          isDefault: editingAddress?.isDefault || address.isDefault
        })
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Erreur lors de la sauvegarde');
      }

      toast.success(editingAddress ? 'Adresse modifiée' : 'Adresse ajoutée');
      setShowAddressForm(false);
      setEditingAddress(null);
      fetchAddresses();
    } catch (error) {
      console.error('Erreur adresse:', error);
      toast.error(error instanceof Error ? error.message : 'Une erreur est survenue');
    }
  };

  const handleDeleteAddress = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette adresse ?')) return;

    try {
      const res = await fetch(`/api/user/addresses/${id}`, {
        method: 'DELETE'
      });

      if (!res.ok) throw new Error('Erreur lors de la suppression');

      toast.success('Adresse supprimée');
      fetchAddresses();
    } catch (error) {
      console.error('Erreur suppression adresse:', error);
      toast.error('Une erreur est survenue');
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-white mb-8">Paramètres</h1>
      
      {/* Informations personnelles */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gray-800/50 rounded-xl p-6 backdrop-blur-sm border border-gray-700/50 mb-8"
      >
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-blue-500/10 rounded-lg">
            <User className="w-5 h-5 text-blue-500" />
          </div>
          <h2 className="text-xl font-semibold text-white">Informations personnelles</h2>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Nom d'utilisateur
            </label>
            <div className="px-4 py-2.5 bg-gray-900/50 rounded-lg border border-gray-700 text-gray-400">
              {user?.name || 'Non défini'}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Adresse email
            </label>
            <div className="px-4 py-2.5 bg-gray-900/50 rounded-lg border border-gray-700 text-gray-400">
              {user?.email}
            </div>
          </div>
          <p className="text-xs text-gray-400 mt-2">
            Pour modifier ces informations, veuillez contacter le support.
          </p>
        </div>
      </motion.section>

      {/* Mot de passe */}
      <div className="mb-8">
        <PasswordForm onSubmit={handlePasswordChange} />
      </div>

      <div className="space-y-8">
        <h1 className="text-2xl font-bold text-white">Paramètres du compte</h1>

        {/* Adresses */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gray-700/50 rounded-xl p-6"
        >
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-white flex items-center gap-2">
              <MapPin className="w-5 h-5" />
              Adresses
            </h2>
            <button
              onClick={() => {
                setEditingAddress(null);
                setShowAddressForm(true);
              }}
              className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors"
            >
              <Plus className="w-4 h-4" />
              Ajouter une adresse
            </button>
          </div>
          
          {showAddressForm && (
            <AddressForm
              onClose={() => {
                setShowAddressForm(false);
                setEditingAddress(null);
              }}
              onSubmit={handleAddressSubmit}
              initialData={editingAddress}
            />
          )}

          {/* Liste des adresses */}
          <div className="space-y-4">
            {addresses.map((address) => (
              <div
                key={address.id}
                className="bg-gray-800/50 rounded-xl p-4 flex justify-between items-start"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-medium text-white">{address.name}</h3>
                    {address.isDefault && (
                      <span className="text-xs bg-blue-500/20 text-blue-400 px-2 py-1 rounded-full">
                        Par défaut
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-400 mt-1">
                    {address.street}
                  </p>
                  <p className="text-sm text-gray-400">
                    {address.zipCode} {address.city}, {address.country}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setEditingAddress(address);
                      setShowAddressForm(true);
                    }}
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    Modifier
                  </button>
                  {!address.isDefault && (
                    <button
                      onClick={() => handleDeleteAddress(address.id)}
                      className="text-red-400 hover:text-red-300 transition-colors"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </motion.section>
      </div>
    </div>
  );
}
