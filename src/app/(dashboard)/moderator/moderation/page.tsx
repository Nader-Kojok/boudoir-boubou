'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { CheckCircle, XCircle, Clock, User, Tag, MapPin } from 'lucide-react'
import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import Image from 'next/image'

interface Article {
  id: string
  title: string
  description: string
  price: number
  images: string
  size?: string
  condition?: string
  brand?: string
  color?: string
  createdAt: Date
  seller: {
    id: string
    name: string
    image?: string
    phone: string
    location?: string
  }
  category: {
    name: string
  }
}

export default function ModeratorModerationPage() {
  const [articles, setArticles] = useState<Article[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null)
  const [showDialog, setShowDialog] = useState(false)
  const [action, setAction] = useState<'APPROVE' | 'REJECT' | null>(null)
  const [notes, setNotes] = useState('')
  const [rejectionReason, setRejectionReason] = useState('')
  const [processing, setProcessing] = useState(false)
  const [imageModalOpen, setImageModalOpen] = useState(false)
  const [selectedImage, setSelectedImage] = useState<string | null>(null)

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

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF',
      minimumFractionDigits: 0
    }).format(price)
  }

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(date))
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Modération des Articles</h1>
            <p className="text-muted-foreground">
              Examinez et modérez les articles en attente de validation
            </p>
          </div>
        </div>
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4 animate-spin" />
            <p className="text-muted-foreground">Chargement des articles...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Modération des Articles</h1>
          <p className="text-muted-foreground">
            Examinez et modérez les articles en attente de validation
          </p>
        </div>
        <Badge variant="outline" className="flex items-center gap-2">
          <Clock className="h-4 w-4" />
          {articles?.length || 0} articles en attente
        </Badge>
      </div>

      {/* Liste des articles en attente */}
      {!articles || articles.length === 0 ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Aucun article en attente</h3>
            <p className="text-muted-foreground">
              Tous les articles ont été modérés. Revenez plus tard pour de nouveaux articles.
            </p>
          </div>
        </div>
      ) : (
        <div className="grid gap-6">
          {articles.map((article) => {
            // Debug: Log the raw images data
            console.log('Article images raw:', article.images, typeof article.images)
            
            let images: string[] = []
            
            // Check if images is already an array (from API JSON.parse)
            if (Array.isArray(article.images)) {
              images = article.images
            } else {
              // Try to parse if it's a string
              try {
                images = article.images ? JSON.parse(article.images) : []
              } catch {
                // If images is not valid JSON (e.g., a single data URL), treat it as a single image
                images = article.images ? [article.images] : []
              }
            }
            
            console.log('Processed images:', images)
            const firstImage = images[0] && typeof images[0] === 'string' && images[0].trim() !== '' ? images[0] : null
            console.log('First image:', firstImage)

            return (
              <Card key={article.id} className="overflow-hidden">
                <CardContent className="p-6">
                  <div className="flex gap-6">
                    {/* Image de l'article */}
                    <div className="flex-shrink-0">
                      {firstImage ? (
                        <div 
                          className="relative w-32 h-32 rounded-lg overflow-hidden cursor-pointer hover:ring-2 hover:ring-primary hover:ring-offset-2 transition-all"
                          onClick={() => {
                            setSelectedImage(firstImage)
                            setImageModalOpen(true)
                          }}
                          title="Cliquer pour agrandir l'image"
                        >
                          <Image
                            src={firstImage}
                            alt={article.title}
                            fill
                            className="object-cover"
                          />
                        </div>
                      ) : (
                        <div className="w-32 h-32 bg-muted rounded-lg flex items-center justify-center">
                          <Tag className="h-8 w-8 text-muted-foreground" />
                        </div>
                      )}
                    </div>

                    {/* Informations de l'article */}
                    <div className="flex-1 space-y-4">
                      <div>
                        <div className="flex items-start justify-between mb-2">
                          <h3 className="text-xl font-semibold">{article.title}</h3>
                          <Badge variant="secondary">{article.category.name}</Badge>
                        </div>
                        <p className="text-muted-foreground line-clamp-2">
                          {article.description}
                        </p>
                      </div>

                      {/* Prix et détails */}
                      <div className="flex items-center gap-4 text-sm">
                        <span className="text-2xl font-bold text-primary">
                          {formatPrice(article.price)}
                        </span>
                        {article.size && (
                          <Badge variant="outline">Taille: {article.size}</Badge>
                        )}
                        {article.condition && (
                          <Badge variant="outline">État: {article.condition}</Badge>
                        )}
                        {article.brand && (
                          <Badge variant="outline">Marque: {article.brand}</Badge>
                        )}
                        {article.color && (
                          <Badge variant="outline">Couleur: {article.color}</Badge>
                        )}
                      </div>

                      {/* Informations du vendeur */}
                      <div className="flex items-center gap-4 p-3 bg-muted/50 rounded-lg">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={article.seller.image || undefined} />
                          <AvatarFallback>
                            <User className="h-5 w-5" />
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{article.seller.name}</span>
                            <span className="text-sm text-muted-foreground">
                              {article.seller.phone}
                            </span>
                          </div>
                          {article.seller.location && (
                            <div className="flex items-center gap-1 text-sm text-muted-foreground">
                              <MapPin className="h-3 w-3" />
                              {article.seller.location}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Date de soumission et actions */}
                      <div className="flex items-center justify-between pt-2">
                        <span className="text-sm text-muted-foreground">
                          Soumis le {formatDate(article.createdAt)}
                        </span>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openModerationDialog(article, 'REJECT')}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <XCircle className="h-4 w-4 mr-1" />
                            Rejeter
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openModerationDialog(article, 'APPROVE')}
                            className="text-green-600 hover:text-green-700 hover:bg-green-50"
                          >
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Approuver
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      {/* Dialog de modération */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {action === 'APPROVE' ? 'Approuver l&apos;article' : 'Rejeter l&apos;article'}
            </DialogTitle>
            <DialogDescription>
              {action === 'APPROVE' 
                ? 'Êtes-vous sûr de vouloir approuver cet article ? Il sera publié et visible par tous les utilisateurs.'
                : 'Êtes-vous sûr de vouloir rejeter cet article ? Le vendeur sera notifié du rejet.'
              }
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            {action === 'REJECT' && (
              <div className="space-y-2">
                <Label htmlFor="rejectionReason">Raison du rejet *</Label>
                <Textarea
                  id="rejectionReason"
                  placeholder="Expliquez pourquoi cet article est rejeté..."
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  required
                />
              </div>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="notes">Notes (optionnel)</Label>
              <Textarea
                id="notes"
                placeholder="Ajoutez des notes internes..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>
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
              variant={action === 'APPROVE' ? 'default' : 'destructive'}
            >
              {processing ? 'Traitement...' : (action === 'APPROVE' ? 'Approuver' : 'Rejeter')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal pour afficher l'image en grand */}
      {imageModalOpen && selectedImage && (
        <Dialog open={imageModalOpen} onOpenChange={setImageModalOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] p-0">
            <DialogHeader className="p-6 pb-0">
              <DialogTitle>Image de l&apos;article</DialogTitle>
            </DialogHeader>
            <div className="p-6 pt-0">
              <div className="relative w-full h-[70vh] rounded-lg overflow-hidden">
                <Image
                  src={selectedImage}
                  alt="Image de l'article"
                  fill
                  className="object-contain"
                />
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}