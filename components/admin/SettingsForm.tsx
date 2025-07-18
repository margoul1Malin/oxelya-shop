'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Save, Loader } from 'lucide-react';

interface SettingsFormProps {
  settings: {
    siteName: string;
    description: string;
    contactEmail: string;
    socialLinks: {
      facebook?: string;
      twitter?: string;
      instagram?: string;
    };
  };
  onSave: (settings: any) => void;
}

export default function SettingsForm({ settings, onSave }: SettingsFormProps) {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState(settings);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        throw new Error('Erreur lors de la sauvegarde');
      }

      const updatedSettings = await res.json();
      onSave(updatedSettings);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (error) {
      console.error(error);
      alert('Une erreur est survenue lors de la sauvegarde');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <h3 className="text-xl font-bold text-white mb-4">Paramètres généraux</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-gray-300 mb-2">Nom du site</label>
            <input
              type="text"
              value={formData.siteName}
              onChange={(e) => setFormData({ ...formData, siteName: e.target.value })}
              className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-white"
              required
            />
          </div>

          <div>
            <label className="block text-gray-300 mb-2">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-white h-32"
            />
          </div>

          <div>
            <label className="block text-gray-300 mb-2">Email de contact</label>
            <input
              type="email"
              value={formData.contactEmail}
              onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
              className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-white"
            />
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-xl font-bold text-white mb-4">Réseaux sociaux</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-gray-300 mb-2">Facebook</label>
            <input
              type="url"
              value={formData.socialLinks.facebook || ''}
              onChange={(e) => setFormData({
                ...formData,
                socialLinks: { ...formData.socialLinks, facebook: e.target.value }
              })}
              className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-white"
            />
          </div>

          <div>
            <label className="block text-gray-300 mb-2">Twitter</label>
            <input
              type="url"
              value={formData.socialLinks.twitter || ''}
              onChange={(e) => setFormData({
                ...formData,
                socialLinks: { ...formData.socialLinks, twitter: e.target.value }
              })}
              className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-white"
            />
          </div>

          <div>
            <label className="block text-gray-300 mb-2">Instagram</label>
            <input
              type="url"
              value={formData.socialLinks.instagram || ''}
              onChange={(e) => setFormData({
                ...formData,
                socialLinks: { ...formData.socialLinks, instagram: e.target.value }
              })}
              className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-white"
            />
          </div>
        </div>
      </div>

      {success && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-green-500/20 text-green-400 px-4 py-2 rounded-lg"
        >
          Paramètres sauvegardés avec succès !
        </motion.div>
      )}

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={loading}
          className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          {loading ? (
            <>
              <Loader className="w-5 h-5 animate-spin" />
              Sauvegarde...
            </>
          ) : (
            <>
              <Save className="w-5 h-5" />
              Sauvegarder
            </>
          )}
        </button>
      </div>
    </form>
  );
} 