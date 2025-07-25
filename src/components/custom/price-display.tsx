import * as React from "react"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"

export interface PriceDisplayProps {
  price: number
  originalPrice?: number
  currency?: string
  locale?: string
  showDiscount?: boolean
  discountFormat?: "percentage" | "amount"
  size?: "sm" | "md" | "lg"
  className?: string
}

const sizeClasses = {
  sm: {
    price: "text-sm font-semibold",
    original: "text-xs",
    discount: "text-xs",
  },
  md: {
    price: "text-base font-semibold",
    original: "text-sm",
    discount: "text-xs",
  },
  lg: {
    price: "text-lg font-bold",
    original: "text-base",
    discount: "text-sm",
  },
}

export function PriceDisplay({
  price,
  originalPrice,
  currency = "XOF",
  locale = "fr-FR",
  showDiscount = true,
  discountFormat = "percentage",
  size = "md",
  className,
}: PriceDisplayProps) {
  const formatPrice = (amount: number) => {
    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency,
    }).format(amount)
  }

  const hasDiscount = originalPrice && originalPrice > price
  const discountAmount = hasDiscount ? originalPrice - price : 0
  const discountPercentage = hasDiscount ? Math.round((discountAmount / originalPrice) * 100) : 0

  const classes = sizeClasses[size]

  return (
    <div className={cn("flex items-center gap-2 flex-wrap", className)}>
      {/* Current price */}
      <span className={cn(
        classes.price,
        hasDiscount ? "text-red-600 dark:text-red-400" : "text-foreground"
      )}>
        {formatPrice(price)}
      </span>
      
      {/* Original price (crossed out) */}
      {hasDiscount && (
        <span className={cn(
          classes.original,
          "text-muted-foreground line-through"
        )}>
          {formatPrice(originalPrice)}
        </span>
      )}
      
      {/* Discount badge */}
      {hasDiscount && showDiscount && (
        <Badge 
          variant="destructive" 
          className={cn(classes.discount, "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200")}
        >
          {discountFormat === "percentage" 
            ? `-${discountPercentage}%`
            : `-${formatPrice(discountAmount)}`
          }
        </Badge>
      )}
    </div>
  )
}

export default PriceDisplay