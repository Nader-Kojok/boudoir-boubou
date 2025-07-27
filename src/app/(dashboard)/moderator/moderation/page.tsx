import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Eye, Clock, User, Tag, MapPin } from 'lucide-react'
import { getSession } from '@/lib/auth-utils'
import { redirect } from 'next/navigation'
import { safeDbOperation } from '@/lib/db-connection'
import { prisma } from '@/lib/db'
import Link from 'next/link'
import Image from 'next/image'

export default async function ModeratorModerationPage() {
  const session = await getSession()
  
  if (!session || session.user?.role !== 'MODERATOR') {
    redirect('/dashboard')
  }

  // Récupérer les articles en attente de modération
  const pendingArticles = await safeDbOperation(
    async () => {
      return await prisma.article.findMany({
        where: {
          status: 'PENDING_MODERATION'
        },
        include: {
          seller: {
            select: {
              id: true,
              name: true,
              image: true,
              phone: true,
              location: true
            }
          },
          category: {
            select: {
              name: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        }
      })
    },
    'moderator-pending-articles'
  )

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
          {pendingArticles?.length || 0} articles en attente
        </Badge>
      </div>

      {/* Liste des articles en attente */}
      {!pendingArticles || pendingArticles.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Clock className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Aucun article en attente</h3>
            <p className="text-muted-foreground text-center">
              Tous les articles ont été modérés. Revenez plus tard pour de nouveaux articles à examiner.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6">
          {pendingArticles.map((article) => {
            const images = article.images ? JSON.parse(article.images) : []
            const firstImage = images[0] || null
            
            return (
              <Card key={article.id} className="overflow-hidden">
                <CardContent className="p-6">
                  <div className="flex gap-6">
                    {/* Image de l'article */}
                    <div className="flex-shrink-0">
                      {firstImage ? (
                        <div className="relative w-32 h-32 rounded-lg overflow-hidden bg-gray-100">
                          <Image
                            src={firstImage}
                            alt={article.title}
                            fill
                            className="object-cover"
                          />
                        </div>
                      ) : (
                        <div className="w-32 h-32 rounded-lg bg-gray-100 flex items-center justify-center">
                          <Tag className="h-8 w-8 text-gray-400" />
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
                        <p className="text-muted-foreground line-clamp-2">{article.description}</p>
                      </div>
                      
                      <div className="flex items-center gap-6 text-sm text-muted-foreground">
                        <span className="font-semibold text-lg text-foreground">
                          {formatPrice(article.price)}
                        </span>
                        {article.size && (
                          <span>Taille: {article.size}</span>
                        )}
                        {article.condition && (
                          <span>État: {article.condition}</span>
                        )}
                        {article.brand && (
                          <span>Marque: {article.brand}</span>
                        )}
                        {article.color && (
                          <span>Couleur: {article.color}</span>
                        )}
                      </div>
                      
                      {/* Informations du vendeur */}
                      <div className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={article.seller.image || ''} />
                          <AvatarFallback>
                            <User className="h-4 w-4" />
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <p className="font-medium">{article.seller.name}</p>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span>{article.seller.phone}</span>
                            {article.seller.location && (
                              <span className="flex items-center gap-1">
                                <MapPin className="h-3 w-3" />
                                {article.seller.location}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between pt-2">
                        <span className="text-sm text-muted-foreground">
                          Soumis le {formatDate(article.createdAt)}
                        </span>
                        
                        <div className="flex items-center gap-2">
                          <Button variant="outline" size="sm" asChild>
                            <Link href={`/moderator/moderation/${article.id}`}>
                              <Eye className="h-4 w-4 mr-2" />
                              Examiner
                            </Link>
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
    </div>
  )
}