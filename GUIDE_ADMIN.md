# Guide d'accès au Dashboard Administrateur et Modération

## 🎯 Vue d'ensemble

Le système Boudoir dispose d'un dashboard administrateur complet avec des fonctionnalités de modération pour gérer les articles et les utilisateurs de la plateforme.

## 🔐 Création d'un compte administrateur

### Étape 1: Exécuter le script de création

```bash
# Depuis la racine du projet
node scripts/create-admin.js
```

Ce script va :
- Créer un utilisateur avec le rôle `ADMIN`
- Générer un mot de passe sécurisé par défaut
- Afficher les informations de connexion
- Vérifier qu'aucun admin n'existe déjà

### Étape 2: Personnaliser les informations (optionnel)

Vous pouvez modifier le script `create-admin.js` pour personnaliser :
- Le nom de l'administrateur
- Le numéro de téléphone
- Le mot de passe par défaut

## 🌐 Accès au Dashboard

### Routes disponibles

1. **Page de modération principale**
   - URL: `/admin/moderation`
   - Fonctionnalités: Modération des articles en attente

2. **API de modération**
   - Endpoint: `/api/moderation`
   - Méthodes: GET (liste), POST (actions)

### Processus de connexion

1. **Connexion à l'application**
   - Utilisez le numéro de téléphone et mot de passe créés
   - L'authentification se fait via NextAuth

2. **Accès automatique**
   - Une fois connecté avec un rôle `ADMIN`, accès direct à `/admin/moderation`
   - Le middleware vérifie automatiquement les permissions

## 🛡️ Sécurité et Permissions

### Rôles utilisateur

```typescript
enum UserRole {
  BUYER   // Acheteur
  SELLER  // Vendeur  
  ADMIN   // Administrateur
}
```

### Protection des routes

Le middleware (`src/middleware.ts`) protège automatiquement :
- Routes `/admin/*` : Accès réservé aux `ADMIN`
- Routes `/seller/*` : Accès aux `SELLER` et `ADMIN`
- Routes `/buyer/*` : Accès aux `BUYER` et `ADMIN`

### API sécurisées

Toutes les API administratives vérifient :
- Authentification valide
- Rôle `ADMIN` requis
- Session active

## 📋 Fonctionnalités de Modération

### Interface de modération

La page `/admin/moderation` permet de :

1. **Visualiser les articles en attente**
   - Liste des articles avec statut `PENDING`
   - Informations détaillées (titre, vendeur, prix, etc.)

2. **Actions de modération**
   - ✅ Approuver un article
   - ❌ Rejeter un article
   - 💬 Ajouter des commentaires de modération

3. **Gestion automatique**
   - Activation des promotions lors de l'approbation
   - Historique des actions de modération
   - Notifications aux vendeurs

### API de modération

```typescript
// GET /api/moderation
// Récupère les articles en attente

// POST /api/moderation
// Actions: approve, reject
{
  "articleId": "string",
  "action": "approve" | "reject",
  "comment": "string" // optionnel
}
```

## 🚀 Démarrage rapide

### 1. Créer un administrateur

```bash
node scripts/create-admin.js
```

### 2. Démarrer l'application

```bash
npm run dev
# ou
yarn dev
```

### 3. Se connecter

1. Aller sur `http://localhost:3000`
2. Se connecter avec les identifiants générés
3. Naviguer vers `/admin/moderation`

## 🔧 Dépannage

### Problèmes courants

1. **Accès refusé**
   - Vérifier que l'utilisateur a le rôle `ADMIN`
   - Vérifier que la session est active

2. **Page non trouvée**
   - Vérifier que le fichier `page.tsx` existe dans `(dashboard)/admin/moderation/`
   - Redémarrer le serveur de développement

3. **Erreurs d'authentification**
   - Vérifier la configuration NextAuth
   - Vérifier les variables d'environnement

### Logs utiles

```bash
# Vérifier les logs de l'application
npm run dev

# Vérifier la base de données
npx prisma studio
```

## 📁 Structure des fichiers

```
src/
├── app/
│   ├── (dashboard)/
│   │   └── admin/
│   │       └── moderation/
│   │           └── page.tsx          # Interface de modération
│   └── api/
│       └── moderation/
│           └── route.ts              # API de modération
├── middleware.ts                     # Protection des routes
└── lib/
    └── auth.ts                       # Configuration auth

scripts/
└── create-admin.js                   # Script de création admin

prisma/
└── schema.prisma                     # Modèle de données
```

## 🔄 Maintenance

### Changement de mot de passe admin

1. Se connecter au dashboard
2. Aller dans les paramètres de profil
3. Modifier le mot de passe

### Gestion des rôles

```sql
-- Promouvoir un utilisateur en admin
UPDATE "User" SET role = 'ADMIN' WHERE phone = '+221XXXXXXXXX';

-- Rétrograder un admin
UPDATE "User" SET role = 'BUYER' WHERE id = 'user_id';
```

---

**Note**: Ce guide couvre l'accès au dashboard administrateur. Pour des fonctionnalités avancées ou des personnalisations, consultez la documentation technique du projet.