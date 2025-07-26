'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { Star, TrendingUp, Eye, Clock, Zap } from 'lucide-react'
import { formatPrice } from '@/lib/utils'

interface PromotionOption {
  id: string
  name: string
  description: string
  price: number
  duration: string
  features: string[]
  icon: React.ReactNode
  popular?: boolean
}

interface PromotionOptionsProps {
  selectedPromotions: string[]
  onPromotionChange: (selectedPromotions: string[]) => void
  onCostChange: (cost: number) => void
}

const PROMOTION_OPTIONS: PromotionOption[] = [
  {
    id: 'featured_homepage',
    name: 'Mise en avant page d\'accueil',
    description: 'Votre article apparaîtra dans la section "Articles en vedette" de la page d\'accueil',
    price: 2000,
    duration: '7 jours',
    features: [
      'Position privilégiée sur la page d\'accueil',
      'Badge "En vedette"',
      'Visibilité maximale',
      'Augmentation des vues de +300%'
    ],
    icon: <Star className="w-5 h-5" />,
    popular: true
  },
  {
    id: 'boost_search',
    name: 'Boost dans les résultats',
    description: 'Votre article apparaîtra en haut des résultats de recherche et du catalogue',
    price: 1000,
    duration: '5 jours',
    features: [
      'Priorité dans les résultats de recherche',
      'Badge "Boost"',
      'Meilleur classement',
      'Augmentation des vues de +150%'
    ],
    icon: <TrendingUp className="w-5 h-5" />
  },
  {
    id: 'highlight',
    name: 'Mise en surbrillance',
    description: 'Votre article sera mis en surbrillance avec une bordure colorée',
    price: 500,
    duration: '3 jours',
    features: [
      'Bordure colorée distinctive',
      'Badge "Highlight"',
      'Attire l\'attention',
      'Augmentation des clics de +50%'
    ],
    icon: <Zap className="w-5 h-5" />
  },
  {
    id: 'extended_visibility',
    name: 'Visibilité étendue',
    description: 'Votre article restera visible plus longtemps dans les flux',
    price: 750,
    duration: '10 jours',
    features: [
      'Durée de vie prolongée',
      'Réapparition périodique',
      'Visibilité constante',
      'Portée élargie'
    ],
    icon: <Eye className="w-5 h-5" />
  }
]

export default function PromotionOptions({ selectedPromotions, onPromotionChange, onCostChange }: PromotionOptionsProps) {
  const [localSelectedOptions, setLocalSelectedOptions] = useState<string[]>(selectedPromotions)

  const handleOptionToggle = (optionId: string, checked: boolean) => {
    let newSelection: string[]
    
    if (checked) {
      newSelection = [...localSelectedOptions, optionId]
    } else {
      newSelection = localSelectedOptions.filter(id => id !== optionId)
    }
    
    setLocalSelectedOptions(newSelection)
    
    // Calculer le coût total
    const totalCost = newSelection.reduce((total, id) => {
      const option = PROMOTION_OPTIONS.find(opt => opt.id === id)
      return total + (option?.price || 0)
    }, 0)
    
    onPromotionChange(newSelection)
    onCostChange(totalCost)
  }

  const getTotalCost = () => {
    return localSelectedOptions.reduce((total, id) => {
      const option = PROMOTION_OPTIONS.find(opt => opt.id === id)
      return total + (option?.price || 0)
    }, 0)
  }

  return (
    <Card className="border-boudoir-beige-200">
      <CardHeader className="bg-gradient-to-r from-boudoir-beige-100 to-boudoir-ocre-100">
        <CardTitle className="flex items-center gap-2 text-boudoir-beige-900">
          <Star className="h-5 w-5 text-boudoir-ocre-600" />
          Options de mise en avant
        </CardTitle>
        <p className="text-sm text-boudoir-beige-700">
          Boostez la visibilité de votre article avec nos options promotionnelles
        </p>
      </CardHeader>
      <CardContent className="p-6 space-y-4">
        {PROMOTION_OPTIONS.map((option) => {
          const isSelected = localSelectedOptions.includes(option.id)
          
          return (
            <div 
              key={option.id} 
              className={`border rounded-lg p-4 transition-all duration-200 ${
                isSelected 
                  ? 'border-boudoir-ocre-400 bg-boudoir-ocre-50' 
                  : 'border-boudoir-beige-200 hover:border-boudoir-beige-300'
              }`}
            >
              <div className="flex items-start space-x-3">
                <Checkbox
                  id={option.id}
                  checked={isSelected}
                  onCheckedChange={(checked) => handleOptionToggle(option.id, checked as boolean)}
                  className="mt-1"
                />
                
                <div className="flex-1 space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="text-boudoir-ocre-600">
                        {option.icon}
                      </div>
                      <div>
                        <label 
                          htmlFor={option.id} 
                          className="font-semibold text-boudoir-beige-900 cursor-pointer flex items-center space-x-2"
                        >
                          <span>{option.name}</span>
                          {option.popular && (
                            <Badge className="bg-boudoir-ocre-600 text-white text-xs">
                              Populaire
                            </Badge>
                          )}
                        </label>
                        <p className="text-sm text-boudoir-beige-700 mt-1">
                          {option.description}
                        </p>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className="font-bold text-boudoir-ocre-600">
                        {formatPrice(option.price)} F
                      </div>
                      <div className="text-xs text-boudoir-beige-600 flex items-center">
                        <Clock className="w-3 h-3 mr-1" />
                        {option.duration}
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2">
                    {option.features.map((feature, index) => (
                      <div key={index} className="flex items-center space-x-1 text-xs text-boudoir-beige-700">
                        <div className="w-1 h-1 bg-boudoir-ocre-400 rounded-full"></div>
                        <span>{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )
        })}
        
        {localSelectedOptions.length > 0 && (
          <div className="border-t pt-4 mt-6">
            <div className="bg-boudoir-beige-100 rounded-lg p-4">
              <div className="flex justify-between items-center">
                <div>
                  <h4 className="font-semibold text-boudoir-beige-900">
                    Options sélectionnées ({localSelectedOptions.length})
                  </h4>
                  <p className="text-sm text-boudoir-beige-700">
                    Coût total des promotions
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-boudoir-ocre-600">
                    {formatPrice(getTotalCost())} F
                  </div>
                  <div className="text-xs text-boudoir-beige-600">
                    + frais de publication
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
        
        <div className="bg-blue-50 p-4 rounded-lg">
          <p className="text-xs text-blue-800">
            <strong>💡 Conseil :</strong> Les articles avec options promotionnelles ont 5x plus de chances d'être vendus rapidement !
          </p>
        </div>
      </CardContent>
    </Card>
  )
}