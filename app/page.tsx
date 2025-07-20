import Image from 'next/image';
import Link from 'next/link';
import { Suspense } from 'react';
import prisma from '../lib/prisma';
import { Laptop, Smartphone, Gamepad, ArrowRight } from 'lucide-react';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { MotionDiv } from '../components/ui/MotionDiv';
import ProductCard from '../components/products/ProductCard';
import { Product } from '../types';

// Récupérer les derniers produits
async function getLatestProducts() {
  const products = await prisma.product.findMany({
    select: {
      id: true,
      name: true,
      description: true,
      price: true,
      image: true,
      categoryId: true,
      isNew: true,
      isCreated: true,
      isService: true,
      rating: true,
      createdAt: true,
      category: {
        select: {
          name: true
        }
      }
    },
    take: 5,
    orderBy: {
      createdAt: 'desc'
    }
  });

  return products.map(product => ({
    ...product,
    createdAt: product.createdAt.toISOString(),
    rating: product.rating || null,
  }));
}

export default async function Home() {
  const latestProducts = await getLatestProducts();

  const categories = [
    {
      name: 'Gadgets',
      description: 'Innovations technologiques',
      icon: Smartphone,
      href: '/categories/gadgets',
      gradient: 'from-blue-600 via-blue-500 to-cyan-400'
    },
    {
      name: 'Softwares',
      description: 'Solutions digitales',
      icon: Laptop,
      href: '/categories/softwares',
      gradient: 'from-purple-600 via-purple-500 to-pink-400'
    },
    {
      name: 'Services',
      description: 'Support professionnel',
      icon: Gamepad,
      href: '/categories/services',
      gradient: 'from-emerald-600 via-emerald-500 to-green-400'
    }
  ];

  return (
    <main className="bg-black min-h-screen">
      {/* Hero Section avec effet de défilement */}
      <section className="relative min-h-[90vh] flex items-center">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-black via-black/90 to-black z-10" />
          <MotionDiv
            initial={{ scale: 1.2 }}
            animate={{ scale: 1 }}
            transition={{ duration: 20, repeat: Infinity, repeatType: "reverse" }}
            className="absolute inset-0"
          >
            <Image
              src="https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&q=80"
              alt="Tech background"
              fill
              className="object-cover object-center"
              priority
            />
          </MotionDiv>
        </div>

        <div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <MotionDiv
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="space-y-8"
          >
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight">
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-600">
                Prenez en main
              </span>
              <span className="block text-white mt-2">
                toute la puissance technologique
              </span>
            </h1>
            <p className="max-w-2xl text-gray-400 text-xl">
              Découvrez nos produits abordables et de qualité.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link
                href="/produits"
                className="group relative px-6 py-3 text-lg font-medium text-white bg-gradient-to-r from-blue-500 to-purple-600 rounded-full overflow-hidden transition-transform hover:scale-105"
              >
                <span className="relative z-10 flex items-center gap-2">
                  Explorer
                  <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-blue-500 opacity-0 group-hover:opacity-100 transition-opacity" />
              </Link>
            </div>
          </MotionDiv>
        </div>

        {/* Scroll Indicator */}
        <MotionDiv
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20"
        >
          <MotionDiv
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="w-6 h-10 rounded-full border-2 border-white/20 flex items-start justify-center p-1"
          >
            <div className="w-1.5 h-3 bg-white/50 rounded-full" />
          </MotionDiv>
        </MotionDiv>
      </section>

      {/* Categories Section */}
      <section className="py-24 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <MotionDiv
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl font-bold text-white mb-4">Nos Catégories</h2>
            <p className="text-gray-400">Explorez notre gamme de solutions</p>
          </MotionDiv>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {categories.map((category, index) => (
              <MotionDiv
                key={category.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Link href={category.href}>
                  <div className="group relative overflow-hidden rounded-2xl bg-gray-900 p-8 h-full transition-transform hover:scale-[1.02]">
                    <div className="relative z-10">
                      <category.icon className="w-12 h-12 mb-4 text-white" />
                      <h3 className="text-xl font-semibold text-white mb-2">{category.name}</h3>
                      <p className="text-gray-400">{category.description}</p>
                    </div>
                    <div className={`absolute inset-0 bg-gradient-to-br ${category.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-300`} />
                  </div>
                </Link>
              </MotionDiv>
            ))}
          </div>
        </div>
      </section>

      {/* Latest Products Section */}
      <section className="py-24 relative bg-gray-900/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <MotionDiv
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl font-bold text-white mb-4">Dernières Nouveautés</h2>
            <p className="text-gray-400">Découvrez nos produits les plus récents</p>
          </MotionDiv>

          <Suspense fallback={<LoadingSpinner />}>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
              {latestProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </Suspense>
        </div>
      </section>
    </main>
  );
} 
