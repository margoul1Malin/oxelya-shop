import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  try {
    console.log('🌱 Début du seed...');
    console.log('📊 Vérification de la connexion à la base de données...');

    // Test de connexion
    await prisma.$connect();
    console.log('✅ Connecté à la base de données');

    // Vérifier si l'admin existe déjà
    console.log('🔍 Recherche de l\'admin existant...');
    const existingAdmin = await prisma.user.findUnique({
      where: { email: 'admin@techstore.fr' }
    });

    if (!existingAdmin) {
      console.log('➕ Création de l\'admin...');
      const adminPassword = await bcrypt.hash('Admin123!', 10);
      console.log('🔑 Mot de passe hashé');

      const admin = await prisma.user.create({
        data: {
          email: 'admin@techstore.fr',
          password: adminPassword,
          name: 'Admin',
          role: 'ADMIN',
        },
      });
      console.log('👤 Admin créé:', admin);
    } else {
      console.log('ℹ️ Admin existe déjà:', existingAdmin.email);
    }

    // Vérification finale
    const adminCheck = await prisma.user.findUnique({
      where: { email: 'admin@techstore.fr' },
      select: {
        email: true,
        role: true,
      }
    });
    console.log('🔍 Vérification admin:', adminCheck);

    // Créer les catégories par défaut
    const categories = [
      {
        name: 'Gadgets',
        slug: 'gadgets',
        description: 'Gadgets innovants',
        icon: 'Smartphone',
        gradient: 'from-blue-500 to-purple-500'
      },
      {
        name: 'Softwares',
        slug: 'softwares',
        description: 'Logiciels et applications',
        icon: 'Code',
        gradient: 'from-green-500 to-blue-500'
      },
      {
        name: 'Services',
        slug: 'services',
        description: 'Services numériques',
        icon: 'Cloud',
        gradient: 'from-purple-500 to-pink-500'
      }
    ];

    console.log('🏷️ Création des catégories...');
    for (const category of categories) {
      await prisma.category.upsert({
        where: { slug: category.slug },
        update: {},
        create: category
      });
    }

    // Récupérer la catégorie Gadgets pour les produits
    const gadgetsCategory = await prisma.category.findUnique({
      where: { slug: 'gadgets' }
    });

    if (!gadgetsCategory) {
      throw new Error('Catégorie Gadgets non trouvée');
    }

    // Créer les produits avec la relation correcte
    const products = [
      {
        name: 'Smartphone Pro Max',
        description: 'Le smartphone le plus puissant de notre gamme avec un écran OLED 6.7"',
        price: 999,
        image: 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?q=80&w=1600',
        categoryId: gadgetsCategory.id,
        rating: 5,
        isNew: true
      },
      {
        name: 'Laptop Ultra',
        description: 'Processeur dernière génération, 32GB RAM, SSD 1TB',
        price: 1499,
        image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?q=80&w=1600',
        categoryId: gadgetsCategory.id,
        rating: 4,
        isNew: true
      },
      {
        name: 'Écouteurs Pro',
        description: 'Réduction de bruit active, autonomie de 24h',
        price: 249,
        image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=1600',
        categoryId: gadgetsCategory.id,
        rating: 4,
        isNew: false
      },
      {
        name: 'Montre Smart',
        description: 'Suivi santé avancé, GPS intégré, étanche 50m',
        price: 399,
        image: 'https://images.unsplash.com/photo-1579586337278-3befd40fd17a?q=80&w=1600',
        categoryId: gadgetsCategory.id,
        rating: 5,
        isNew: true
      }
    ];

    console.log('📱 Création des produits...');
    for (const product of products) {
      const existingProduct = await prisma.product.findUnique({
        where: { name: product.name }
      });

      if (!existingProduct) {
        await prisma.product.create({ data: product });
        console.log(`✅ Produit créé: ${product.name}`);
      }
    }

    console.log('✅ Seed terminé avec succès!');
  } catch (error) {
    console.error('❌ Erreur pendant le seed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

main()
  .catch((e) => {
    console.error('❌ Erreur fatale:', e);
    process.exit(1);
  }); 