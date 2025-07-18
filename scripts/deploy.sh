#!/bin/bash

# Script de déploiement optimisé pour Vercel
echo "🚀 Démarrage du déploiement..."

# Vérifier que les variables d'environnement sont définies
if [ -z "$DATABASE_URL" ]; then
    echo "❌ ERREUR: DATABASE_URL n'est pas définie"
    exit 1
fi

if [ -z "$NEXTAUTH_SECRET" ]; then
    echo "❌ ERREUR: NEXTAUTH_SECRET n'est pas définie"
    exit 1
fi

# Définir la variable pour ignorer les checksums Prisma
export PRISMA_ENGINES_CHECKSUM_IGNORE_MISSING=1

echo "✅ Variables d'environnement vérifiées"
echo "✅ Configuration Prisma optimisée"

# Générer le client Prisma
echo "🔧 Génération du client Prisma..."
npx prisma generate

if [ $? -eq 0 ]; then
    echo "✅ Client Prisma généré avec succès"
else
    echo "❌ Erreur lors de la génération du client Prisma"
    exit 1
fi

# Build de l'application
echo "🏗️ Build de l'application..."
npm run build

if [ $? -eq 0 ]; then
    echo "✅ Build terminé avec succès"
else
    echo "❌ Erreur lors du build"
    exit 1
fi

echo "🎉 Déploiement terminé avec succès!" 