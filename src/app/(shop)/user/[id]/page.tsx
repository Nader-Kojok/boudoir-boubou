'use client'

import { useState, useEffect, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { ProductCard } from '@/components/custom/product-card'
import { Pagination } from '@/components/custom/pagination'
import { Calendar, Package, Star, User, Heart } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'

interface User {
  id: string
  name: string
  image?: string
  bannerImage?: string
  role: 'BUYER' | 'SELLER'
  createdAt: string
  _count: {
    articles: number
    reviews: number
    favorites: number
  }
  averageRating?: number
}

interface Article {
  id: string
  title: string
  description: string
  price: number
  images: string // JSON string of image URLs
  condition: 'EXCELLENT' | 'GOOD' | 'FAIR'
  isAvailable: boolean
  createdAt: string
  category: {
    id: string
    name: string
  }
  _count: {
    favorites: number
    reviews: number
  }
  averageRating?: number
}

export default function UserProfilePage() {
  const params = useParams()
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [articles, setArticles] = useState<Article[]>([])
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  const fetchUserData = useCallback(async (id: string) => {
    try {
      setLoading(true)
      const response = await fetch(`/api/users/${id}?page=${currentPage}&limit=12`)
      if (!response.ok) {
        throw new Error('Utilisateur non trouvé')
      }
      const data = await response.json()
      setUser(data.user)
      setArticles(data.articles)
      setTotalPages(data.pagination.totalPages)
    } catch (error) {
      console.error('Erreur lors du chargement de l\'utilisateur:', error)
      router.push('/catalogue')
    } finally {
      setLoading(false)
    }
  }, [currentPage, router])

  useEffect(() => {
    if (params.id) {
      fetchUserData(params.id as string)
    }
  }, [params.id, currentPage, fetchUserData])

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long'
    })
  }

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'SELLER':
        return 'Vendeur'
      case 'BUYER':
        return 'Acheteur'
      default:
        return 'Utilisateur'
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-12 max-w-6xl">
          <div className="animate-pulse space-y-8">
            {/* Banner skeleton */}
            <div className="h-64 bg-muted rounded-2xl"></div>
            
            {/* Profile info skeleton */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 -mt-16 relative z-10">
              <div className="h-32 w-32 bg-muted rounded-full border-4 border-background"></div>
              <div className="space-y-3 flex-1">
                <div className="h-8 w-64 bg-muted rounded"></div>
                <div className="h-5 w-32 bg-muted rounded"></div>
                <div className="h-4 w-48 bg-muted rounded"></div>
              </div>
            </div>
            
            {/* Stats skeleton */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-24 bg-muted rounded-xl"></div>
              ))}
            </div>
            
            {/* Articles skeleton */}
            <div className="space-y-6">
              <div className="h-8 w-48 bg-muted rounded"></div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="h-80 bg-muted rounded-xl"></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-6 max-w-md mx-auto px-4">
          <div className="w-24 h-24 mx-auto bg-muted rounded-full flex items-center justify-center">
            <User className="h-12 w-12 text-muted-foreground" />
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl font-semibold tracking-tight">Utilisateur non trouvé</h1>
            <p className="text-muted-foreground">
              L&apos;utilisateur que vous recherchez n&apos;existe pas ou n&apos;est plus disponible.
            </p>
          </div>
          <Button asChild variant="outline" className="mt-6">
            <Link href="/catalogue">Retour au catalogue</Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-12 max-w-6xl">
        <div className="space-y-12">
          {/* Banner Image */}
          <div className="relative h-64 md:h-80 rounded-2xl overflow-hidden bg-gradient-to-br from-primary/10 to-primary/5">
            {user.bannerImage ? (
              <Image
                src={user.bannerImage}
                alt={`Bannière de ${user.name}`}
                fill
                className="object-cover"
                priority
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center space-y-2">
                  <User className="h-16 w-16 mx-auto text-muted-foreground/50" />
                  <p className="text-muted-foreground/70 text-sm">Aucune image de bannière</p>
                </div>
              </div>
            )}
          </div>

          {/* Profile Header */}
          <div className="flex flex-col sm:flex-row items-start sm:items-end gap-6 -mt-20 relative z-10">
            <Avatar className="h-32 w-32 border-4 border-background shadow-xl">
              <AvatarImage src={user.image} alt={user.name} />
              <AvatarFallback className="text-3xl font-semibold bg-primary/10">
                {user.name.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1 space-y-3 bg-background/80 backdrop-blur-sm rounded-xl p-6 border">
              <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                 <h1 className="text-3xl font-bold tracking-tight">{user.name}</h1>
                 <Badge variant="secondary" className="w-fit">
                   {getRoleLabel(user.role)}
                 </Badge>
               </div>
              
              <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  <span>Membre depuis {formatDate(user.createdAt)}</span>
                </div>
                
                {user.role === 'SELLER' && user.averageRating && (
                  <div className="flex items-center gap-2">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <span className="font-medium text-foreground">{user.averageRating.toFixed(1)}</span>
                    <span>({user._count?.reviews || 0} avis)</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {user.role === 'SELLER' && (
              <Card className="border-0 shadow-sm bg-gradient-to-br from-blue-50 to-blue-100/50 dark:from-blue-950/50 dark:to-blue-900/30 flex flex-col h-full">
                <CardContent className="p-6 text-center flex-grow">
                  <div className="w-12 h-12 mx-auto mb-3 bg-blue-500/10 rounded-full flex items-center justify-center">
                    <Package className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div className="text-2xl font-bold text-blue-900 dark:text-blue-100">{user._count?.articles || 0}</div>
                  <div className="text-sm text-blue-700 dark:text-blue-300 font-medium">Articles en vente</div>
                </CardContent>
              </Card>
            )}
            
            <Card className="border-0 shadow-sm bg-gradient-to-br from-red-50 to-red-100/50 dark:from-red-950/50 dark:to-red-900/30 flex flex-col h-full">
              <CardContent className="p-6 text-center flex-grow">
                <div className="w-12 h-12 mx-auto mb-3 bg-red-500/10 rounded-full flex items-center justify-center">
                  <Heart className="h-6 w-6 text-red-600 dark:text-red-400" />
                </div>
                <div className="text-2xl font-bold text-red-900 dark:text-red-100">{user._count?.favorites || 0}</div>
                <div className="text-sm text-red-700 dark:text-red-300 font-medium">Favoris</div>
              </CardContent>
            </Card>
            
            <Card className="border-0 shadow-sm bg-gradient-to-br from-yellow-50 to-yellow-100/50 dark:from-yellow-950/50 dark:to-yellow-900/30 flex flex-col h-full">
              <CardContent className="p-6 text-center flex-grow">
                <div className="w-12 h-12 mx-auto mb-3 bg-yellow-500/10 rounded-full flex items-center justify-center">
                  <Star className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
                </div>
                <div className="text-2xl font-bold text-yellow-900 dark:text-yellow-100">{user._count?.reviews || 0}</div>
                <div className="text-sm text-yellow-700 dark:text-yellow-300 font-medium">Avis reçus</div>
              </CardContent>
            </Card>
            
            {user.averageRating && (
              <Card className="border-0 shadow-sm bg-gradient-to-br from-green-50 to-green-100/50 dark:from-green-950/50 dark:to-green-900/30 flex flex-col h-full">
                <CardContent className="p-6 text-center flex-grow">
                  <div className="w-12 h-12 mx-auto mb-3 bg-green-500/10 rounded-full flex items-center justify-center">
                    <Star className="h-6 w-6 text-green-600 dark:text-green-400 fill-current" />
                  </div>
                  <div className="text-2xl font-bold text-green-900 dark:text-green-100">{user.averageRating.toFixed(1)}</div>
                  <div className="text-sm text-green-700 dark:text-green-300 font-medium">Note moyenne</div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Articles Section - Only for sellers */}
          {user.role === 'SELLER' && (
            <div className="space-y-8">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-bold tracking-tight">Articles en vente</h2>
                  <p className="text-muted-foreground mt-1">
                    Découvrez les articles proposés par {user.name}
                  </p>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/50 px-3 py-2 rounded-full">
                  <Package className="h-4 w-4" />
                  <span>{articles.length} article{articles.length > 1 ? 's' : ''}</span>
                </div>
              </div>

              {articles.length > 0 ? (
                <div className="space-y-8">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {articles.map((article) => {
                      // Parse images JSON string to array
                      let parsedImages: string[] = []
                      try {
                        parsedImages = JSON.parse(article.images)
                      } catch {
                        parsedImages = []
                      }
                      
                      return (
                         <ProductCard
                           key={article.id}
                           id={article.id}
                           title={article.title}
                           price={article.price}
                           images={parsedImages}
                           condition={article.condition}
                           category={article.category.name}
                         />
                       )
                    })}
                  </div>

                  {totalPages > 1 && (
                    <div className="flex justify-center">
                      <Pagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onPageChange={setCurrentPage}
                      />
                    </div>
                  )}
                </div>
              ) : (
                <Card className="border-dashed border-2">
                  <CardContent className="p-12 text-center">
                    <div className="w-20 h-20 mx-auto mb-6 bg-muted rounded-full flex items-center justify-center">
                      <Package className="h-10 w-10 text-muted-foreground" />
                    </div>
                    <h3 className="text-xl font-semibold mb-2">Aucun article en vente</h3>
                    <p className="text-muted-foreground max-w-md mx-auto">
                      Ce vendeur n&apos;a pas encore d&apos;articles disponibles. Revenez plus tard pour découvrir ses nouveautés.
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          {/* For buyers, show a different message */}
          {user.role === 'BUYER' && (
            <Card className="border-dashed border-2">
              <CardContent className="p-12 text-center">
                <div className="w-20 h-20 mx-auto mb-6 bg-primary/10 rounded-full flex items-center justify-center">
                  <User className="h-10 w-10 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Profil d&apos;acheteur</h3>
                <p className="text-muted-foreground max-w-md mx-auto">
                  {user.name} est un membre de la communauté Boudoir. Découvrez ses articles favoris et ses avis.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}