'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { 
  Loader
} from 'lucide-react';
import { useProducts } from '../../../hooks/useProducts';
import SearchSort from '../../../components/products/search-sort';
import { useCart } from '../../../components/cart/CartProvider';
import ProductCard from '../../../components/products/ProductCard';

const categoryLinks = [
  { name: 'Tous', href: '/produits' },
  { name: 'Gadgets', href: '/categories/gadgets' },
  { name: 'Softwares', href: '/categories/softwares' },
  { name: 'Services', href: '/categories/services' }
];

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  rating: number | null;
  isCreated?: boolean;
  category: {
    name: string;
  };
}

export default function ProductsPage() {
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = React.useState(false);
  const {
    products: productsFromHook,
    loading: loadingFromHook,
    selectedCategory,
    searchQuery,
    setSelectedCategory,
    setSearchQuery,
    sortProducts: sortProductsFromHook,
    setProducts: setProductsFromHook,
  } = useProducts();

  const { dispatch } = useCart();

  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortOption, setSortOption] = useState<'newest' | 'price-asc' | 'price-desc' | 'rating'>('newest');

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/products');
        if (!response.ok) throw new Error('Erreur chargement produits');
        const data = await response.json();
        setProducts(data);
        setFilteredProducts(data);
      } catch (error) {
        console.error('Erreur:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const sortProducts = useCallback(() => {
    const sorted = [...products];
    switch (sortOption) {
      case 'price-asc':
        sorted.sort((a, b) => a.price - b.price);
        break;
      case 'price-desc':
        sorted.sort((a, b) => b.price - a.price);
        break;
      case 'rating':
        sorted.sort((a, b) => (b.rating || 0) - (a.rating || 0));
        break;
      case 'newest':
        sorted.sort((a, b) => b.id.localeCompare(a.id));
        break;
    }
    setFilteredProducts(sorted);
  }, [products, sortOption]);

  useEffect(() => {
    sortProducts();
  }, [sortProducts]);

  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredProducts(products);
      return;
    }

    const filtered = products.filter(product => 
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.description.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredProducts(filtered);
  }, [searchQuery, products]);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (sortOption !== 'newest') {
      sortProducts();
    }
  }, [sortOption, sortProducts]);

  useEffect(() => {
    document.title = "Margoul1 - Products";
  }, []);

  const handleAddToCart = (product: any) => {
    dispatch({ type: 'ADD_ITEM', payload: product });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <main className="min-h-screen text-white">
      {/* Hero Section */}
      <section className="relative h-[60vh] flex items-center overflow-hidden">
        <motion.div 
          initial={{ scale: 1.2, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 1.5 }}
          className="absolute inset-0"
        >
          <Image
            src="https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=2000"
            alt="Products background"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/80 to-black"></div>
        </motion.div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.h1
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8 }}
            className="text-5xl md:text-7xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-purple-500"
          >
            Nos Produits
          </motion.h1>
          <motion.p
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-xl text-gray-300 max-w-2xl mx-auto"
          >
            Découvrez notre collection de produits tech à la pointe de l'innovation
          </motion.p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <SearchSort
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onSort={sortProducts}
        />
      </div>

      {/* Liste des produits */}
      <section className="py-20 bg-gradient-to-b from-black to-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {filteredProducts.length === 0 && !loading ? (
            <div className="text-center py-10">
              <p className="text-gray-400">Aucun produit ne correspond à votre recherche</p>
            </div>
          ) : (
            Object.entries(
              filteredProducts.reduce((acc, product) => {
                const category = product.category.name;
                if (!acc[category]) {
                  acc[category] = [];
                }
                acc[category].push(product);
                return acc;
              }, {} as Record<string, Product[]>)
            ).map(([category, categoryProducts]) => (
              <div key={category} className="mb-16">
                <motion.h2 
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="text-3xl font-bold mb-8 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400"
                >
                  {category}
                </motion.h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {categoryProducts.map((product) => (
                    <motion.div
                      key={product.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                    >
                      <ProductCard product={product} />
                    </motion.div>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      </section>
    </main>
  );
}
