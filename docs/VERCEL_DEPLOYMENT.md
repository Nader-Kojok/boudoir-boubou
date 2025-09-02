# Guide de Déploiement Vercel

## Configuration des Variables d'Environnement

### Variables Requises dans Vercel Dashboard

Allez dans votre projet Vercel > Settings > Environment Variables et ajoutez :

```bash
# NextAuth.js Configuration (OBLIGATOIRE)
NEXTAUTH_URL=https://votre-app.vercel.app
NEXTAUTH_SECRET=votre-secret-super-securise-minimum-32-caracteres

# Base de données (OBLIGATOIRE)
DATABASE_URL=postgresql://username:password@host:port/database

# Mode développement pour récupération de mot de passe (Optionnel)
ENABLE_DEV_MODE=true

# Google OAuth (Optionnel)
GOOGLE_CLIENT_ID=votre-google-client-id
GOOGLE_CLIENT_SECRET=votre-google-client-secret
```

### Points Critiques pour la Production

#### 1. NEXTAUTH_URL
- **DOIT** être l'URL exacte de votre application Vercel
- Format : `https://votre-app.vercel.app`
- **SANS** slash final

#### 2. NEXTAUTH_SECRET
- Générez un secret sécurisé : `openssl rand -base64 32`
- Minimum 32 caractères
- Utilisez le même secret pour tous les environnements

#### 3. Cookies Sécurisés
- Les cookies sont automatiquement configurés pour la production
- Utilisation de `__Secure-` et `__Host-` prefixes
- Domain configuré pour `.vercel.app`

#### 4. ENABLE_DEV_MODE (Optionnel)
- Permet d'activer le mode développement sur Vercel
- Affiche les liens directs de réinitialisation de mot de passe
- Utile pour les tests en production sans service SMS configuré
- Valeurs : `true` ou `false` (par défaut)

## Problèmes Courants et Solutions

### 1. Redirection ne fonctionne pas

**Symptômes :**
- La page `/dashboard` ne redirige pas vers `/seller` ou `/buyer`
- Erreurs de session en production

**Solutions :**
- Vérifiez que `NEXTAUTH_URL` est correctement configuré
- Assurez-vous que `NEXTAUTH_SECRET` est défini
- Vérifiez les logs Vercel pour les erreurs de middleware

### 2. Erreurs de Headers Too Large

**Symptômes :**
- Erreur 431 Request Header Fields Too Large
- Déconnexions fréquentes

**Solutions :**
- Les cookies sont optimisés pour réduire la taille
- Le middleware nettoie automatiquement les cookies volumineux
- Redirection vers `/login?error=HeaderTooLarge` en cas de problème

### 3. Problèmes de Session

**Symptômes :**
- Session non persistante
- Déconnexion après rafraîchissement

**Solutions :**
- Vérifiez la configuration de la base de données
- Assurez-vous que Prisma est correctement configuré
- Vérifiez les migrations de base de données

## Configuration Vercel

### vercel.json

Le fichier `vercel.json` est configuré pour :
- Optimiser les fonctions serverless
- Configurer les headers de sécurité
- Gérer les timeouts

### Build Commands

```json
{
  "buildCommand": "npm run build",
  "installCommand": "npm install",
  "devCommand": "npm run dev"
}
```

## Debugging en Production

### Logs Vercel

1. Allez dans votre projet Vercel
2. Onglet "Functions"
3. Cliquez sur une fonction pour voir les logs
4. Recherchez les erreurs de middleware ou d'authentification

### Variables de Debug

Pour activer les logs NextAuth en production (temporairement) :

```bash
NEXTAUTH_DEBUG=true
```

**⚠️ Attention :** Désactivez en production normale pour éviter les fuites de données sensibles.

## Checklist de Déploiement

- [ ] `NEXTAUTH_URL` configuré avec l'URL Vercel exacte
- [ ] `NEXTAUTH_SECRET` généré et configuré
- [ ] `DATABASE_URL` configuré avec la base de données de production
- [ ] Migrations Prisma exécutées sur la base de données de production
- [ ] Variables d'environnement définies dans Vercel Dashboard
- [ ] Test de connexion/déconnexion
- [ ] Test de redirection `/dashboard` → `/seller` ou `/buyer`
- [ ] Vérification des logs Vercel pour les erreurs

## Support

En cas de problème persistant :

1. Vérifiez les logs Vercel
2. Testez en local avec `NODE_ENV=production`
3. Vérifiez la configuration NextAuth.js
4. Consultez la documentation NextAuth.js v4

## Migration Future

Cette configuration est compatible avec une migration future vers Auth.js v5.