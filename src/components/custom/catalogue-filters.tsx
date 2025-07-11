'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Slider } from '@/components/ui/slider'
import { Label } from '@/components/ui/label'
import { Filter, X } from 'lucide-react'

interface Category {
  id: string
  name: string
  slug: string
}

interface CatalogueFilters {
  search: string
  categoryId: string
  minPrice: string
  maxPrice: string
  condition: string
  sortBy: string
}

interface CatalogueFiltersProps {
  filters: CatalogueFilters
  categories: Category[]
  onFilterChange: (key: keyof CatalogueFilters, value: string) => void
  onClearFilters: () => void
  className?: string
  showMobileToggle?: boolean
}

const CONDITION_OPTIONS = [
  { value: '', label: 'Tous les états' },
  { value: 'EXCELLENT', label: 'Excellent' },
  { value: 'GOOD', label: 'Bon' },
  { value: 'FAIR', label: 'Correct' },
]

const PRICE_RANGES = [
  { label: 'Moins de 10 000 FCFA', min: '', max: '10000' },
  { label: '10 000 - 25 000 FCFA', min: '10000', max: '25000' },
  { label: '25 000 - 50 000 FCFA', min: '25000', max: '50000' },
  { label: '50 000 - 100 000 FCFA', min: '50000', max: '100000' },
  { label: 'Plus de 100 000 FCFA', min: '100000', max: '' },
]

export function CatalogueFilters({
  filters,
  categories,
  onFilterChange,
  onClearFilters,
  className,
  showMobileToggle = false
}: CatalogueFiltersProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [priceRange, setPriceRange] = useState([0, 200000])

  const activeFiltersCount = Object.values(filters).filter(value => 
    value && value !== 'newest'
  ).length

  const handlePriceRangeChange = (values: number[]) => {
    setPriceRange(values)
    onFilterChange('minPrice', values[0] > 0 ? values[0].toString() : '')
    onFilterChange('maxPrice', values[1] < 200000 ? values[1].toString() : '')
  }

  const handleQuickPriceRange = (min: string, max: string) => {
    onFilterChange('minPrice', min)
    onFilterChange('maxPrice', max)
    if (min) setPriceRange([parseInt(min), max ? parseInt(max) : 200000])
    else setPriceRange([0, max ? parseInt(max) : 200000])
  }

  const filterContent = (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filtres
          </CardTitle>
          {activeFiltersCount > 0 && (
            <div className="flex items-center gap-2">
              <Badge variant="secondary">{activeFiltersCount}</Badge>
              <Button variant="ghost" size="sm" onClick={onClearFilters}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Category Filter */}
        <div className="space-y-2">
          <Label className="text-sm font-medium">Catégorie</Label>
          <Select
            value={filters.categoryId}
            onValueChange={(value) => onFilterChange('categoryId', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Toutes les catégories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Toutes les catégories</SelectItem>
              {categories.map((category) => (
                <SelectItem key={category.id} value={category.id}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Quick Price Ranges */}
        <div className="space-y-2">
          <Label className="text-sm font-medium">Gammes de prix</Label>
          <div className="grid grid-cols-1 gap-2">
            {PRICE_RANGES.map((range, index) => {
              const isActive = filters.minPrice === range.min && filters.maxPrice === range.max
              return (
                <Button
                  key={index}
                  variant={isActive ? "default" : "outline"}
                  size="sm"
                  className="justify-start text-xs h-8"
                  onClick={() => handleQuickPriceRange(range.min, range.max)}
                >
                  {range.label}
                </Button>
              )
            })}
          </div>
        </div>

        {/* Custom Price Range */}
        <div className="space-y-4">
          <Label className="text-sm font-medium">Prix personnalisé (FCFA)</Label>
          <div className="px-2">
            <Slider
              value={priceRange}
              onValueChange={handlePriceRangeChange}
              max={200000}
              min={0}
              step={1000}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-muted-foreground mt-2">
              <span>{priceRange[0].toLocaleString()}</span>
              <span>{priceRange[1].toLocaleString()}</span>
            </div>
          </div>
          <div className="flex gap-2">
            <Input
              type="number"
              placeholder="Min"
              value={filters.minPrice}
              onChange={(e) => onFilterChange('minPrice', e.target.value)}
              className="text-sm"
            />
            <Input
              type="number"
              placeholder="Max"
              value={filters.maxPrice}
              onChange={(e) => onFilterChange('maxPrice', e.target.value)}
              className="text-sm"
            />
          </div>
        </div>

        {/* Condition Filter */}
        <div className="space-y-2">
          <Label className="text-sm font-medium">État</Label>
          <Select
            value={filters.condition}
            onValueChange={(value) => onFilterChange('condition', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Tous les états" />
            </SelectTrigger>
            <SelectContent>
              {CONDITION_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Condition Badges */}
        <div className="space-y-2">
          <Label className="text-sm font-medium">Filtres rapides</Label>
          <div className="flex flex-wrap gap-2">
            {CONDITION_OPTIONS.slice(1).map((option) => {
              const isActive = filters.condition === option.value
              return (
                <Button
                  key={option.value}
                  variant={isActive ? "default" : "outline"}
                  size="sm"
                  className="text-xs h-7"
                  onClick={() => onFilterChange('condition', isActive ? '' : option.value)}
                >
                  {option.label}
                </Button>
              )
            })}
          </div>
        </div>

        {/* Clear Filters */}
        {activeFiltersCount > 0 && (
          <Button 
            variant="outline" 
            className="w-full" 
            onClick={onClearFilters}
          >
            Effacer tous les filtres
          </Button>
        )}
      </CardContent>
    </Card>
  )

  if (showMobileToggle) {
    return (
      <div className="lg:hidden">
        <Button
          variant="outline"
          onClick={() => setIsOpen(!isOpen)}
          className="w-full mb-4"
        >
          <Filter className="h-4 w-4 mr-2" />
          Filtres
          {activeFiltersCount > 0 && (
            <Badge variant="secondary" className="ml-2">
              {activeFiltersCount}
            </Badge>
          )}
        </Button>
        
        {isOpen && (
          <div className="mb-6">
            {filterContent}
          </div>
        )}
      </div>
    )
  }

  return filterContent
}

export default CatalogueFilters