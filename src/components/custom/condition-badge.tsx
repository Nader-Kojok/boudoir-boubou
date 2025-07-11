import * as React from "react"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { ThumbsUp, Minus, AlertTriangle } from "lucide-react"

export type ConditionType = "EXCELLENT" | "GOOD" | "FAIR"

export interface ConditionBadgeProps {
  condition: ConditionType
  showIcon?: boolean
  size?: "sm" | "md" | "lg"
  className?: string
}

const conditionConfig = {
  EXCELLENT: {
    label: "Excellent",
    icon: ThumbsUp,
    variant: "secondary" as const,
    className: "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900 dark:text-blue-200 dark:border-blue-800",
  },
  GOOD: {
    label: "Bon état",
    icon: Minus,
    variant: "outline" as const,
    className: "bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900 dark:text-yellow-200 dark:border-yellow-800",
  },
  FAIR: {
    label: "État correct",
    icon: AlertTriangle,
    variant: "outline" as const,
    className: "bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-900 dark:text-orange-200 dark:border-orange-800",
  },
}

const sizeClasses = {
  sm: "text-xs px-1.5 py-0.5 [&>svg]:size-2.5",
  md: "text-xs px-2 py-0.5 [&>svg]:size-3",
  lg: "text-sm px-2.5 py-1 [&>svg]:size-3.5",
}

export function ConditionBadge({
  condition,
  showIcon = true,
  size = "md",
  className,
}: ConditionBadgeProps) {
  const config = conditionConfig[condition]
  const Icon = config.icon

  return (
    <Badge
      variant={config.variant}
      className={cn(
        config.className,
        sizeClasses[size],
        "font-medium inline-flex items-center gap-1",
        className
      )}
    >
      {showIcon && <Icon className="shrink-0" />}
      {config.label}
    </Badge>
  )
}

export default ConditionBadge