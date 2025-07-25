# Système de Notifications et de Confirmation

Ce document explique comment utiliser le nouveau système de notifications et de dialogues de confirmation implémenté dans l'application.

## Vue d'ensemble

Le système comprend :
- **Notifications toast** : Pour afficher des messages de succès, d'erreur, d'avertissement et d'information
- **Dialogues de confirmation** : Pour demander confirmation avant des actions importantes
- **Remplacement des `console.error` et `alert()`** : Pour une meilleure expérience utilisateur

## Composants principaux

### 1. Hook `useNotifications`

**Fichier** : `src/hooks/use-notifications.ts`

Ce hook fournit des fonctions pour afficher différents types de notifications :

```typescript
import { useNotifications, handleError, handleSuccess, handleInfo } from '@/hooks/use-notifications'

const { success, error, warning, info, loading } = useNotifications()

// Exemples d'utilisation
success('Article publié avec succès!')
error('Erreur lors de la sauvegarde')
warning('Attention : cette action est irréversible')
info('Nouvelle fonctionnalité disponible')
loading('Chargement en cours...')
```

### 2. Fonctions utilitaires

Pour simplifier l'utilisation, des fonctions utilitaires sont disponibles :

```typescript
// Gestion d'erreur avec log en développement
handleError(error, 'Contexte de l\'erreur')

// Message de succès
handleSuccess('Opération réussie!')

// Message d'information
handleInfo('Information importante')
```

### 3. Composant `ConfirmationDialog`

**Fichier** : `src/components/ui/confirmation-dialog.tsx`

Pour les dialogues de confirmation :

```typescript
import { useConfirmation } from '@/components/ui/confirmation-dialog'

const { confirm, ConfirmationComponent } = useConfirmation()

// Dans votre fonction
const handleDelete = async () => {
  const confirmed = await confirm({
    title: 'Supprimer l\'article',
    description: 'Êtes-vous sûr de vouloir supprimer cet article ? Cette action est irréversible.',
    confirmText: 'Supprimer',
    cancelText: 'Annuler',
    variant: 'destructive'
  })
  
  if (confirmed) {
    // Procéder à la suppression
  }
}

// Dans le JSX
return (
  <div>
    {/* Votre contenu */}
    {ConfirmationComponent}
  </div>
)
```

## Configuration

### Toaster

Le composant `Toaster` est configuré dans `src/components/providers.tsx` avec :
- Position en bas à droite
- Couleurs riches activées
- Bouton de fermeture
- Durée de 4 secondes

### Variantes de confirmation

Le dialogue de confirmation supporte plusieurs variantes :
- `default` : Dialogue standard
- `destructive` : Pour les actions de suppression (rouge)
- `warning` : Pour les avertissements (orange)
- `info` : Pour les informations (bleu)

## Migration depuis l'ancien système

### Remplacement des `console.error`

**Avant :**
```typescript
try {
  // opération
} catch (error) {
  console.error('Erreur:', error)
}
```

**Après :**
```typescript
import { handleError } from '@/hooks/use-notifications'

try {
  // opération
} catch (error) {
  handleError(error, 'Contexte de l\'opération')
}
```

### Remplacement des `alert()`

**Avant :**
```typescript
alert('Opération réussie!')
```

**Après :**
```typescript
import { handleSuccess } from '@/hooks/use-notifications'

handleSuccess('Opération réussie!')
```

### Remplacement des `confirm()`

**Avant :**
```typescript
if (confirm('Êtes-vous sûr ?')) {
  // action
}
```

**Après :**
```typescript
import { useConfirmation } from '@/components/ui/confirmation-dialog'

const { confirm } = useConfirmation()

const confirmed = await confirm({
  title: 'Confirmation',
  description: 'Êtes-vous sûr de vouloir continuer ?'
})

if (confirmed) {
  // action
}
```

## Exemples d'implémentation

### Page de brouillons

Voir `src/app/(dashboard)/seller/brouillons/page.tsx` pour un exemple complet d'utilisation du système de confirmation et de notifications.

### Formulaire de profil

Voir `src/components/forms/profile-form.tsx` pour un exemple d'utilisation des notifications d'erreur.

### Page de vente

Voir `src/app/(dashboard)/seller/vendre/page.tsx` pour un exemple d'utilisation des notifications de succès et d'erreur.

## Bonnes pratiques

1. **Utilisez des messages descriptifs** : Évitez les messages génériques comme "Erreur"
2. **Fournissez du contexte** : Utilisez le paramètre `context` dans `handleError`
3. **Choisissez la bonne variante** : Utilisez `destructive` pour les suppressions
4. **N'oubliez pas le composant** : Ajoutez `{ConfirmationComponent}` dans votre JSX
5. **Gardez les logs en développement** : Les fonctions utilitaires conservent les `console.error` en mode dev

## Dépendances

- `sonner` : Bibliothèque de toast
- `@radix-ui/react-dialog` : Composant de dialogue
- `lucide-react` : Icônes
- `tailwindcss` : Styles

Le système est entièrement intégré avec le thème de l'application et supporte le mode sombre.