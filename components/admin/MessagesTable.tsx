'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trash, Mail, MailOpen, Reply, X, Eye, Send, Loader } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import toast from 'react-hot-toast';

interface Message {
  id: string;
  subject: string;
  content: string;
  status: 'READ' | 'UNREAD' | 'REPLIED';
  createdAt: string;
  user: {
    name: string;
    email: string;
  };
}

interface MessagesTableProps {
  messages: Message[];
  isLoading: boolean;
  onMessageUpdate: () => Promise<void>;
}

export default function MessagesTable({ messages, isLoading, onMessageUpdate }: MessagesTableProps) {
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [viewMessage, setViewMessage] = useState<Message | null>(null);
  const [replyMessage, setReplyMessage] = useState('');
  const [isReplying, setIsReplying] = useState(false);

  const handleStatusChange = async (messageId: string, newStatus: 'READ' | 'UNREAD') => {
    try {
      const res = await fetch(`/api/admin/messages/${messageId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || 'Erreur lors de la mise à jour du statut');
      }
      
      toast.success('Statut mis à jour');
      await onMessageUpdate();
    } catch (error: any) {
      console.error('Erreur:', error);
      toast.error(error.message || 'Erreur lors de la mise à jour du statut');
    }
  };

  const handleDelete = async (messageId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce message ?')) {
      return;
    }

    try {
      const res = await fetch(`/api/admin/messages/${messageId}`, {
        method: 'DELETE',
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Erreur lors de la suppression');
      }
      
      toast.success('Message supprimé avec succès');
      await onMessageUpdate();
    } catch (error: any) {
      console.error('Erreur:', error);
      toast.error(error.message || 'Erreur lors de la suppression');
    }
  };

  const handleSendReply = async () => {
    if (!selectedMessage || !replyMessage.trim()) {
      toast.error('Veuillez saisir un message de réponse');
      return;
    }

    setIsReplying(true);
    try {
      const res = await fetch(`/api/admin/messages/${selectedMessage.id}/reply`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ replyMessage }),
      });

      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || 'Erreur lors de l\'envoi de la réponse');
      }
      
      toast.success('Réponse envoyée avec succès !');
      setSelectedMessage(null);
      setReplyMessage('');
      await onMessageUpdate();
    } catch (error: any) {
      console.error('Erreur:', error);
      toast.error(error.message || 'Erreur lors de l\'envoi de la réponse');
    } finally {
      setIsReplying(false);
    }
  };

  if (isLoading) {
    return <div className="text-center p-4">Chargement des messages...</div>;
  }

  return (
    <div className="relative overflow-x-auto">
      <table className="w-full text-left text-gray-300">
        <thead className="text-gray-400 bg-gray-800/50">
          <tr>
            <th className="p-4">Statut</th>
            <th className="p-4">Expéditeur</th>
            <th className="p-4">Sujet</th>
            <th className="p-4">Date</th>
            <th className="p-4">Actions</th>
          </tr>
        </thead>
        <tbody>
          {messages.map((message) => (
            <tr
              key={message.id}
              className="border-b border-gray-700 hover:bg-gray-800/50"
            >
              <td className="p-4">
                <button
                  onClick={() => handleStatusChange(
                    message.id,
                    message.status === 'UNREAD' ? 'READ' : 'UNREAD'
                  )}
                  className={`p-2 rounded-lg transition-colors ${
                    message.status === 'UNREAD'
                      ? 'text-yellow-400 hover:bg-yellow-400/20'
                      : message.status === 'REPLIED'
                      ? 'text-green-400 hover:bg-green-400/20'
                      : 'text-gray-400 hover:bg-gray-700'
                  }`}
                >
                  {message.status === 'UNREAD' ? (
                    <Mail className="w-5 h-5" />
                  ) : message.status === 'REPLIED' ? (
                    <Reply className="w-5 h-5" />
                  ) : (
                    <MailOpen className="w-5 h-5" />
                  )}
                </button>
              </td>
              <td className="p-4">
                <div>
                  <p className="font-medium">{message.user.name}</p>
                  <p className="text-sm text-gray-400">{message.user.email}</p>
                </div>
              </td>
              <td className="p-4">
                <div>
                  <p>{message.subject}</p>
                  {message.status === 'REPLIED' && (
                    <span className="text-xs text-green-400">Répondu</span>
                  )}
                </div>
              </td>
              <td className="p-4">
                {format(new Date(message.createdAt), 'Pp', { locale: fr })}
              </td>
              <td className="p-4">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setViewMessage(message)}
                    className="p-2 hover:bg-blue-500/20 rounded-lg text-gray-400 hover:text-blue-400"
                    title="Voir le message"
                  >
                    <Eye className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => setSelectedMessage(message)}
                    className="p-2 hover:bg-green-500/20 rounded-lg text-gray-400 hover:text-green-400"
                    title="Répondre par email"
                  >
                    <Reply className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => handleDelete(message.id)}
                    className="p-2 hover:bg-red-500/20 rounded-lg text-gray-400 hover:text-red-400"
                    title="Supprimer le message"
                  >
                    <Trash className="w-5 h-5" />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Modal de visualisation du message */}
      <AnimatePresence>
        {viewMessage && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-gray-800 rounded-xl p-6 max-w-2xl w-full shadow-xl"
            >
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h3 className="text-xl font-bold text-white mb-2">
                    {viewMessage.subject}
                  </h3>
                  <p className="text-gray-400">
                    De: {viewMessage.user.name} ({viewMessage.user.email})
                  </p>
                  <p className="text-gray-400">
                    Date: {format(new Date(viewMessage.createdAt), 'Pp', { locale: fr })}
                  </p>
                  <div className="mt-2">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      viewMessage.status === 'UNREAD' 
                        ? 'bg-yellow-400/20 text-yellow-400'
                        : viewMessage.status === 'REPLIED'
                        ? 'bg-green-400/20 text-green-400'
                        : 'bg-gray-400/20 text-gray-400'
                    }`}>
                      {viewMessage.status === 'UNREAD' ? 'Non lu' : 
                       viewMessage.status === 'REPLIED' ? 'Répondu' : 'Lu'}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => setViewMessage(null)}
                  className="text-gray-400 hover:text-white"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              
              <div className="bg-gray-700/50 rounded-lg p-4 mb-6">
                <p className="text-gray-200 whitespace-pre-wrap">
                  {viewMessage.content}
                </p>
              </div>

              <div className="flex justify-end gap-4">
                <button
                  onClick={() => setViewMessage(null)}
                  className="px-4 py-2 text-gray-400 hover:text-white"
                >
                  Fermer
                </button>
                <button
                  onClick={() => {
                    setViewMessage(null);
                    setSelectedMessage(viewMessage);
                  }}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                >
                  Répondre
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Modal de réponse avec formulaire complet */}
      <AnimatePresence>
        {selectedMessage && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="bg-gray-800 rounded-xl p-6 max-w-2xl w-full shadow-xl"
            >
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h3 className="text-xl font-bold text-white mb-2">
                    Répondre à {selectedMessage.user.name}
                  </h3>
                  <p className="text-gray-400">Email: {selectedMessage.user.email}</p>
                  <p className="text-gray-400">Sujet: Re: {selectedMessage.subject}</p>
                </div>
                <button
                  onClick={() => {
                    setSelectedMessage(null);
                    setReplyMessage('');
                  }}
                  className="text-gray-400 hover:text-white"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Message original */}
              <div className="bg-gray-700/50 rounded-lg p-4 mb-6">
                <h4 className="text-sm font-medium text-gray-300 mb-2">Message original :</h4>
                <p className="text-gray-400 text-sm whitespace-pre-wrap">
                  {selectedMessage.content}
                </p>
              </div>

              {/* Formulaire de réponse */}
              <div className="mb-6">
                <label className="block text-gray-300 mb-2 font-medium">
                  Votre réponse :
                </label>
                <textarea
                  value={replyMessage}
                  onChange={(e) => setReplyMessage(e.target.value)}
                  placeholder="Tapez votre réponse ici..."
                  className="w-full h-32 px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-white resize-none"
                  disabled={isReplying}
                />
              </div>

              <div className="flex justify-end gap-4">
                <button
                  onClick={() => {
                    setSelectedMessage(null);
                    setReplyMessage('');
                  }}
                  className="px-4 py-2 text-gray-400 hover:text-white"
                  disabled={isReplying}
                >
                  Annuler
                </button>
                <button
                  onClick={handleSendReply}
                  disabled={isReplying || !replyMessage.trim()}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {isReplying ? (
                    <>
                      <Loader className="w-4 h-4 animate-spin" />
                      Envoi en cours...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      Envoyer la réponse
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
} 