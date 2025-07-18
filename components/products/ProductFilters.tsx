'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Filter, Smartphone, Laptop, Headphones } from 'lucide-react';

interface Category {
  id: string;
  name: string;
}

interface ProductFiltersProps {
  onCategoryChange: (categoryId: string) => void;
  selectedCategory: string;
}

export default function ProductFilters({ onCategoryChange, selectedCategory }: ProductFiltersProps) {
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch('/api/categories');
        const data = await response.json();
        setCategories([
          { id: 'all', name: 'Tous les produits' },
          ...data
        ]);
      } catch (error) {
        console.error('Erreur lors du chargement des catégories:', error);
      }
    };

    fetchCategories();
  }, []);

  const getIconForCategory = (categoryId: string) => {
    switch (categoryId) {
      case 'all': return <Filter className="w-5 h-5" />;
      case 'smartphones': return <Smartphone className="w-5 h-5" />;
      case 'laptops': return <Laptop className="w-5 h-5" />;
      case 'accessories': return <Headphones className="w-5 h-5" />;
      default: return <Filter className="w-5 h-5" />;
    }
  };

  return (
    <section className="sticky top-20 z-30 py-6 bg-black/80 backdrop-blur-lg border-t border-b border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div 
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="flex flex-wrap justify-center gap-4"
        >
          {categories.map((category) => (
            <motion.button
              key={category.id}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onCategoryChange(category.id)}
              className={`
                px-6 py-2 rounded-full transition-all duration-300 flex items-center gap-2
                ${selectedCategory === category.id
                  ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg shadow-blue-500/25'
                  : 'bg-gray-800/50 text-gray-300 hover:bg-gray-700/50 hover:text-white'
                }
              `}
            >
              {getIconForCategory(category.id)}
              {category.name}
            </motion.button>
          ))}
        </motion.div>
      </div>
    </section>
  );
} 