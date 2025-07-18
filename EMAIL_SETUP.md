# Configuration Email - Margoul1 Store

## Variables d'environnement requises

Ajoutez ces variables à votre fichier `.env.local` :

```env
# Configuration Email (SMTP)
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_SECURE="false"
SMTP_USER="your-email@gmail.com"
SMTP_PASS="your-app-password"
SMTP_FROM="Margoul1 Store <your-email@gmail.com>"
ADMIN_EMAIL="admin@margoul1.dev"
```

## Configuration Gmail

1. Activez l'authentification à 2 facteurs sur votre compte Gmail
2. Générez un mot de passe d'application :
   - Allez dans les paramètres de votre compte Google
   - Sécurité > Connexion à Google > Mots de passe d'application
   - Générez un mot de passe pour "Autre (nom personnalisé)"
   - Utilisez ce mot de passe dans `SMTP_PASS`

## Configuration PrivateEmail (Alternative)

Si vous utilisez PrivateEmail :

```env
SMTP_HOST="mail.privateemail.com"
SMTP_PORT="587"
SMTP_SECURE="false"
SMTP_USER="contact@margoul1.dev"
SMTP_PASS="your-password"
SMTP_FROM="Margoul1 Store <contact@margoul1.dev>"
ADMIN_EMAIL="admin@margoul1.dev"
```

## Fonctionnalités activées

1. **Notification automatique** : Quand un utilisateur envoie un message via le formulaire de contact, un email est automatiquement envoyé à l'admin

2. **Réponse par email** : Depuis le panel admin, vous pouvez répondre aux messages et l'email sera envoyé à l'utilisateur

3. **Templates HTML** : Les emails sont envoyés avec des templates HTML professionnels

## Test de la configuration

Pour tester que l'email fonctionne :

1. Envoyez un message via le formulaire de contact
2. Vérifiez que l'admin reçoit l'email de notification
3. Depuis le panel admin, répondez au message
4. Vérifiez que l'utilisateur reçoit l'email de réponse 