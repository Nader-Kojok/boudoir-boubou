"use client"

import { toast } from "sonner"

// interface Notification {
//   id: string
//   title: string
//   message: string
//   type: 'info' | 'success' | 'warning' | 'error'
//   read: boolean
//   createdAt: Date
//   data?: Record<string, unknown>
// }



interface NotificationOptions {
  title?: string
  description?: string
  duration?: number
}

export function useNotifications() {
  const showSuccess = (message: string, options?: NotificationOptions) => {
    toast.success(options?.title || "Succès", {
      description: options?.description || message,
      duration: options?.duration || 4000,
    })
  }

  const showError = (message: string, options?: NotificationOptions) => {
    toast.error(options?.title || "Erreur", {
      description: options?.description || message,
      duration: options?.duration || 6000,
    })
  }

  const showWarning = (message: string, options?: NotificationOptions) => {
    toast.warning(options?.title || "Attention", {
      description: options?.description || message,
      duration: options?.duration || 5000,
    })
  }

  const showInfo = (message: string, options?: NotificationOptions) => {
    toast.info(options?.title || "Information", {
      description: options?.description || message,
      duration: options?.duration || 4000,
    })
  }

  const showLoading = (message: string, options?: NotificationOptions) => {
    return toast.loading(options?.title || "Chargement", {
      description: options?.description || message,
    })
  }

  const dismiss = (toastId?: string | number) => {
    toast.dismiss(toastId)
  }

  return {
    showSuccess,
    showError,
    showWarning,
    showInfo,
    showLoading,
    dismiss,
  }
}

// Fonction utilitaire pour remplacer console.error dans les catch blocks
export function handleError(error: unknown, context?: string) {
  const message = error instanceof Error ? error.message : "Une erreur inattendue s'est produite"
  
  // Log pour le développement
  if (process.env.NODE_ENV === "development") {
    console.error(context ? `[${context}]` : "[Error]", error)
  }
  
  // Notification pour l'utilisateur
  toast.error("Erreur", {
    description: message,
    duration: 6000,
  })
}

// Fonction utilitaire pour les succès
export function handleSuccess(message: string, context?: string) {
  // Log pour le développement
  if (process.env.NODE_ENV === "development") {
    console.log(context ? `[${context}]` : "[Success]", message)
  }
  
  // Notification pour l'utilisateur
  toast.success("Succès", {
    description: message,
    duration: 4000,
  })
}

// Fonction utilitaire pour les informations
export function handleInfo(message: string, context?: string) {
  // Log pour le développement
  if (process.env.NODE_ENV === "development") {
    console.log(context ? `[${context}]` : "[Info]", message)
  }
  
  // Notification pour l'utilisateur
  toast.info("Information", {
    description: message,
    duration: 4000,
  })
}