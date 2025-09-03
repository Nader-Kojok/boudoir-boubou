'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { toast } from 'sonner'
import { CheckCircle, XCircle, Clock, CreditCard } from 'lucide-react'
import Image from 'next/image'

interface Article {
  id: string
  title: string
  description: string
  price: number
  images: string[]
  condition: string
  size?: string
  brand?: string
  color?: string
  createdAt: string
  seller: {
    id: string
    name: string
    email: string
    image?: string
  }
  category: {
    id: string
    name: string
    slug: string
  }
  payment?: {
    id: string
    amount: number
    method: string
    status: string
    transactionId: string
    completedAt: string
  }
  promotions: {
    id: string
    type: string
    price: number
    duration: number
  }[]
}

export default function ModerationPage() {
  const [articles, setArticles] = useState<Article[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null)
  const [showDialog, setShowDialog] = useState(false)
  const [action, setAction] = useState<'APPROVE' | 'REJECT' | null>(null)
  const [notes, setNotes] = useState('')
  const [rejectionReason, setRejectionReason] = useState('')
  const [processing, setProcessing] = useState(false)

  useEffect(() => {
    fetchPendingArticles()
  }, [])

  const fetchPendingArticles = async () => {
    try {
      const response = await fetch('/api/moderation')
      if (!response.ok) {
        throw new Error('Erreur lors du chargement')
      }
      const data = await response.json()
      setArticles(data.articles)
    } catch (error) {
      console.error('Erreur:', error)
      toast.error('Erreur lors du chargement des articles')
    } finally {
      setLoading(false)
    }
  }

  const handleModerationAction = async () => {
    if (!selectedArticle || !action) return

    setProcessing(true)
    try {
      const response = await fetch('/api/moderation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          articleId: selectedArticle.id,
          action,
          notes,
          rejectionReason: action === 'REJECT' ? rejectionReason : undefined
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Erreur lors de la modération')
      }

      const result = await response.json()
      toast.success(result.message)
      
      // Retirer l'article de la liste
      setArticles(prev => prev.filter(article => article.id !== selectedArticle.id))
      
      // Fermer le dialog
      setShowDialog(false)
      setSelectedArticle(null)
      setAction(null)
      setNotes('')
      setRejectionReason('')
      
    } catch (error) {
      console.error('Erreur:', error)
      toast.error(error instanceof Error ? error.message : 'Une erreur est survenue')
    } finally {
      setProcessing(false)
    }
  }

  const openModerationDialog = (article: Article, moderationAction: 'APPROVE' | 'REJECT') => {
    setSelectedArticle(article)
    setAction(moderationAction)
    setShowDialog(true)
  }

  const getConditionBadge = (condition: string) => {
    const variants = {
      EXCELLENT: 'bg-green-100 text-green-800',
      GOOD: 'bg-blue-100 text-blue-800',
      FAIR: 'bg-yellow-100 text-yellow-800'
    }
    return variants[condition as keyof typeof variants] || 'bg-gray-100 text-gray-800'
  }

  const getPromotionBadge = (type: string) => {
    const labels = {
      FEATURED_HOMEPAGE: 'Page d\'accueil',
      BOOST_SEARCH: 'Boost recherche',
      HIGHLIGHT: 'Mise en avant',
      EXTENDED_VISIBILITY: 'Visibilité étendue'
    }
    return labels[type as keyof typeof labels] || type
  }

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <Clock className="h-8 w-8 animate-spin mx-auto mb-2" />
            <p>Chargement des articles en modération...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Modération des articles</h1>
        <p className="text-gray-600">
          {articles.length} article{articles.length !== 1 ? 's' : ''} en attente de modération
        </p>
      </div>

      {articles.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <CheckCircle className="h-12 w-12 text-green-500 mb-4" />
            <h3 className="text-lg font-semibold mb-2">Aucun article en attente</h3>
            <p className="text-gray-600 text-center">
              Tous les articles ont été modérés. Excellent travail !
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6">
          {articles.map((article) => (
            <Card key={article.id} className="overflow-hidden">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-xl mb-2">{article.title}</CardTitle>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <span>Par {article.seller.name}</span>
                      <span>•</span>
                      <span>{article.seller.email}</span>
                      <span>•</span>
                      <span>{new Date(article.createdAt).toLocaleDateString('fr-FR')}</span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      onClick={() => openModerationDialog(article, 'APPROVE')}
                      className="bg-green-600 hover:bg-green-700"
                      size="sm"
                    >
                      <CheckCircle className="h-4 w-4 mr-1" />
                      Approuver
                    </Button>
                    <Button
                      onClick={() => openModerationDialog(article, 'REJECT')}
                      variant="destructive"
                      size="sm"
                    >
                      <XCircle className="h-4 w-4 mr-1" />
                      Rejeter
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-6">
                  {/* Images */}
                  <div>
                    <h4 className="font-semibold mb-2">Images</h4>
                    <div className="grid grid-cols-2 gap-2">
                      {article.images.slice(0, 4).map((image, index) => (
                        <div key={index} className="relative aspect-square">
                          <Image
                            src={image}
                            alt={`${article.title} - Image ${index + 1}`}
                            fill
                            className="object-cover rounded-lg"
                          />
                        </div>
                      ))}
                    </div>
                    {article.images.length > 4 && (
                      <p className="text-sm text-gray-600 mt-2">
                        +{article.images.length - 4} image{article.images.length - 4 !== 1 ? 's' : ''} supplémentaire{article.images.length - 4 !== 1 ? 's' : ''}
                      </p>
                    )}
                  </div>

                  {/* Détails */}
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-semibold mb-2">Description</h4>
                      <p className="text-gray-700 text-sm">{article.description}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-sm font-medium">Prix</Label>
                        <p className="text-lg font-bold text-green-600">{article.price} FCFA</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium">État</Label>
                        <Badge className={getConditionBadge(article.condition)}>
                          {article.condition}
                        </Badge>
                      </div>
                      {article.size && (
                        <div>
                          <Label className="text-sm font-medium">Taille</Label>
                          <p>{article.size}</p>
                        </div>
                      )}
                      {article.brand && (
                        <div>
                          <Label className="text-sm font-medium">Marque</Label>
                          <p>{article.brand}</p>
                        </div>
                      )}
                      {article.color && (
                        <div>
                          <Label className="text-sm font-medium">Couleur</Label>
                          <p>{article.color}</p>
                        </div>
                      )}
                      <div>
                        <Label className="text-sm font-medium">Catégorie</Label>
                        <p>{article.category.name}</p>
                      </div>
                    </div>

                    {/* Informations de paiement */}
                    {article.payment && (
                      <div className="bg-blue-50 p-3 rounded-lg">
                        <h5 className="font-semibold mb-2 flex items-center">
                          <CreditCard className="h-4 w-4 mr-1" />
                          Paiement
                        </h5>
                        <div className="text-sm space-y-1">
                          <p><strong>Montant:</strong> {article.payment.amount} FCFA</p>
                          <p><strong>Méthode:</strong> {article.payment.method}</p>
                          <p><strong>Transaction ID:</strong> {article.payment.transactionId}</p>
                          <div className="flex items-center gap-2">
                            <span><strong>Statut:</strong></span>
                            <Badge className="bg-green-100 text-green-800">
                              {article.payment.status}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Promotions */}
                    {article.promotions.length > 0 && (
                      <div>
                        <h5 className="font-semibold mb-2">Promotions sélectionnées</h5>
                        <div className="space-y-1">
                          {article.promotions.map((promo) => (
                            <div key={promo.id} className="flex justify-between text-sm">
                              <span>{getPromotionBadge(promo.type)}</span>
                              <span>{promo.price} FCFA ({promo.duration} jours)</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Dialog de modération */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {action === 'APPROVE' ? 'Approuver l\'article' : 'Rejeter l\'article'}
            </DialogTitle>
            <DialogDescription>
              {action === 'APPROVE' 
                ? 'Cet article sera publié et visible par tous les utilisateurs.'
                : 'Cet article sera rejeté et ne sera pas publié.'
              }
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="notes">Notes de modération (optionnel)</Label>
              <Textarea
                id="notes"
                placeholder="Ajoutez des notes sur votre décision..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>
            
            {action === 'REJECT' && (
              <div>
                <Label htmlFor="rejection-reason">Raison du rejet</Label>
                <Textarea
                  id="rejection-reason"
                  placeholder="Expliquez pourquoi cet article est rejeté..."
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  required
                />
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowDialog(false)}
              disabled={processing}
            >
              Annuler
            </Button>
            <Button
              onClick={handleModerationAction}
              disabled={processing || (action === 'REJECT' && !rejectionReason.trim())}
              className={action === 'APPROVE' ? 'bg-green-600 hover:bg-green-700' : ''}
            >
              {processing ? 'Traitement...' : (action === 'APPROVE' ? 'Approuver' : 'Rejeter')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}