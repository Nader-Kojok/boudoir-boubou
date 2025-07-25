'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useConfirmation } from '@/components/ui/confirmation-dialog'
import { MoreHorizontal, Edit, Copy, CheckCircle, Trash2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

interface ArticleActionsDropdownProps {
  articleId: string
  articleTitle: string
  onStatusChange?: () => void
}

export function ArticleActionsDropdown({ 
  articleId, 
  articleTitle, 
  onStatusChange 
}: ArticleActionsDropdownProps) {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const { confirm, ConfirmationComponent } = useConfirmation()

  const handleEdit = () => {
    router.push(`/seller/vendre?edit=${articleId}`)
  }

  const handleDuplicate = async () => {
    try {
      setIsLoading(true)
      const response = await fetch(`/api/articles/${articleId}/duplicate`, {
        method: 'POST',
      })
      
      if (!response.ok) {
        throw new Error('Erreur lors de la duplication')
      }
      
      const data = await response.json()
      toast.success('Article dupliqué avec succès')
      router.push(`/seller/vendre?edit=${data.newArticleId}`)
    } catch (error) {
      toast.error('Erreur lors de la duplication de l\'article')
      console.error('Erreur duplication:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleMarkAsSold = async () => {
    try {
      setIsLoading(true)
      const response = await fetch(`/api/articles/${articleId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: 'SOLD' }),
      })
      
      if (!response.ok) {
        throw new Error('Erreur lors de la mise à jour du statut')
      }
      
      toast.success('Article marqué comme vendu')
      onStatusChange?.()
    } catch (error) {
      toast.error('Erreur lors de la mise à jour du statut')
      console.error('Erreur statut:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async () => {
    const confirmed = await confirm({
      title: 'Supprimer l\'article',
      description: `Êtes-vous sûr de vouloir supprimer l'article "${articleTitle}" ? Cette action est irréversible.`,
      confirmText: 'Supprimer',
      cancelText: 'Annuler',
      variant: 'destructive'
    })
    
    if (!confirmed) return

    try {
      setIsLoading(true)
      const response = await fetch(`/api/articles/${articleId}`, {
        method: 'DELETE',
      })
      
      if (!response.ok) {
        throw new Error('Erreur lors de la suppression')
      }
      
      toast.success('Article supprimé avec succès')
      onStatusChange?.()
    } catch (error) {
      toast.error('Erreur lors de la suppression de l\'article')
      console.error('Erreur suppression:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" disabled={isLoading}>
            <MoreHorizontal className="w-4 h-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuItem onClick={handleEdit}>
            <Edit className="w-4 h-4 mr-2" />
            Modifier
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleDuplicate}>
            <Copy className="w-4 h-4 mr-2" />
            Dupliquer
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleMarkAsSold}>
            <CheckCircle className="w-4 h-4 mr-2" />
            Marquer comme vendu
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem 
            onClick={handleDelete}
            className="text-destructive focus:text-destructive"
            disabled={isLoading}
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Supprimer
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      {ConfirmationComponent}
    </>
  )
}