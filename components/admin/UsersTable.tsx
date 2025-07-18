'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Edit, Trash, Shield, User } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { User as PrismaUser } from '@prisma/client';
import UserForm from './UserForm';
import { toast } from 'react-hot-toast';

interface UsersTableProps {
  users: PrismaUser[];
  onUserUpdate?: () => Promise<void>;
  isLoading: boolean;
  onDelete?: (userId: string) => Promise<void>;
  onEdit?: (userId: string, userData: Partial<PrismaUser>) => Promise<void>;
}

export default function UsersTable({ users, onUserUpdate, isLoading, onDelete, onEdit }: UsersTableProps) {
  const [editingUser, setEditingUser] = useState<PrismaUser | null>(null);

  const handleEdit = (user: PrismaUser) => {
    setEditingUser(user);
  };

  const handleEditSuccess = async () => {
    setEditingUser(null);
    if (onUserUpdate) {
      await onUserUpdate();
    }
  };

  const handleDelete = async (userId: string) => {
    try {
      if (!confirm('Êtes-vous sûr de vouloir supprimer cet utilisateur ?')) {
        return;
      }

      const response = await fetch(`/api/admin/users?id=${userId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Erreur lors de la suppression');
      }

      // Actualiser la liste
      if (onUserUpdate) {
        await onUserUpdate();
      }
      toast.success('Utilisateur supprimé avec succès !');
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      alert(error instanceof Error ? error.message : 'Erreur lors de la suppression');
    }
  };

  if (isLoading) {
    return <div className="text-center p-4">Chargement...</div>;
  }

  return (
    <div className="bg-gray-800 rounded-lg overflow-hidden">
      <table className="w-full text-left">
        <thead className="text-gray-400 bg-gray-700/50">
          <tr>
            <th className="p-4">Utilisateur</th>
            <th className="p-4">Email</th>
            <th className="p-4">Rôle</th>
            <th className="p-4">Date d'inscription</th>
            <th className="p-4">Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <motion.tr
              key={user.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-gray-300 border-b border-gray-700/50 hover:bg-gray-700/20"
            >
              <td className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gray-700 rounded-full flex items-center justify-center">
                    <User className="w-6 h-6 text-gray-400" />
                  </div>
                  <div>
                    <p className="font-medium text-white">{user.name}</p>
                  </div>
                </div>
              </td>
              <td className="p-4">{user.email}</td>
              <td className="p-4">
                <div className={`flex items-center gap-2 px-3 py-1 rounded-full w-fit ${
                  user.role === 'ADMIN' 
                    ? 'bg-blue-500/20 text-blue-400' 
                    : 'bg-gray-500/20 text-gray-400'
                }`}>
                  {user.role === 'ADMIN' ? <Shield className="w-4 h-4" /> : <User className="w-4 h-4" />}
                  <span>{user.role === 'ADMIN' ? 'Admin' : 'Utilisateur'}</span>
                </div>
              </td>
              <td className="p-4">
                {format(new Date(user.createdAt), 'PPP', { locale: fr })}
              </td>
              <td className="p-4">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleEdit(user)}
                    className="p-2 hover:bg-blue-500/20 rounded-lg text-gray-400 hover:text-blue-400"
                  >
                    <Edit className="w-5 h-5" />
                  </button>
                  {user.role !== 'ADMIN' && (
                    <button
                      onClick={() => handleDelete(user.id)}
                      className="p-2 hover:bg-red-500/20 rounded-lg text-gray-400 hover:text-red-400"
                    >
                      <Trash className="w-5 h-5" />
                    </button>
                  )}
                </div>
              </td>
            </motion.tr>
          ))}
        </tbody>
      </table>
      
      {/* Modal d'édition */}
      {editingUser && (
        <UserForm
          user={editingUser}
          onClose={() => setEditingUser(null)}
          onSuccess={handleEditSuccess}
        />
      )}
    </div>
  );
} 