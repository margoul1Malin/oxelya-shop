'use client';

import { motion } from 'framer-motion';
import { Search } from 'lucide-react';

interface SearchSortProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onSort: (sortBy: 'price-asc' | 'price-desc' | 'rating' | 'newest') => void;
}

export default function SearchSort({ searchQuery, onSearchChange, onSort }: SearchSortProps) {
  return (
    <div className="flex flex-col md:flex-row gap-4 items-center justify-between mb-8">
      <motion.div 
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="relative w-full md:w-96"
      >
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Rechercher un produit..."
          className="w-full pl-10 pr-4 py-2 bg-gray-900/50 border border-gray-800 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-white"
        />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        className="flex gap-2"
      >
        <select
          onChange={(e) => onSort(e.target.value as any)}
          className="px-4 py-2 bg-gray-900/50 border border-gray-800 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-white"
        >
          <option value="newest">Les plus récents</option>
          <option value="price-asc">Prix croissant</option>
          <option value="price-desc">Prix décroissant</option>
          <option value="rating">Mieux notés</option>
        </select>
      </motion.div>
    </div>
  );
} 