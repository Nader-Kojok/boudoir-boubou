'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { ReportButton } from '@/components/ui/report-button'
import { Star } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useSession } from 'next-auth/react'
import Link from 'next/link'

interface Review {
  id: string
  rating: number
  comment?: string
  createdAt: string
  reviewer: {
    id: string
    name: string
    image?: string
  }
}

interface ReviewSectionProps {
  articleId: string
  reviews: Review[]
  averageRating?: number
  totalReviews: number
}

export function ReviewSection({
  articleId,
  reviews,
  averageRating = 0,
  totalReviews
}: ReviewSectionProps) {
  const { data: session } = useSession()
  const [showReviewForm, setShowReviewForm] = useState(false)
  const [newRating, setNewRating] = useState(0)
  const [newComment, setNewComment] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [localReviews, setLocalReviews] = useState(reviews)

  const handleSubmitReview = async () => {
    if (!session || newRating === 0) return

    try {
      setIsSubmitting(true)
      const response = await fetch(`/api/articles/${articleId}/reviews`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          rating: newRating,
          comment: newComment.trim() || undefined,
        }),
      })

      if (response.ok) {
        const newReview = await response.json()
        setLocalReviews([newReview, ...localReviews])
        setNewRating(0)
        setNewComment('')
        setShowReviewForm(false)
      }
    } catch (error) {
      console.error('Erreur lors de l\'ajout de l\'avis:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const renderStars = (rating: number, interactive = false, onStarClick?: (rating: number) => void) => {
    return (
      <div className="flex items-center space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            className={cn(
              "transition-colors",
              interactive && "hover:text-yellow-400 cursor-pointer",
              !interactive && "cursor-default"
            )}
            onClick={() => interactive && onStarClick?.(star)}
            disabled={!interactive}
          >
            <Star
              className={cn(
                "h-5 w-5",
                star <= rating
                  ? "text-yellow-400 fill-current"
                  : "text-muted-foreground"
              )}
            />
          </button>
        ))}
      </div>
    )
  }

  const getRatingDistribution = () => {
    const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
    localReviews.forEach(review => {
      distribution[review.rating as keyof typeof distribution]++
    })
    return distribution
  }

  const distribution = getRatingDistribution()

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2">
            <Star className="h-5 w-5" />
            <span>Avis ({totalReviews})</span>
          </CardTitle>
          {session && (
            <Button
              variant="outline"
              onClick={() => setShowReviewForm(!showReviewForm)}
            >
              Laisser un avis
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Résumé des avis */}
        {totalReviews > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Note moyenne */}
            <div className="text-center space-y-2">
              <div className="text-4xl font-bold">{averageRating.toFixed(1)}</div>
              <div className="flex justify-center">
                {renderStars(Math.floor(averageRating))}
              </div>
              <div className="text-sm text-muted-foreground">
                Basé sur {totalReviews} avis
              </div>
            </div>

            {/* Distribution des notes */}
            <div className="space-y-2">
              {[5, 4, 3, 2, 1].map((rating) => (
                <div key={rating} className="flex items-center space-x-2">
                  <span className="text-sm w-8">{rating}</span>
                  <Star className="h-4 w-4 text-yellow-400 fill-current" />
                  <div className="flex-1 bg-muted rounded-full h-2">
                    <div
                      className="bg-yellow-400 h-2 rounded-full transition-all"
                      style={{
                        width: `${totalReviews > 0 ? (distribution[rating as keyof typeof distribution] / totalReviews) * 100 : 0}%`
                      }}
                    />
                  </div>
                  <span className="text-sm text-muted-foreground w-8">
                    {distribution[rating as keyof typeof distribution]}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Formulaire d'ajout d'avis */}
        {showReviewForm && (
          <Card>
            <CardContent className="pt-6 space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">
                  Votre note *
                </label>
                {renderStars(newRating, true, setNewRating)}
              </div>
              
              <div>
                <label className="text-sm font-medium mb-2 block">
                  Votre commentaire (optionnel)
                </label>
                <Textarea
                  placeholder="Partagez votre expérience avec cet article..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  rows={4}
                />
              </div>

              <div className="flex space-x-2">
                <Button
                  onClick={handleSubmitReview}
                  disabled={newRating === 0 || isSubmitting}
                >
                  {isSubmitting ? 'Publication...' : 'Publier l&apos;avis'}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowReviewForm(false)
                    setNewRating(0)
                    setNewComment('')
                  }}
                >
                  Annuler
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Message de connexion */}
        {!session && (
          <div className="text-center py-8 text-muted-foreground">
            <p className="mb-4">Connectez-vous pour laisser un avis</p>
            <Button variant="outline" asChild>
              <Link href="/login">Se connecter</Link>
            </Button>
          </div>
        )}

        {/* Liste des avis */}
        {localReviews.length > 0 ? (
          <div className="space-y-4">
            <h4 className="font-semibold">Tous les avis</h4>
            {localReviews.map((review) => (
              <Card key={review.id}>
                <CardContent className="pt-6">
                  <div className="flex items-start space-x-4">
                    <Avatar>
                      <AvatarImage src={review.reviewer.image} />
                      <AvatarFallback>
                        {review.reviewer.name?.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center justify-between">
                        <div>
                          <h5 className="font-medium">{review.reviewer.name}</h5>
                          <div className="flex items-center space-x-2">
                            {renderStars(review.rating)}
                            <span className="text-sm text-muted-foreground">
                              {new Date(review.createdAt).toLocaleDateString('fr-FR')}
                            </span>
                          </div>
                        </div>
                        <ReportButton
                          type="REVIEW"
                          targetId={review.id}
                          variant="ghost"
                          size="sm"
                        />
                      </div>
                      {review.comment && (
                        <p className="text-muted-foreground">{review.comment}</p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          totalReviews === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <Star className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Aucun avis pour le moment</p>
              <p className="text-sm">Soyez le premier à laisser un avis !</p>
            </div>
          )
        )}
      </CardContent>
    </Card>
  )
}