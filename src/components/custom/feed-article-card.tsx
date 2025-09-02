import * as React from "react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"
import { PriceDisplay } from "./price-display"
import { ConditionBadge, type ConditionType } from "./condition-badge"
import { ImageGallery } from "./image-gallery"
import Link from "next/link"
import { formatDistanceToNow } from "date-fns"
import { fr } from "date-fns/locale"

export interface FeedArticleCardProps {
  id: string
  title: string
  description?: string
  price: number
  condition: ConditionType
  images: string[]
  category?: {
    name: string
    slug: string
  }
  seller: {
    id: string
    name: string
    image?: string
  }
  createdAt: string
  className?: string
  onClick?: (id: string) => void
}

export function FeedArticleCard({
  id,
  title,
  description,
  price,
  condition,
  images,
  category,
  seller,
  createdAt,
  className,
  onClick,
}: FeedArticleCardProps) {
  const handleCardClick = () => {
    onClick?.(id)
  }

  const timeAgo = formatDistanceToNow(new Date(createdAt), {
    addSuffix: true,
    locale: fr
  })

  return (
    <Card 
      className={cn(
        "group cursor-pointer transition-all duration-200 hover:shadow-md border-l-4 border-l-primary/20 hover:border-l-primary",
        className
      )}
      onClick={handleCardClick}
    >
      {/* Header avec info vendeur */}
      <CardHeader className="pb-3">
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10">
            <AvatarImage src={seller.image} alt={seller.name} />
            <AvatarFallback>{seller.name.charAt(0).toUpperCase()}</AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <Link 
                href={`/user/${seller.id}`}
                className="font-semibold text-sm hover:text-primary transition-colors"
                onClick={(e) => e.stopPropagation()}
              >
                {seller.name}
              </Link>
              <span className="text-xs text-muted-foreground">a publié un nouvel article</span>
            </div>
            <p className="text-xs text-muted-foreground">{timeAgo}</p>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Image */}
          <div className="md:col-span-1">
            <div className="relative aspect-square overflow-hidden rounded-lg">
              <ImageGallery 
                images={images} 
                alt={title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              
              {/* Condition badge */}
              <div className="absolute top-2 left-2">
                <ConditionBadge condition={condition} />
              </div>
              
              {/* Category badge */}
              {category && (
                <div className="absolute bottom-2 left-2">
                  <Badge variant="secondary" className="bg-background/90 text-foreground text-xs">
                    {category.name}
                  </Badge>
                </div>
              )}
            </div>
          </div>
          
          {/* Contenu */}
          <div className="md:col-span-2 space-y-3">
            <div>
              <h3 className="font-semibold text-lg line-clamp-2 group-hover:text-primary transition-colors">
                {title}
              </h3>
              
              {description && (
                <p className="text-sm text-muted-foreground line-clamp-3 mt-2">
                  {description}
                </p>
              )}
            </div>
            
            <div className="flex items-center justify-between">
              <PriceDisplay 
                price={price}
                className="text-xl font-bold text-primary"
              />
              
              <Link
                href={`/article/${id}`}
                className="text-sm text-primary hover:text-primary/80 font-medium transition-colors"
                onClick={(e) => e.stopPropagation()}
              >
                Voir l'article →
              </Link>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default FeedArticleCard