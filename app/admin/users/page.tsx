'use client';

import { useState, useEffect } from 'react';
import UsersTable from '../../../components/admin/UsersTable';
import { toast } from 'react-hot-toast';
import { User } from '@prisma/client';

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/admin/users');
      if (!response.ok) throw new Error('Erreur lors du chargement des utilisateurs');
      const data = await response.json();
      setUsers(data);
    } catch (error) {
      console.error('Erreur:', error);
      toast.error('Impossible de charger les utilisateurs');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleDeleteUser = async (userId: string): Promise<void> => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cet utilisateur ?')) return;

    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Erreur lors de la suppression');

      toast.success('Utilisateur supprimé avec succès');
      fetchUsers(); // Rafraîchir la liste
    } catch (error) {
      console.error('Erreur:', error);
      toast.error('Erreur lors de la suppression de l\'utilisateur');
      throw error;
    }
  };

  const handleEditUser = async (userId: string, userData: Partial<User>): Promise<void> => {
    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      if (!response.ok) throw new Error('Erreur lors de la mise à jour');

      toast.success('Utilisateur mis à jour avec succès');
      fetchUsers(); // Rafraîchir la liste
    } catch (error) {
      console.error('Erreur:', error);
      toast.error('Erreur lors de la mise à jour de l\'utilisateur');
      throw error;
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-white mb-8">Gestion des utilisateurs</h1>
      <UsersTable 
        users={users}
        isLoading={isLoading}
        onDelete={handleDeleteUser}
        onEdit={handleEditUser}
      />
    </div>
  );
} 