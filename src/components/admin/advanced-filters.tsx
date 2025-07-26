'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Calendar } from '@/components/ui/calendar'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import {
  Filter,
  X,
  Calendar as CalendarIcon,
  Download,
  RefreshCw,
  Search
} from 'lucide-react'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import { cn } from '@/lib/utils'

interface FilterConfig {
  key: string
  label: string
  type: 'select' | 'date' | 'text' | 'number'
  options?: { value: string; label: string }[]
  placeholder?: string
}

interface AdvancedFiltersProps {
  filters: FilterConfig[]
  values: Record<string, string | number | boolean | undefined>
  onChange: (values: Record<string, string | number | boolean | undefined>) => void
  onRefresh?: () => void
  onExport?: () => void
  loading?: boolean
  className?: string
}

export function AdvancedFilters({
  filters,
  values,
  onChange,
  onExport,
  onRefresh,
  loading = false,
  className
}: AdvancedFiltersProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [localValues, setLocalValues] = useState(values)
  const [dateRanges, setDateRanges] = useState<Record<string, { from?: Date; to?: Date }>>({})

  useEffect(() => {
    setLocalValues(values)
  }, [values])

  const handleFilterChange = (key: string, value: string | number | boolean | undefined) => {
    const newValues = { ...localValues, [key]: value }
    setLocalValues(newValues)
    onChange(newValues)
  }

  const handleDateRangeChange = (key: string, range: { from?: Date; to?: Date }) => {
    setDateRanges(prev => ({ ...prev, [key]: range }))
    
    const newValues = {
      ...localValues,
      [`${key}From`]: range.from ? format(range.from, 'yyyy-MM-dd') : undefined,
      [`${key}To`]: range.to ? format(range.to, 'yyyy-MM-dd') : undefined
    }
    setLocalValues(newValues)
    onChange(newValues)
  }

  const clearFilter = (key: string) => {
    const newValues = { ...localValues }
    delete newValues[key]
    
    // Si c'est un filtre de date, supprimer aussi les variantes from/to
    if (dateRanges[key]) {
      delete newValues[`${key}From`]
      delete newValues[`${key}To`]
      setDateRanges(prev => {
        const newRanges = { ...prev }
        delete newRanges[key]
        return newRanges
      })
    }
    
    setLocalValues(newValues)
    onChange(newValues)
  }

  const clearAllFilters = () => {
    setLocalValues({})
    setDateRanges({})
    onChange({})
  }

  const getActiveFiltersCount = () => {
    return Object.keys(localValues).filter(key => 
      localValues[key] !== undefined && 
      localValues[key] !== '' && 
      localValues[key] !== 'ALL'
    ).length
  }

  const renderFilter = (filter: FilterConfig) => {
    const value = localValues[filter.key]

    switch (filter.type) {
      case 'select':
        return (
          <div key={filter.key} className="space-y-2">
            <Label htmlFor={filter.key}>{filter.label}</Label>
            <Select
              value={value?.toString() || 'ALL'}
              onValueChange={(val) => handleFilterChange(filter.key, val === 'ALL' ? undefined : val)}
            >
              <SelectTrigger>
                <SelectValue placeholder={filter.placeholder} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Tous</SelectItem>
                {filter.options?.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )

      case 'text':
        return (
          <div key={filter.key} className="space-y-2">
            <Label htmlFor={filter.key}>{filter.label}</Label>
            <Input
              id={filter.key}
              type="text"
              placeholder={filter.placeholder}
              value={value?.toString() || ''}
              onChange={(e) => handleFilterChange(filter.key, e.target.value)}
            />
          </div>
        )

      case 'number':
        return (
          <div key={filter.key} className="space-y-2">
            <Label htmlFor={filter.key}>{filter.label}</Label>
            <Input
              id={filter.key}
              type="number"
              placeholder={filter.placeholder}
              value={value?.toString() || ''}
              onChange={(e) => handleFilterChange(filter.key, e.target.value ? Number(e.target.value) : undefined)}
            />
          </div>
        )

      case 'date':
        const dateRange = dateRanges[filter.key] || {}
        return (
          <div key={filter.key} className="space-y-2">
            <Label>{filter.label}</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    'w-full justify-start text-left font-normal',
                    !dateRange.from && 'text-muted-foreground'
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dateRange.from ? (
                    dateRange.to ? (
                      <>
                        {format(dateRange.from, 'dd MMM yyyy', { locale: fr })} -{' '}
                        {format(dateRange.to, 'dd MMM yyyy', { locale: fr })}
                      </>
                    ) : (
                      format(dateRange.from, 'dd MMM yyyy', { locale: fr })
                    )
                  ) : (
                    <span>Sélectionner une période</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  initialFocus
                  mode="range"
                  defaultMonth={dateRange.from}
                  selected={dateRange.from || dateRange.to ? { from: dateRange.from, to: dateRange.to } : undefined}
                  onSelect={(range: { from?: Date; to?: Date } | undefined) => handleDateRangeChange(filter.key, range || {})}
                  numberOfMonths={2}
                  locale={fr}
                />
              </PopoverContent>
            </Popover>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className={cn('space-y-4', className)}>
      {/* Barre de filtres rapides */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Popover open={isOpen} onOpenChange={setIsOpen}>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4 mr-2" />
                Filtres
                {getActiveFiltersCount() > 0 && (
                  <Badge variant="secondary" className="ml-2">
                    {getActiveFiltersCount()}
                  </Badge>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-96 p-0" align="start">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium">Filtres avancés</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {filters.map(renderFilter)}
                  
                  <Separator />
                  
                  <div className="flex justify-between">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={clearAllFilters}
                      disabled={getActiveFiltersCount() === 0}
                    >
                      Effacer tout
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => setIsOpen(false)}
                    >
                      Appliquer
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </PopoverContent>
          </Popover>

          {/* Recherche rapide */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Recherche rapide..."
              value={localValues.search?.toString() || ''}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              className="pl-9 w-64"
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center space-x-2">
          {onRefresh && (
            <Button
              variant="outline"
              size="sm"
              onClick={onRefresh}
              disabled={loading}
            >
              <RefreshCw className={cn('h-4 w-4', loading && 'animate-spin')} />
            </Button>
          )}
          
          {onExport && (
            <Button
              variant="outline"
              size="sm"
              onClick={onExport}
            >
              <Download className="h-4 w-4 mr-2" />
              Exporter
            </Button>
          )}
        </div>
      </div>

      {/* Filtres actifs */}
      {getActiveFiltersCount() > 0 && (
        <div className="flex flex-wrap gap-2">
          {Object.entries(localValues)
            .filter(([key, value]) => 
              value !== undefined && 
              value !== '' && 
              value !== 'ALL' &&
              !key.endsWith('From') &&
              !key.endsWith('To')
            )
            .map(([key, value]) => {
              const filter = filters.find(f => f.key === key)
              if (!filter) return null
              
              let displayValue = value
              if (filter.type === 'select' && filter.options) {
                const option = filter.options.find(opt => opt.value === value)
                displayValue = option?.label || value
              }
              
              return (
                <Badge key={key} variant="secondary" className="gap-1">
                  <span className="text-xs">{filter.label}:</span>
                  <span>{displayValue}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-auto p-0 ml-1"
                    onClick={() => clearFilter(key)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </Badge>
              )
            })}
        </div>
      )}
    </div>
  )
}