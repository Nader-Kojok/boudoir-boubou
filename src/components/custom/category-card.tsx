import * as React from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { ChevronRight } from "lucide-react"
import Image from "next/image"

export interface CategoryCardProps {
  id: string
  name: string
  description?: string
  image: string
  productCount?: number
  isActive?: boolean
  className?: string
  onClick?: (id: string) => void
}

export function CategoryCard({
  id,
  name,
  description,
  image,
  productCount,
  isActive = false,
  className,
  onClick,
}: CategoryCardProps) {
  const handleClick = () => {
    onClick?.(id)
  }

  return (
    <Card 
      className={cn(
        "group cursor-pointer transition-all duration-200 hover:shadow-lg hover:-translate-y-1 overflow-hidden p-0",
        isActive && "ring-2 ring-primary",
        className
      )}
      onClick={handleClick}
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-gray-100">
        <Image 
          src={image} 
          alt={name}
          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-300"
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
        
        {/* Overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        
        {/* Product count badge */}
        {productCount !== undefined && (
          <div className="absolute top-3 right-3">
            <Badge variant="secondary" className="bg-white/90 text-black">
              {productCount} {productCount === 1 ? "article" : "articles"}
            </Badge>
          </div>
        )}
        
        {/* Content overlay */}
        <CardContent className="absolute bottom-0 left-0 right-0 p-4 text-white">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <h3 className="font-semibold text-lg mb-1 group-hover:text-primary-foreground transition-colors">
                {name}
              </h3>
              
              {description && (
                <p className="text-sm text-white/80 line-clamp-2">
                  {description}
                </p>
              )}
            </div>
            
            <ChevronRight className="h-5 w-5 ml-2 group-hover:translate-x-1 transition-transform" />
          </div>
        </CardContent>
      </div>
    </Card>
  )
}

export default CategoryCard