"use client"

import { CategoryCard } from "@/components/custom/category-card"
import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"
import Link from "next/link"
import { useEffect, useState } from "react"

interface CategoryStats {
  id: string
  name: string
  description: string
  image: string
  productCount: number
}

// Données de fallback en cas d'erreur API
const fallbackCategories: CategoryStats[] = [
  {
    id: "mariage",
    name: "Mariage",
    description: "Robes de mariée, tenues de cérémonie et accessoires",
    image: "/categories/mariage.webp",
    productCount: 0
  },
  {
    id: "traditionnel",
    name: "Traditionnel",
    description: "Boubous, bazin riche et tenues traditionnelles",
    image: "/categories/tradi.webp",
    productCount: 0
  },
  {
    id: "soiree",
    name: "Soirée",
    description: "Robes de soirée, tenues de gala et événements",
    image: "/categories/soiree.webp",
    productCount: 0
  },
  {
    id: "casual",
    name: "Décontracté",
    description: "Tenues du quotidien, robes et ensembles casual",
    image: "/categories/tradi-casual.webp",
    productCount: 0
  }
]

export function FeaturedCategories() {
  const [categories, setCategories] = useState<CategoryStats[]>(fallbackCategories)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchCategoryStats = async () => {
      try {
        const response = await fetch('/api/categories/stats')
        if (response.ok) {
          const data = await response.json()
          setCategories(data)
        } else {
          console.warn('Impossible de récupérer les statistiques des catégories, utilisation des données de fallback')
        }
      } catch (error) {
        console.error('Erreur lors de la récupération des statistiques:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchCategoryStats()
  }, [])

  const handleCategoryClick = (categoryId: string) => {
    // Navigation vers la catégorie dans le catalogue
    window.location.href = `/catalogue?categoryId=${categoryId}`
  }

  return (
    <section className="py-16 lg:py-24 bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
            Catégories Populaires
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Découvrez les différentes catégories de vêtements mis en vente par notre 
            communauté de vendeuses sénégalaises.
          </p>
        </div>
        
        {/* Categories Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {isLoading ? (
            // Skeleton loading state
            Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="animate-pulse">
                <div className="bg-gray-200 aspect-[4/5] rounded-lg mb-4"></div>
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-3/4"></div>
              </div>
            ))
          ) : (
            categories.slice(0, 4).map((category) => (
              <CategoryCard
                key={category.id}
                id={category.id}
                name={category.name}
                description={category.description}
                image={category.image}
                productCount={category.productCount}
                onClick={handleCategoryClick}
                className="h-full"
              />
            ))
          )}
        </div>
        
        {/* CTA */}
        <div className="text-center">
          <Button 
            asChild 
            variant="outline" 
            size="lg"
            className="border-2 border-boudoir-ocre-300 text-boudoir-ocre-700 hover:bg-boudoir-ocre-50 px-8 py-3 rounded-full transition-all duration-300 group"
          >
            <Link href="/categories">
              Voir toutes les catégories
              <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  )
}