"use client"

import { CategoryCard } from "@/components/custom/category-card"
import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"
import Link from "next/link"

const categories = [
  {
    id: "mariage",
    name: "Mariage",
    description: "Robes de mariée, tenues de cérémonie et accessoires",
    image: "/categories/mariage.webp",
    productCount: 156
  },
  {
    id: "traditionnel",
    name: "Traditionnel",
    description: "Boubous, bazin riche et tenues traditionnelles",
    image: "/categories/tradi.webp",
    productCount: 243
  },
  {
    id: "soiree",
    name: "Soirée",
    description: "Robes de soirée, tenues de gala et événements",
    image: "/categories/soiree.webp",
    productCount: 189
  },
  {
    id: "casual",
    name: "Décontracté",
    description: "Tenues du quotidien, robes et ensembles casual",
    image: "/categories/tradi-casual.webp",
    productCount: 312
  }
]

export function FeaturedCategories() {
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
          {categories.map((category) => (
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
          ))}
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