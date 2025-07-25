# Configuration de Production sur Vercel

## Problème de Connexion en Production

Si vous ne pouvez pas vous connecter en production sur Vercel, c'est probablement dû à une mauvaise configuration des variables d'environnement.

## Variables d'Environnement Requises sur Vercel

### 1. NEXTAUTH_URL
**CRITIQUE**: Cette variable doit être définie sur votre URL de production Vercel.

```bash
# ❌ Incorrect (valeur locale)
NEXTAUTH_URL=http://localhost:3000

# ✅ Correct (URL de production)
NEXTAUTH_URL=https://votre-app.vercel.app
```

### 2. NEXTAUTH_SECRET
Générez un secret sécurisé pour la production :
```bash
openssl rand -base64 32
```

### 3. Variables de Base de Données
- `DATABASE_URL`
- `POSTGRES_URL` 
- `PRISMA_DATABASE_URL`

## Comment Configurer sur Vercel

### Via l'Interface Web
1. Allez sur [vercel.com](https://vercel.com)
2. Sélectionnez votre projet
3. Allez dans **Settings** > **Environment Variables**
4. Ajoutez/modifiez les variables suivantes :
   - `NEXTAUTH_URL` = `https://votre-app.vercel.app`
   - `NEXTAUTH_SECRET` = `votre-secret-genere`
   - Autres variables de base de données

### Via Vercel CLI
```bash
# Définir NEXTAUTH_URL
vercel env add NEXTAUTH_URL production
# Entrez: https://votre-app.vercel.app

# Définir NEXTAUTH_SECRET
vercel env add NEXTAUTH_SECRET production
# Entrez votre secret généré
```

## Redéploiement

Après avoir modifié les variables d'environnement :

```bash
# Redéployer l'application
vercel --prod
```

Ou déclenchez un nouveau déploiement depuis l'interface Vercel.

## Vérification

1. Vérifiez que `NEXTAUTH_URL` pointe vers votre domaine de production
2. Testez la connexion sur votre site de production
3. Vérifiez les logs Vercel en cas d'erreur

## Notes Importantes

- La configuration des cookies dans `src/lib/auth.ts` est déjà optimisée pour Vercel
- Les domaines `.vercel.app` sont automatiquement gérés
- En cas de domaine personnalisé, ajustez la configuration des cookies si nécessaire