'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Download } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ChartContainerProps {
  title: string
  description?: string
  children: React.ReactNode
  className?: string
  onExport?: () => void
  filters?: {
    period?: {
      value: string
      onChange: (value: string) => void
      options: { label: string; value: string }[]
    }
    type?: {
      value: string
      onChange: (value: string) => void
      options: { label: string; value: string }[]
    }
  }
  actions?: React.ReactNode
}

export function ChartContainer({
  title,
  description,
  children,
  className,
  onExport,
  filters,
  actions
}: ChartContainerProps) {
  return (
    <Card className={cn('w-full', className)}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <CardTitle className="text-lg font-semibold">{title}</CardTitle>
            {description && (
              <p className="text-sm text-muted-foreground">{description}</p>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            {/* Filtres */}
            {filters?.period && (
              <Select 
                value={filters.period.value} 
                onValueChange={filters.period.onChange}
              >
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {filters.period.options.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
            
            {filters?.type && (
              <Select 
                value={filters.type.value} 
                onValueChange={filters.type.onChange}
              >
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {filters.type.options.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
            
            {/* Actions personnalisées */}
            {actions}
            
            {/* Bouton d'export */}
            {onExport && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={onExport}
                className="flex items-center gap-2"
              >
                <Download className="h-4 w-4" />
                <span className="hidden sm:inline">Exporter</span>
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="w-full h-[300px] sm:h-[400px]">
          {children}
        </div>
      </CardContent>
    </Card>
  )
}

// Composant de graphique simple avec placeholder
export function SimpleChart({ 
  data, 
  type = 'line',
  className 
}: { 
  data: Record<string, unknown>[]
  type?: 'line' | 'bar' | 'area'
  className?: string 
}) {
  const config: Record<string, { label: string; color: string }> = {
    line: { label: 'Ligne', color: '#3b82f6' },
    bar: { label: 'Barres', color: '#10b981' },
    area: { label: 'Zone', color: '#8b5cf6' }
  }

  return (
    <div className={cn(
      'w-full h-full flex items-center justify-center bg-muted/20 rounded-lg border-2 border-dashed border-muted',
      className
    )}>
      <div className="text-center space-y-2">
        <div className="text-2xl font-bold text-muted-foreground">
          📊
        </div>
        <p className="text-sm text-muted-foreground">
          Graphique {config[type].label} - {data?.length || 0} points de données
        </p>
        <p className="text-xs text-muted-foreground">
          Recharts sera intégré dans la prochaine étape
        </p>
      </div>
    </div>
  )
}