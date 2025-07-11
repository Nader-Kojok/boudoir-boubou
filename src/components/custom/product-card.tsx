import * as React from "react"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Heart, ShoppingCart } from "lucide-react"
import { cn } from "@/lib/utils"
import { PriceDisplay } from "./price-display"
import { ConditionBadge, type ConditionType } from "./condition-badge"
import { ImageGallery } from "./image-gallery"

export interface ProductCardProps {
  id: string
  title: string
  description?: string
  price: number
  originalPrice?: number
  condition: ConditionType
  images: string[]
  category?: string
  isFavorite?: boolean
  isInCart?: boolean
  className?: string
  onFavoriteToggle?: (id: string) => void
  onAddToCart?: (id: string) => void
  onClick?: (id: string) => void
}

export function ProductCard({
  id,
  title,
  description,
  price,
  originalPrice,
  condition,
  images,
  category,
  isFavorite = false,
  isInCart = false,
  className,
  onFavoriteToggle,
  onAddToCart,
  onClick,
}: ProductCardProps) {
  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    onFavoriteToggle?.(id)
  }

  const handleAddToCartClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    onAddToCart?.(id)
  }

  const handleCardClick = () => {
    onClick?.(id)
  }

  return (
    <Card 
      className={cn(
        "group cursor-pointer transition-all duration-200 hover:shadow-lg hover:-translate-y-1 py-0",
        className
      )}
      onClick={handleCardClick}
    >
      <CardHeader className="p-0 relative">
        <div className="relative aspect-square overflow-hidden rounded-t-xl">
          <div className="w-full h-full overflow-hidden rounded-t-xl">
            <ImageGallery 
              images={images} 
              alt={title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          </div>
          
          {/* Favorite button */}
          <Button
            variant="ghost"
            size="icon"
            className={cn(
              "absolute top-2 right-2 bg-white/80 backdrop-blur-sm hover:bg-white",
              isFavorite && "text-red-500"
            )}
            onClick={handleFavoriteClick}
          >
            <Heart className={cn("h-4 w-4", isFavorite && "fill-current")} />
          </Button>
          
          {/* Condition badge */}
          <div className="absolute top-2 left-2">
            <ConditionBadge condition={condition} />
          </div>
          
          {/* Category badge */}
          {category && (
            <div className="absolute bottom-2 left-2">
              <Badge variant="secondary" className="bg-white/90 text-black">
                {category}
              </Badge>
            </div>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="p-4">
        <div className="space-y-2">
          <h3 className="font-semibold text-lg line-clamp-2 group-hover:text-primary transition-colors">
            {title}
          </h3>
          
          {description && (
            <p className="text-sm text-muted-foreground line-clamp-2">
              {description}
            </p>
          )}
          
          <PriceDisplay 
            price={price} 
            originalPrice={originalPrice}
            className="text-lg font-bold"
          />
        </div>
      </CardContent>
      
      <CardFooter className="p-4 pt-0">
        <Button 
          className="w-full"
          variant={isInCart ? "secondary" : "default"}
          onClick={handleAddToCartClick}
        >
          <ShoppingCart className="h-4 w-4 mr-2" />
          {isInCart ? "Dans le panier" : "Ajouter au panier"}
        </Button>
      </CardFooter>
    </Card>
  )
}

export default ProductCard