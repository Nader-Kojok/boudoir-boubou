'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { CheckCircle, XCircle, MoreHorizontal, MessageSquare } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

interface ReportActionsProps {
  reportId: string
  currentStatus: 'PENDING' | 'RESOLVED' | 'REJECTED'
}

export function ReportActions({ reportId, currentStatus }: ReportActionsProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [actionType, setActionType] = useState<'resolve' | 'reject' | null>(null)
  const [notes, setNotes] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleAction = async () => {
    if (!actionType) return

    setIsLoading(true)
    try {
      const response = await fetch(`/api/reports/${reportId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: actionType === 'resolve' ? 'RESOLVED' : 'REJECTED',
          moderatorNotes: notes.trim() || undefined,
        }),
      })

      if (!response.ok) {
        throw new Error('Erreur lors de la mise à jour du signalement')
      }

      toast.success(
        actionType === 'resolve' 
          ? 'Signalement résolu avec succès' 
          : 'Signalement rejeté avec succès'
      )
      
      setIsDialogOpen(false)
      setActionType(null)
      setNotes('')
      router.refresh()
    } catch (error) {
      console.error('Erreur:', error)
      toast.error('Erreur lors de la mise à jour du signalement')
    } finally {
      setIsLoading(false)
    }
  }

  const openDialog = (type: 'resolve' | 'reject') => {
    setActionType(type)
    setIsDialogOpen(true)
  }

  if (currentStatus !== 'PENDING') {
    return (
      <Button variant="outline" size="sm" disabled>
        <MessageSquare className="h-4 w-4 mr-1" />
        Traité
      </Button>
    )
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => openDialog('resolve')}>
            <CheckCircle className="h-4 w-4 mr-2" />
            Résoudre
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => openDialog('reject')}>
            <XCircle className="h-4 w-4 mr-2" />
            Rejeter
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {actionType === 'resolve' ? 'Résoudre le signalement' : 'Rejeter le signalement'}
            </DialogTitle>
            <DialogDescription>
              {actionType === 'resolve' 
                ? 'Marquer ce signalement comme résolu. Vous pouvez ajouter des notes pour expliquer les actions prises.'
                : 'Rejeter ce signalement. Vous pouvez ajouter des notes pour expliquer pourquoi le signalement a été rejeté.'
              }
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">
                Notes du modérateur (optionnel)
              </label>
              <Textarea
                placeholder="Ajoutez des notes sur les actions prises ou les raisons du rejet..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={4}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDialogOpen(false)}
              disabled={isLoading}
            >
              Annuler
            </Button>
            <Button
              onClick={handleAction}
              disabled={isLoading}
              variant={actionType === 'resolve' ? 'default' : 'destructive'}
            >
              {isLoading ? 'Traitement...' : (
                actionType === 'resolve' ? 'Résoudre' : 'Rejeter'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}