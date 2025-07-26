/**
 * Utilitaires de validation sécurisée pour les images
 */

// Types de fichiers autorisés avec leurs signatures MIME
const ALLOWED_IMAGE_TYPES = {
  'image/jpeg': [0xFF, 0xD8, 0xFF],
  'image/jpg': [0xFF, 0xD8, 0xFF],
  'image/png': [0x89, 0x50, 0x4E, 0x47],
  'image/webp': [0x52, 0x49, 0x46, 0x46],
  'image/gif': [0x47, 0x49, 0x46]
} as const

// Taille maximale autorisée (5MB)
const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB en bytes

// Extensions autorisées
const ALLOWED_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp', '.gif']

export interface ImageValidationResult {
  isValid: boolean
  error?: string
  file?: File
}

/**
 * Vérifie la signature binaire d'un fichier pour détecter son vrai type
 */
const checkFileSignature = async (file: File): Promise<boolean> => {
  return new Promise((resolve) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      const arrayBuffer = e.target?.result as ArrayBuffer
      if (!arrayBuffer) {
        resolve(false)
        return
      }
      
      const uint8Array = new Uint8Array(arrayBuffer.slice(0, 8))
      
      // Vérifier les signatures connues
      for (const [mimeType, signature] of Object.entries(ALLOWED_IMAGE_TYPES)) {
        if (signature.every((byte, index) => uint8Array[index] === byte)) {
          // Vérifier que le type MIME déclaré correspond
          resolve(file.type === mimeType || 
                 (mimeType === 'image/jpeg' && file.type === 'image/jpg'))
          return
        }
      }
      
      resolve(false)
    }
    reader.onerror = () => resolve(false)
    reader.readAsArrayBuffer(file.slice(0, 8))
  })
}

/**
 * Valide un fichier image de manière sécurisée
 */
export const validateImageFile = async (file: File): Promise<ImageValidationResult> => {
  // Vérification de base
  if (!file) {
    return {
      isValid: false,
      error: 'Aucun fichier sélectionné'
    }
  }

  // Vérification de la taille
  if (file.size > MAX_FILE_SIZE) {
    const sizeMB = (file.size / (1024 * 1024)).toFixed(1)
    return {
      isValid: false,
      error: `L'image est trop volumineuse (${sizeMB}MB). Taille maximale autorisée: 5MB`
    }
  }

  // Vérification du type MIME déclaré
  if (!Object.keys(ALLOWED_IMAGE_TYPES).includes(file.type)) {
    return {
      isValid: false,
      error: 'Type de fichier non autorisé. Formats acceptés: JPG, PNG, WebP, GIF'
    }
  }

  // Vérification de l'extension
  const fileName = file.name.toLowerCase()
  const hasValidExtension = ALLOWED_EXTENSIONS.some(ext => fileName.endsWith(ext))
  if (!hasValidExtension) {
    return {
      isValid: false,
      error: 'Extension de fichier non autorisée. Extensions acceptées: .jpg, .jpeg, .png, .webp, .gif'
    }
  }

  // Vérification de la signature binaire (sécurité renforcée)
  const hasValidSignature = await checkFileSignature(file)
  if (!hasValidSignature) {
    return {
      isValid: false,
      error: 'Le fichier ne semble pas être une image valide ou a été corrompu'
    }
  }

  return {
    isValid: true,
    file
  }
}

/**
 * Valide plusieurs fichiers images
 */
export const validateMultipleImageFiles = async (files: FileList | File[]): Promise<{
  validFiles: File[]
  errors: string[]
}> => {
  const validFiles: File[] = []
  const errors: string[] = []
  
  const fileArray = Array.from(files)
  
  for (let i = 0; i < fileArray.length; i++) {
    const file = fileArray[i]
    const result = await validateImageFile(file)
    
    if (result.isValid && result.file) {
      validFiles.push(result.file)
    } else {
      errors.push(`Fichier "${file.name}": ${result.error}`)
    }
  }
  
  return { validFiles, errors }
}

/**
 * Convertit un fichier en base64 de manière sécurisée
 */
export const convertToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result)
      } else {
        reject(new Error('Erreur lors de la conversion en base64'))
      }
    }
    reader.onerror = () => reject(new Error('Erreur lors de la lecture du fichier'))
    reader.readAsDataURL(file)
  })
}

/**
 * Valide une chaîne base64 d'image
 */
export const validateBase64Image = (base64String: string): { isValid: boolean; error?: string } => {
  // Vérifier le format data URL
  const dataUrlRegex = /^data:image\/(jpeg|jpg|png|webp|gif);base64,/
  if (!dataUrlRegex.test(base64String)) {
    return {
      isValid: false,
      error: 'Format de données invalide. Doit être une image en base64 avec un type MIME autorisé'
    }
  }
  
  // Vérifier que la partie base64 est valide
  try {
    const base64Data = base64String.split(',')[1]
    if (!base64Data) {
      return {
        isValid: false,
        error: 'Données base64 manquantes'
      }
    }
    
    // Vérifier que c'est du base64 valide
    const decodedData = atob(base64Data)
    
    // Vérifier la taille de l'image décodée
    const sizeInBytes = decodedData.length
    if (sizeInBytes > MAX_FILE_SIZE) {
      const sizeMB = (sizeInBytes / (1024 * 1024)).toFixed(1)
      return {
        isValid: false,
        error: `Image trop volumineuse (${sizeMB}MB). Taille maximale autorisée: 5MB`
      }
    }
    
    return { isValid: true }
  } catch {
    return {
      isValid: false,
      error: 'Données base64 corrompues ou invalides'
    }
  }
}

/**
 * Obtient des informations sur un fichier image
 */
export const getImageInfo = (file: File) => {
  return {
    name: file.name,
    size: file.size,
    sizeFormatted: `${(file.size / (1024 * 1024)).toFixed(2)} MB`,
    type: file.type,
    lastModified: new Date(file.lastModified)
  }
}

export { MAX_FILE_SIZE, ALLOWED_IMAGE_TYPES, ALLOWED_EXTENSIONS }