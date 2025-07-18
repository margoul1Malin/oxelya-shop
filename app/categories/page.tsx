'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { 
  Smartphone, 
  Code, 
  Cloud, 
  ArrowRight, 
  Package,
  Star,
  Sparkles
} from 'lucide-react';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { toast } from 'react-hot-toast';

interface Product {
  id: string;
  name: string;
  price: number;
  image: string;
  rating: number | null;
  isNew: boolean;
  isCreated?: boolean;
}

interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  gradient?: string;
  products?: Product[];
  _count?: {
    products: number;
  };
}

const categoryIcons: { [key: string]: any } = {
  'Smartphone': Smartphone,
  'Code': Code,
  'Cloud': Cloud,
  'Package': Package
};

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/categories');
      if (!response.ok) throw new Error('Erreur lors du chargement');
      const data = await response.json();
      setCategories(data);
    } catch (error) {
      console.error('Erreur:', error);
      toast.error('Erreur lors du chargement des catégories');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 pt-24">
        <div className="container mx-auto px-4 py-8">
          <LoadingSpinner />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 pt-24">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="flex items-center justify-center gap-2 mb-4">
            <Package className="w-8 h-8 text-blue-400" />
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              Nos Catégories
            </h1>
          </div>
          <p className="text-gray-300 text-lg max-w-2xl mx-auto">
            Découvrez notre large gamme de produits organisés par catégorie pour faciliter votre shopping
          </p>
        </motion.div>

        {/* Categories Grid */}
        <div className="space-y-16">
          {categories.map((category, index) => {
            // Sélection sécurisée de l'icône
            let IconComponent = Package; // Par défaut
            if (category.icon && categoryIcons[category.icon]) {
              IconComponent = categoryIcons[category.icon];
            }
            
            return (
              <motion.div
                key={category.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-gray-800/30 backdrop-blur-sm rounded-2xl p-8 border border-gray-700/50"
              >
                {/* Category Header */}
                <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
                  <div className="flex items-center gap-4 mb-4 md:mb-0">
                    <div className={`p-3 rounded-xl bg-gradient-to-r ${category.gradient || 'from-blue-500 to-purple-500'} text-white`}>
                      {IconComponent && <IconComponent className="w-6 h-6" />}
                    </div>
                    <div>
                      <h2 className="text-2xl md:text-3xl font-bold text-white">
                        {category.name}
                      </h2>
                      <p className="text-gray-400 mt-1">
                        {category.description || `Découvrez nos ${category.name.toLowerCase()}`}
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-sm text-blue-400 font-medium">
                          {category._count?.products || 0} produit{(category._count?.products || 0) > 1 ? 's' : ''}
                        </span>
                        {category.products?.some(p => p.isNew) && (
                          <div className="flex items-center gap-1 text-xs text-emerald-400">
                            <Sparkles className="w-3 h-3" />
                            Nouveautés disponibles
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <Link
                    href={`/categories/${category.slug}`}
                    className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg hover:from-blue-600 hover:to-purple-600 transition-all duration-300 group self-start"
                  >
                    Voir tout
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>

                {/* Products Preview */}
                {category.products && category.products.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {category.products.map((product) => (
                      <motion.div
                        key={product.id}
                        whileHover={product.isCreated !== false ? { y: -5 } : {}}
                        className={`bg-gray-800/50 rounded-xl p-4 border border-gray-700/30 transition-all duration-300 ${
                          product.isCreated !== false 
                            ? 'hover:border-blue-500/30' 
                            : 'opacity-75'
                        }`}
                      >
                        <div className="aspect-square mb-4 relative overflow-hidden rounded-lg">
                          <img
                            src={product.image}
                            alt={product.name}
                            className={`w-full h-full object-cover transition-transform duration-300 ${
                              product.isCreated !== false 
                                ? 'hover:scale-110' 
                                : 'grayscale'
                            }`}
                          />
                          
                          {/* Badge Coming Soon pour les produits non créés */}
                          {product.isCreated === false && (
                            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                              <div className="bg-orange-500 text-white px-2 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
                                <Sparkles className="w-3 h-3" />
                                Coming Soon
                              </div>
                            </div>
                          )}
                          
                          {product.isNew && product.isCreated !== false && (
                            <div className="absolute top-2 right-2 bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-xs px-2 py-1 rounded-full">
                              Nouveau
                            </div>
                          )}
                        </div>
                        
                        <h3 className={`font-medium mb-2 truncate ${
                          product.isCreated !== false ? 'text-white' : 'text-gray-300'
                        }`}>
                          {product.name}
                        </h3>
                        
                        <div className="flex items-center justify-between">
                          <span className={`font-bold ${
                            product.isCreated !== false ? 'text-blue-400' : 'text-gray-500'
                          }`}>
                            {product.isCreated !== false ? `${product.price.toFixed(2)} €` : 'Prix à venir'}
                          </span>
                          {product.rating && product.isCreated !== false && (
                            <div className="flex items-center gap-1">
                              <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                              <span className="text-gray-300 text-sm">
                                {product.rating}
                              </span>
                            </div>
                          )}
                        </div>

                        {product.isCreated !== false ? (
                          <Link
                            href={`/produits/${product.id}`}
                            className="block w-full mt-3 px-4 py-2 bg-gray-700/50 hover:bg-blue-500 text-center text-white rounded-lg transition-all duration-300"
                          >
                            Voir le produit
                          </Link>
                        ) : (
                          <div className="block w-full mt-3 px-4 py-2 bg-gray-600 text-center text-gray-400 rounded-lg cursor-not-allowed">
                            Bientôt disponible
                          </div>
                        )}
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Package className="w-12 h-12 text-gray-500 mx-auto mb-4" />
                    <p className="text-gray-400">
                      Aucun produit disponible dans cette catégorie pour le moment
                    </p>
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>

        {/* Call to Action */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-16 text-center"
        >
          <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-2xl p-8 border border-blue-500/20">
            <h3 className="text-2xl font-bold text-white mb-4">
              Vous ne trouvez pas ce que vous cherchez ?
            </h3>
            <p className="text-gray-300 mb-6">
              Contactez-nous et nous vous aiderons à trouver le produit parfait
            </p>
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg hover:from-blue-600 hover:to-purple-600 transition-all duration-300"
            >
              Nous contacter
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
} 