import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'
import { cn } from '@/lib/utils'

interface MetricCardProps {
  title: string
  value: string | number
  description?: string
  trend?: {
    value: number
    label: string
    direction: 'up' | 'down' | 'neutral'
  }
  icon?: React.ReactNode
  className?: string
  format?: 'number' | 'currency' | 'percentage'
}

export function MetricCard({
  title,
  value,
  description,
  trend,
  icon,
  className,
  format = 'number'
}: MetricCardProps) {
  const formatValue = (val: string | number) => {
    const numValue = typeof val === 'string' ? parseFloat(val) : val
    
    switch (format) {
      case 'currency':
        return new Intl.NumberFormat('fr-FR', {
          style: 'currency',
          currency: 'XOF',
          minimumFractionDigits: 0
        }).format(numValue)
      case 'percentage':
        return `${numValue.toFixed(1)}%`
      case 'number':
      default:
        return new Intl.NumberFormat('fr-FR').format(numValue)
    }
  }

  const getTrendIcon = () => {
    if (!trend) return null
    
    switch (trend.direction) {
      case 'up':
        return <TrendingUp className="h-4 w-4" />
      case 'down':
        return <TrendingDown className="h-4 w-4" />
      case 'neutral':
      default:
        return <Minus className="h-4 w-4" />
    }
  }

  const getTrendColor = () => {
    if (!trend) return ''
    
    switch (trend.direction) {
      case 'up':
        return 'text-green-600 bg-green-50'
      case 'down':
        return 'text-red-600 bg-red-50'
      case 'neutral':
      default:
        return 'text-gray-600 bg-gray-50'
    }
  }

  return (
    <Card className={cn('transition-all hover:shadow-md', className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        {icon && (
          <div className="text-muted-foreground">
            {icon}
          </div>
        )}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold mb-1">
          {formatValue(value)}
        </div>
        
        <div className="flex items-center justify-between">
          {description && (
            <p className="text-xs text-muted-foreground">
              {description}
            </p>
          )}
          
          {trend && (
            <Badge 
              variant="secondary" 
              className={cn(
                'flex items-center gap-1 text-xs',
                getTrendColor()
              )}
            >
              {getTrendIcon()}
              <span>{trend.value > 0 ? '+' : ''}{trend.value}%</span>
              <span className="hidden sm:inline">{trend.label}</span>
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  )
}