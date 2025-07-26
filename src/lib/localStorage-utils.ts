/**
 * Utilitaires pour la gestion du localStorage avec gestion automatique de la taille
 */

// Taille maximale recommandée pour le localStorage (4MB)
const MAX_STORAGE_SIZE = 4 * 1024 * 1024

/**
 * Calcule la taille totale utilisée par le localStorage
 */
export const getLocalStorageSize = (): number => {
  let total = 0
  for (let key in localStorage) {
    if (localStorage.hasOwnProperty(key)) {
      total += localStorage[key].length + key.length
    }
  }
  return total
}

/**
 * Vérifie si le localStorage approche de sa limite
 */
export const isStorageNearLimit = (threshold: number = 0.8): boolean => {
  return getLocalStorageSize() > MAX_STORAGE_SIZE * threshold
}

/**
 * Nettoie automatiquement les anciens brouillons si nécessaire
 */
export const cleanupDraftsIfNeeded = (newDataSize: number = 0): void => {
  const currentSize = getLocalStorageSize()
  
  if (currentSize + newDataSize > MAX_STORAGE_SIZE) {
    try {
      const existingDrafts = JSON.parse(localStorage.getItem('article-drafts') || '[]')
      
      // Trier par date (plus ancien en premier)
      const sortedDrafts = existingDrafts.sort((a: any, b: any) => 
        new Date(a.savedAt).getTime() - new Date(b.savedAt).getTime()
      )
      
      // Supprimer les brouillons un par un jusqu'à avoir assez d'espace
      let cleanedDrafts = [...sortedDrafts]
      while (cleanedDrafts.length > 0 && getLocalStorageSize() + newDataSize > MAX_STORAGE_SIZE) {
        cleanedDrafts.shift() // Supprimer le plus ancien
        localStorage.setItem('article-drafts', JSON.stringify(cleanedDrafts))
      }
      
      // Si toujours pas assez d'espace, vider complètement
      if (getLocalStorageSize() + newDataSize > MAX_STORAGE_SIZE) {
        localStorage.removeItem('article-drafts')
        localStorage.removeItem('article-draft')
      }
    } catch (error) {
      // En cas d'erreur, vider le localStorage des brouillons
      localStorage.removeItem('article-drafts')
      localStorage.removeItem('article-draft')
    }
  }
}

/**
 * Nettoie automatiquement les brouillons si le localStorage est trop plein
 */
export const cleanupOldDraftsIfNeeded = (): void => {
  if (isStorageNearLimit(0.8)) { // Nettoyer si on dépasse 80% de la limite
    try {
      const savedDrafts = localStorage.getItem('article-drafts')
      if (savedDrafts) {
        const draftsData = JSON.parse(savedDrafts)
        
        // Garder seulement les 3 brouillons les plus récents
        const recentDrafts = draftsData
          .sort((a: any, b: any) => new Date(b.savedAt).getTime() - new Date(a.savedAt).getTime())
          .slice(0, 3)
        
        localStorage.setItem('article-drafts', JSON.stringify(recentDrafts))
      }
    } catch (error) {
      // En cas d'erreur, vider complètement
      localStorage.removeItem('article-drafts')
    }
  }
}

/**
 * Sauvegarde sécurisée dans le localStorage avec gestion des erreurs de quota
 */
export const safeLocalStorageSet = (key: string, value: string): boolean => {
  try {
    localStorage.setItem(key, value)
    return true
  } catch (error) {
    if (error instanceof DOMException && error.code === 22) {
      // Quota exceeded, essayer de nettoyer et réessayer
      cleanupDraftsIfNeeded(value.length)
      try {
        localStorage.setItem(key, value)
        return true
      } catch (retryError) {
        return false
      }
    }
    return false
  }
}

/**
 * Formate la taille en octets en format lisible
 */
export const formatStorageSize = (bytes: number): string => {
  if (bytes === 0) return '0 B'
  
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

/**
 * Obtient des informations sur l'utilisation du localStorage
 */
export const getStorageInfo = () => {
  const currentSize = getLocalStorageSize()
  const maxSize = MAX_STORAGE_SIZE
  const usagePercentage = (currentSize / maxSize) * 100
  
  return {
    currentSize,
    maxSize,
    usagePercentage,
    formattedCurrentSize: formatStorageSize(currentSize),
    formattedMaxSize: formatStorageSize(maxSize),
    isNearLimit: isStorageNearLimit()
  }
}