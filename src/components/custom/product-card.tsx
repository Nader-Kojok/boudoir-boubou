import * as React from "react"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Heart, Phone } from "lucide-react"
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
  className?: string
  sellerWhatsApp?: string
  sellerName?: string
  onFavoriteToggle?: (id: string) => void
  onWhatsAppContact?: (id: string, sellerWhatsApp: string, title: string) => void
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
  className,
  sellerWhatsApp,
  onFavoriteToggle,
  onWhatsAppContact,
  onClick,
}: ProductCardProps) {
  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    onFavoriteToggle?.(id)
  }

  const handleWhatsAppClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (sellerWhatsApp) {
      onWhatsAppContact?.(id, sellerWhatsApp, title)
    }
  }

  const handleCardClick = () => {
    onClick?.(id)
  }

  return (
    <Card 
      className={cn(
        "group cursor-pointer transition-all duration-200 hover:shadow-lg hover:-translate-y-1 py-0 gap-0 flex flex-col h-full",
        className
      )}
      onClick={handleCardClick}
    >
      <CardHeader className="p-0 px-0 relative">
        <div className="relative aspect-square overflow-hidden rounded-t-xl">
          <div className="w-full h-full overflow-hidden rounded-t-xl">
            <ImageGallery 
              images={images} 
              alt={title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 space-y-0"
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
      
      <CardContent className="p-4 flex-grow">
        <div className="space-y-2 h-full flex flex-col">
          <h3 className="font-semibold text-lg line-clamp-2 group-hover:text-primary transition-colors">
            {title}
          </h3>
          
          {description && (
            <p className="text-sm text-muted-foreground line-clamp-2 flex-grow">
              {description}
            </p>
          )}
          
          <PriceDisplay 
            price={price} 
            originalPrice={originalPrice}
            className="text-lg font-bold mt-auto"
          />
        </div>
      </CardContent>
      
      <CardFooter className="p-4 pt-0">
        <Button 
          className="w-full"
          onClick={handleWhatsAppClick}
          disabled={!sellerWhatsApp}
        >
          <Phone className="h-4 w-4 mr-2" />
          Contacter le vendeur
        </Button>
      </CardFooter>
    </Card>
  )
}

export default ProductCard