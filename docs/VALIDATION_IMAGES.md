# Validation des Images - Sécurité et Contrôle de Taille

## 📋 Vue d'ensemble

Ce projet implémente une validation complète et sécurisée des images avec contrôle de taille (max 5MB) et vérification des types de fichiers autorisés.

## 🔒 Fonctionnalités de Sécurité

### Types de fichiers autorisés
- **JPEG/JPG** - Signature: `0xFF, 0xD8, 0xFF`
- **PNG** - Signature: `0x89, 0x50, 0x4E, 0x47`
- **WebP** - Signature: `0x52, 0x49, 0x46, 0x46`
- **GIF** - Signature: `0x47, 0x49, 0x46`

### Contrôles de sécurité
1. **Vérification de la signature binaire** - Détecte le vrai type de fichier
2. **Validation du type MIME** - Vérifie la cohérence avec l'extension
3. **Contrôle de taille** - Maximum 5MB par image
4. **Validation base64** - Vérifie l'encodage pour les images uploadées
5. **Limitation du nombre d'images** - Maximum 8 images par article

## 📁 Structure des fichiers

### Utilitaires centralisés
- `src/lib/image-validation.ts` - Fonctions de validation sécurisée
- `src/lib/localStorage-utils.ts` - Gestion du stockage local avec limites

### Validation côté client
- `src/app/(dashboard)/seller/vendre/page.tsx` - Upload d'images pour articles
- `src/components/forms/profile-form.tsx` - Upload d'images de profil

### Validation côté serveur
- `src/app/api/articles/route.ts` - API création d'articles
- `src/app/api/user/profile/route.ts` - API mise à jour profil

## 🛠️ Fonctions principales

### `validateImageFile(file: File)`
Valide un fichier image de manière sécurisée :
```typescript
const result = await validateImageFile(file)
if (result.isValid) {
  // Fichier valide
  const validFile = result.file
} else {
  // Erreur de validation
  console.error(result.error)
}
```

### `validateBase64Image(base64String: string)`
Valide une chaîne base64 d'image :
```typescript
const result = validateBase64Image(base64String)
if (result.isValid) {
  // Image base64 valide
} else {
  // Erreur de validation
  console.error(result.error)
}
```

### `validateMultipleImageFiles(files: FileList)`
Valide plusieurs fichiers simultanément :
```typescript
const { validFiles, errors } = await validateMultipleImageFiles(files)
// validFiles contient les fichiers valides
// errors contient les messages d'erreur
```

## 🔧 Configuration

### Limites configurables
```typescript
// Taille maximale par image
const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB

// Nombre maximum d'images par article
const MAX_IMAGES_PER_ARTICLE = 8

// Nombre maximum de brouillons
const MAX_DRAFTS = 5

// Limite localStorage
const LOCALSTORAGE_LIMIT = 4 * 1024 * 1024 // 4MB
```

## 🧪 Tests

Pour tester la validation :
```bash
node test-image-validation.js
```

Ce script teste :
- Images valides
- Formats invalides
- Encodage base64 corrompu
- Types MIME non autorisés
- Images trop volumineuses

## 🚀 Utilisation

### Upload d'images d'articles
1. L'utilisateur sélectionne des images
2. Validation côté client avec `validateMultipleImageFiles`
3. Conversion en base64 avec `convertToBase64`
4. Sauvegarde avec gestion de quota localStorage
5. Validation côté serveur lors de la soumission

### Upload d'images de profil
1. Sélection d'image de profil/bannière
2. Validation avec `validateImageFile`
3. Conversion en base64
4. Validation côté serveur lors de la mise à jour

## 🛡️ Sécurité

### Protection contre les attaques
- **Upload de fichiers malveillants** - Vérification de signature binaire
- **Dépassement de quota** - Limites strictes de taille
- **Injection de code** - Validation du format base64
- **Usurpation de type MIME** - Vérification croisée extension/signature

### Gestion des erreurs
- Messages d'erreur explicites pour l'utilisateur
- Logs détaillés côté serveur
- Fallback en cas d'échec de validation
- Nettoyage automatique du localStorage

## 📊 Monitoring

### Métriques surveillées
- Taille des images uploadées
- Utilisation du localStorage
- Taux d'échec de validation
- Performance des uploads

### Nettoyage automatique
- Suppression des anciens brouillons
- Limitation du nombre d'images par brouillon
- Gestion intelligente du quota localStorage

## 🔄 Maintenance

### Mise à jour des limites
Pour modifier les limites, éditer `src/lib/image-validation.ts` :
```typescript
// Nouvelle taille maximale (ex: 10MB)
const MAX_FILE_SIZE = 10 * 1024 * 1024

// Nouveaux types autorisés
const ALLOWED_IMAGE_TYPES = {
  // Ajouter de nouveaux types ici
  'image/avif': [0x00, 0x00, 0x00, 0x20]
}
```

### Ajout de nouveaux formats
1. Ajouter la signature binaire dans `ALLOWED_IMAGE_TYPES`
2. Mettre à jour `ALLOWED_EXTENSIONS`
3. Tester avec le script de validation
4. Mettre à jour la documentation

---

✅ **Validation des images implémentée avec succès !**

Le système garantit maintenant :
- Sécurité des uploads
- Contrôle de la taille (max 5MB)
- Types de fichiers autorisés uniquement
- Validation côté client ET serveur
- Gestion intelligente du stockage local