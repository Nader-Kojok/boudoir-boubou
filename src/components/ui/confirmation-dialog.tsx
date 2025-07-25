"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { AlertTriangle, Info, CheckCircle, XCircle } from "lucide-react"
import { cn } from "@/lib/utils"

interface ConfirmationDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description: string
  confirmText?: string
  cancelText?: string
  variant?: "default" | "destructive" | "warning" | "info"
  onConfirm: () => void | Promise<void>
  loading?: boolean
}

const variantConfig = {
  default: {
    icon: CheckCircle,
    iconColor: "text-blue-500",
    confirmVariant: "default" as const,
  },
  destructive: {
    icon: XCircle,
    iconColor: "text-red-500",
    confirmVariant: "destructive" as const,
  },
  warning: {
    icon: AlertTriangle,
    iconColor: "text-yellow-500",
    confirmVariant: "default" as const,
  },
  info: {
    icon: Info,
    iconColor: "text-blue-500",
    confirmVariant: "default" as const,
  },
}

export function ConfirmationDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmText = "Confirmer",
  cancelText = "Annuler",
  variant = "default",
  onConfirm,
  loading = false,
}: ConfirmationDialogProps) {
  const [isLoading, setIsLoading] = useState(false)
  const config = variantConfig[variant]
  const Icon = config.icon

  const handleConfirm = async () => {
    setIsLoading(true)
    try {
      await onConfirm()
      onOpenChange(false)
    } catch {
      // L'erreur sera gérée par le composant parent
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className={cn(
              "flex h-10 w-10 items-center justify-center rounded-full",
              variant === "destructive" && "bg-red-100",
              variant === "warning" && "bg-yellow-100",
              variant === "info" && "bg-blue-100",
              variant === "default" && "bg-gray-100"
            )}>
              <Icon className={cn("h-5 w-5", config.iconColor)} />
            </div>
            <DialogTitle className="text-left">{title}</DialogTitle>
          </div>
        </DialogHeader>
        <DialogDescription className="text-left pl-13">
          {description}
        </DialogDescription>
        <DialogFooter className="flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isLoading || loading}
          >
            {cancelText}
          </Button>
          <Button
            variant={config.confirmVariant}
            onClick={handleConfirm}
            disabled={isLoading || loading}
          >
            {(isLoading || loading) && (
              <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
            )}
            {confirmText}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// Hook pour utiliser facilement les confirmations
export function useConfirmation() {
  const [dialog, setDialog] = useState<{
    open: boolean
    title: string
    description: string
    confirmText?: string
    cancelText?: string
    variant?: "default" | "destructive" | "warning" | "info"
    onConfirm: () => void | Promise<void>
  } | null>(null)

  const confirm = (options: {
    title: string
    description: string
    confirmText?: string
    cancelText?: string
    variant?: "default" | "destructive" | "warning" | "info"
  }) => {
    return new Promise<boolean>((resolve) => {
      setDialog({
        ...options,
        open: true,
        onConfirm: () => {
          resolve(true)
          setDialog(null)
        },
      })
    })
  }

  const ConfirmationComponent = dialog ? (
    <ConfirmationDialog
      open={dialog.open}
      onOpenChange={(open) => {
        if (!open) {
          setDialog(null)
        }
      }}
      title={dialog.title}
      description={dialog.description}
      confirmText={dialog.confirmText}
      cancelText={dialog.cancelText}
      variant={dialog.variant}
      onConfirm={dialog.onConfirm}
    />
  ) : null

  return { confirm, ConfirmationComponent }
}