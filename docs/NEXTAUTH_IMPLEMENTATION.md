# NextAuth.js Implementation Guide

## Vue d'ensemble

Cette application utilise **NextAuth.js v4** pour l'authentification, configuré selon les meilleures pratiques de sécurité et de performance.

## Configuration

### Variables d'environnement requises

Copiez `.env.example` vers `.env.local` et configurez :

```bash
# NextAuth.js Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key-here

# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Email Provider (SMTP)
EMAIL_SERVER_HOST=smtp.example.com
EMAIL_SERVER_PORT=587
EMAIL_SERVER_USER=your-email@example.com
EMAIL_SERVER_PASSWORD=your-email-password
EMAIL_FROM=noreply@example.com
```

### Providers configurés

1. **Google OAuth** - Connexion avec Google
2. **Email Provider** - Connexion par lien magique (email)

## Architecture

### Fichiers principaux

- `src/lib/auth.ts` - Configuration NextAuth.js
- `src/app/api/auth/[...nextauth]/route.ts` - Route API NextAuth.js
- `src/components/providers.tsx` - SessionProvider wrapper
- `src/lib/auth-utils.ts` - Utilitaires d'authentification côté serveur
- `src/middleware.ts` - Protection des routes

### Fonctionnalités implémentées

#### 1. Authentification sécurisée
- JWT avec encryption par défaut
- Cookies sécurisés (httpOnly, sameSite)
- Protection CSRF automatique
- Sessions de 30 jours avec refresh automatique

#### 2. Gestion des rôles
- Rôles utilisateur : `BUYER`, `SELLER`
- Attribution automatique du rôle `BUYER` pour nouveaux utilisateurs Google
- Middleware de protection basé sur les rôles

#### 3. Intégration Prisma
- Adapter Prisma pour la persistance
- Gestion automatique des utilisateurs
- Types TypeScript étendus

## Utilisation

### Côté client (React Components)

```tsx
import { useSession, signIn, signOut } from 'next-auth/react'

function MyComponent() {
  const { data: session, status } = useSession()
  const loading = status === 'loading'

  if (loading) return <p>Chargement...</p>
  
  if (session) {
    return (
      <>
        <p>Connecté en tant que {session.user.email}</p>
        <p>Rôle: {session.user.role}</p>
        <button onClick={() => signOut()}>Se déconnecter</button>
      </>
    )
  }
  
  return <button onClick={() => signIn()}>Se connecter</button>
}
```

### Côté serveur (Server Components)

```tsx
import { getSession, hasRole } from '@/lib/auth-utils'
import { redirect } from 'next/navigation'

export default async function ProtectedPage() {
  const session = await getSession()
  
  if (!session) {
    redirect('/login')
  }
  
  const isSeller = await hasRole('SELLER')
  
  return (
    <div>
      <h1>Page protégée</h1>
      <p>Bonjour {session.user.name}</p>
      {isSeller && <p>Vous êtes vendeur</p>}
    </div>
  )
}
```

### API Routes

```tsx
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'

export async function GET(request: Request) {
  const session = await getServerSession(authOptions)
  
  if (!session) {
    return new Response('Unauthorized', { status: 401 })
  }
  
  return Response.json({ user: session.user })
}
```

## Sécurité

### Mesures implémentées

1. **Cookies sécurisés** - httpOnly, sameSite, secure en production
2. **JWT chiffré** - Tokens chiffrés par défaut (JWE)
3. **Protection CSRF** - Tokens CSRF automatiques
4. **Validation des rôles** - Middleware de protection
5. **Variables d'environnement** - Secrets externalisés

### Bonnes pratiques suivies

- ✅ Secret NextAuth.js configuré
- ✅ Adapter de base de données utilisé
- ✅ Types TypeScript étendus
- ✅ SessionProvider correctement configuré
- ✅ Middleware de protection des routes
- ✅ Gestion d'erreurs dans les callbacks
- ✅ Validation des permissions côté serveur

## Débogage

### Variables d'environnement de debug

```bash
# Activer les logs NextAuth.js
NEXTAUTH_DEBUG=true
```

### Logs utiles

- Erreurs de callback dans la console serveur
- Status des sessions dans les composants
- Redirections du middleware

## Migration future vers Auth.js v5

L'implémentation actuelle est compatible avec une migration future vers Auth.js v5. Les principales différences seront :

1. Configuration centralisée dans `auth.ts`
2. Fonction `auth()` unifiée
3. Adapters sous namespace `@auth/*`

Pour plus d'informations : https://authjs.dev/getting-started/migrating-to-v5