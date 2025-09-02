'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  FileText, 
  Edit,
  Trash2,
  Calendar,
  Plus
} from 'lucide-react'
import Link from 'next/link'
import { formatDistanceToNow } from 'date-fns'
import { fr } from 'date-fns/locale'
import { handleError, handleSuccess } from '@/hooks/use-notifications'
import { useConfirmation } from '@/components/ui/confirmation-dialog'
import { cleanupOldDraftsIfNeeded } from '@/lib/localStorage-utils'
import { formatPrice } from '@/lib/utils'

interface Draft {
  id: string
  title: string
  description: string
  category: string
  price: string
  condition: string
  size?: string
  brand?: string
  color?: string
  images: string[]
  savedAt: string
  acceptTerms: boolean
}

export default function BrouillonsPage() {
  const [drafts, setDrafts] = useState<Draft[]>([])
  const [loading, setLoading] = useState(true)
  const { confirm, ConfirmationComponent } = useConfirmation()

  useEffect(() => {
    // Nettoyer automatiquement les anciens brouillons au chargement
    cleanupOldDraftsIfNeeded()
    loadDrafts()
  }, [])



  const loadDrafts = () => {
    try {
      // Nettoyer d'abord si nécessaire
      cleanupOldDraftsIfNeeded()
      
      // Charger tous les brouillons depuis localStorage
      const savedDrafts = localStorage.getItem('article-drafts')
      if (savedDrafts) {
        const draftsData = JSON.parse(savedDrafts)
        setDrafts(draftsData.sort((a: Draft, b: Draft) => 
          new Date(b.savedAt).getTime() - new Date(a.savedAt).getTime()
        ))
      }
      
      // Aussi vérifier s'il y a un brouillon actuel
      const currentDraft = localStorage.getItem('article-draft')
      if (currentDraft && !savedDrafts) {
        const draftData = JSON.parse(currentDraft)
        setDrafts([{
          id: 'current-draft',
          ...draftData
        }])
      }
    } catch (error) {
      // En cas d'erreur de parsing, nettoyer le localStorage
      localStorage.removeItem('article-drafts')
      localStorage.removeItem('article-draft')
      handleError(error, 'Chargement des brouillons')
    } finally {
      setLoading(false)
    }
  }

  const deleteDraft = async (draftId: string) => {
    const confirmed = await confirm({
      title: "Supprimer le brouillon",
      description: "Êtes-vous sûr de vouloir supprimer ce brouillon ? Cette action est irréversible.",
      confirmText: "Supprimer",
      cancelText: "Annuler",
      variant: "destructive"
    })

    if (confirmed) {
      try {
        // Supprimer des brouillons multiples
        const savedDrafts = localStorage.getItem('article-drafts')
        if (savedDrafts) {
          const draftsData = JSON.parse(savedDrafts)
          const updatedDrafts = draftsData.filter((draft: Draft) => draft.id !== draftId)
          localStorage.setItem('article-drafts', JSON.stringify(updatedDrafts))
          setDrafts(updatedDrafts)
        }
        
        // Si c'est le brouillon actuel, le supprimer aussi
        if (draftId === 'current-draft') {
          localStorage.removeItem('article-draft')
          setDrafts([])
        }
        
        // Vérifier si le brouillon supprimé était le brouillon actuel
        const currentDraft = localStorage.getItem('article-draft')
        if (currentDraft) {
          const currentDraftData = JSON.parse(currentDraft)
          if (currentDraftData.id === draftId) {
            localStorage.removeItem('article-draft')
          }
        }
        
        handleSuccess('Brouillon supprimé avec succès')
      } catch (error) {
        handleError(error, 'Suppression du brouillon')
      }
    }
  }

  const clearAllDrafts = async () => {
    const confirmed = await confirm({
      title: "Supprimer tous les brouillons",
      description: "Êtes-vous sûr de vouloir supprimer tous les brouillons ? Cette action libérera de l'espace de stockage mais est irréversible.",
      confirmText: "Tout supprimer",
      cancelText: "Annuler",
      variant: "destructive"
    })

    if (confirmed) {
      try {
        localStorage.removeItem('article-drafts')
        localStorage.removeItem('article-draft')
        setDrafts([])
        handleSuccess('Tous les brouillons ont été supprimés')
      } catch (error) {
        handleError(error, 'Suppression des brouillons')
      }
    }
  }

  const loadDraft = (draft: Draft) => {
    // Sauvegarder le brouillon sélectionné dans localStorage
    localStorage.setItem('article-draft', JSON.stringify(draft))
    // Rediriger vers la page de vente
    window.location.href = '/seller/vendre'
  }

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString)
      return formatDistanceToNow(date, { addSuffix: true, locale: fr })
    } catch {
      return 'Date inconnue'
    }
  }

  const getCategoryLabel = (category: string) => {
    const categories: Record<string, string> = {
      'mariage': 'Tenues de mariage',
      'soiree': 'Tenues de soirée',
      'traditionnel': 'Vêtements traditionnels',
      'tradi-casual': 'Vêtements tradi-casual',
      'accessoires': 'Accessoires'
    }
    return categories[category] || category
  }

  const getConditionLabel = (condition: string) => {
    const conditions: Record<string, string> = {
      'EXCELLENT': 'Excellent état',
      'GOOD': 'Bon état',
      'FAIR': 'État correct'
    }
    return conditions[condition] || condition
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-boudoir-beige-50 py-8">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-boudoir-beige-200 rounded w-64"></div>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-64 bg-boudoir-beige-200 rounded-lg"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-boudoir-beige-50 py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-boudoir-beige-900 mb-2">
                Mes brouillons
              </h1>
              <p className="text-boudoir-beige-700">
                Retrouvez et gérez vos articles en cours de rédaction
              </p>
            </div>
            <div className="flex gap-3">
              {drafts.length > 0 && (
                <Button
                  onClick={clearAllDrafts}
                  variant="outline"
                  className="border-red-200 text-red-600 hover:bg-red-50"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Tout supprimer
                </Button>
              )}
              <Link href="/seller/vendre">
                <Button className="bg-gradient-to-r from-[#a67c3a] to-[#8b5a2b] hover:from-[#8b5a2b] hover:to-[#6d4422] text-white shadow-lg hover:shadow-xl transition-all duration-300">
                  <Plus className="w-4 h-4 mr-2" />
                  Nouvel article
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {drafts.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <FileText className="w-16 h-16 text-boudoir-beige-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-boudoir-beige-900 mb-2">
                Aucun brouillon
              </h3>
              <p className="text-boudoir-beige-600 mb-6">
                Vous n&apos;avez pas encore de brouillons sauvegardés.
              </p>
              <Link href="/seller/vendre">
                <Button className="bg-gradient-to-r from-[#a67c3a] to-[#8b5a2b] hover:from-[#8b5a2b] hover:to-[#6d4422] text-white shadow-lg hover:shadow-xl transition-all duration-300">
                  <Plus className="w-4 h-4 mr-2" />
                  Créer un article
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {drafts.map((draft) => (
              <Card key={draft.id} className="hover:shadow-lg transition-shadow duration-300">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg font-semibold text-boudoir-beige-900 mb-2 line-clamp-2">
                        {draft.title || 'Brouillon sans titre'}
                      </CardTitle>
                      <div className="flex items-center gap-2 text-sm text-boudoir-beige-600">
                        <Calendar className="w-4 h-4" />
                        <span>{formatDate(draft.savedAt)}</span>
                      </div>
                    </div>
                    <Badge variant="secondary" className="bg-boudoir-beige-100 text-boudoir-beige-700">
                      Brouillon
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {draft.description && (
                      <p className="text-sm text-boudoir-beige-600 line-clamp-3">
                        {draft.description}
                      </p>
                    )}
                    
                    <div className="flex flex-wrap gap-2">
                      {draft.category && (
                        <Badge variant="outline" className="text-xs">
                          {getCategoryLabel(draft.category)}
                        </Badge>
                      )}
                      {draft.condition && (
                        <Badge variant="outline" className="text-xs">
                          {getConditionLabel(draft.condition)}
                        </Badge>
                      )}
                      {draft.price && (
                        <Badge variant="outline" className="text-xs">
                          {formatPrice(parseInt(draft.price))} FCFA
                        </Badge>
                      )}
                    </div>

                    {draft.images && draft.images.length > 0 && (
                      <div className="text-xs text-boudoir-beige-500">
                        {draft.images.length} image{draft.images.length > 1 ? 's' : ''} ajoutée{draft.images.length > 1 ? 's' : ''}
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2 mt-4">
                    <Button
                      onClick={() => loadDraft(draft)}
                      className="flex-1 bg-gradient-to-r from-[#a67c3a] to-[#8b5a2b] hover:from-[#8b5a2b] hover:to-[#6d4422] text-white shadow-lg hover:shadow-xl transition-all duration-300"
                      size="sm"
                    >
                      <Edit className="w-4 h-4 mr-2" />
                      Continuer
                    </Button>
                    <Button
                      onClick={() => deleteDraft(draft.id)}
                      variant="outline"
                      size="sm"
                      className="border-red-200 text-red-600 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
      {ConfirmationComponent}
    </div>
  )
}