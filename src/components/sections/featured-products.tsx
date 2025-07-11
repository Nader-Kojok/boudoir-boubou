"use client"

import { ProductCard } from "@/components/custom/product-card"
import { Button } from "@/components/ui/button"
import { ArrowRight, Star } from "lucide-react"
import Link from "next/link"
import { useState } from "react"

const featuredProducts = [
  {
    id: "robe-mariee-traditionnelle",
    title: "Robe de Mariée Traditionnelle",
    description: "Magnifique robe de mariée sénégalaise brodée main, portée une seule fois",
    price: 450.00,
    originalPrice: 800.00,
    condition: "EXCELLENT" as const,
    images: [
      "https://images.unsplash.com/photo-1519741497674-611481863552?w=500&h=600&fit=crop&crop=center&auto=format&q=80",
      "https://images.unsplash.com/photo-1465495976277-4387d4b0e4a6?w=500&h=600&fit=crop&crop=center&auto=format&q=80"
    ],
    category: "Mariage"
  },
  {
    id: "boubou-grand-boubou-wax",
    title: "Grand Boubou en Wax",
    description: "Boubou traditionnel en wax authentique avec broderies dorées",
    price: 180.00,
    condition: "EXCELLENT" as const,
    images: [
      "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=500&h=600&fit=crop&crop=center&auto=format&q=80",
      "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=500&h=600&fit=crop&crop=center&auto=format&q=80"
    ],
    category: "Traditionnel"
  },
  {
    id: "robe-soiree-paillettes",
    title: "Robe de Soirée à Paillettes",
    description: "Robe de soirée élégante avec paillettes dorées, parfaite pour les événements",
    price: 120.00,
    originalPrice: 200.00,
    condition: "EXCELLENT" as const,
    images: [
      "https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=500&h=600&fit=crop&crop=center&auto=format&q=80",
      "https://images.unsplash.com/photo-1539008835657-9e8e9680c956?w=500&h=600&fit=crop&crop=center&auto=format&q=80"
    ],
    category: "Soirée"
  },
  {
    id: "ensemble-bazin-riche",
    title: "Ensemble Bazin Riche",
    description: "Ensemble complet en bazin riche avec broderies traditionnelles",
    price: 95.00,
    condition: "GOOD" as const,
    images: [
      "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=500&h=600&fit=crop&crop=center&auto=format&q=80",
      "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=500&h=600&fit=crop&crop=center&auto=format&q=80"
    ],
    category: "Traditionnel"
  }
]

export function FeaturedProducts() {
  const [favorites, setFavorites] = useState<string[]>([])
  const [cart, setCart] = useState<string[]>([])

  const handleFavoriteToggle = (productId: string) => {
    setFavorites(prev => 
      prev.includes(productId) 
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    )
  }

  const handleAddToCart = (productId: string) => {
    setCart(prev => 
      prev.includes(productId) 
        ? prev
        : [...prev, productId]
    )
  }

  const handleProductClick = (productId: string) => {
    window.location.href = `/article/${productId}`
  }

  return (
    <section className="py-16 lg:py-24 bg-gradient-to-b from-gray-50 to-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-boudoir-ocre-100 rounded-full px-4 py-2 mb-4">
            <Star className="w-4 h-4 text-boudoir-ocre-600 fill-current" />
            <span className="text-sm font-medium text-boudoir-ocre-700">
              Tendances du moment
            </span>
          </div>
          
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
            Articles en Vedette
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Découvrez les plus belles pièces mises en vente par notre communauté : 
            robes de mariée, tenues traditionnelles et vêtements de soirée d&apos;exception.
          </p>
        </div>
        
        {/* Products Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {featuredProducts.map((product) => (
            <ProductCard
              key={product.id}
              id={product.id}
              title={product.title}
              description={product.description}
              price={product.price}
              originalPrice={product.originalPrice}
              condition={product.condition}
              images={product.images}
              category={product.category}
              isFavorite={favorites.includes(product.id)}
              isInCart={cart.includes(product.id)}
              onFavoriteToggle={handleFavoriteToggle}
              onAddToCart={handleAddToCart}
              onClick={handleProductClick}
              className="h-full"
            />
          ))}
        </div>
        
        {/* CTA */}
        <div className="text-center">
          <Button 
            asChild 
            size="lg"
            className="bg-gradient-to-r from-[#9bc5c0] to-[#7ba8a3] hover:from-[#7ba8a3] hover:to-[#5a8b86] text-white px-8 py-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 group"
          >
            <Link href="/catalogue">
              Voir tous les articles
              <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  )
}