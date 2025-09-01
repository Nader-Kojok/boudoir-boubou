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
    price: 450000,
    originalPrice: 800000,
    condition: "EXCELLENT" as const,
    images: [
      "/categories/mariage.webp",
      "/categories/mariage.webp"
    ],
    category: "Mariage",
    sellerWhatsApp: "221771234567",
    sellerName: "Fatou Diop"
  },
  {
    id: "boubou-grand-boubou-wax",
    title: "Grand Boubou en Wax",
    description: "Boubou traditionnel en wax authentique avec broderies dorées",
    price: 180000,
    condition: "EXCELLENT" as const,
    images: [
      "/categories/tradi.webp",
      "/categories/tradi.webp"
    ],
    category: "Traditionnel",
    sellerWhatsApp: "221772345678",
    sellerName: "Aminata Sow"
  },
  {
    id: "robe-soiree-paillettes",
    title: "Robe de Soirée à Paillettes",
    description: "Robe de soirée élégante avec paillettes dorées, parfaite pour les événements",
    price: 120000,
    originalPrice: 200000,
    condition: "EXCELLENT" as const,
    images: [
      "/categories/soiree.webp",
      "/categories/soiree.webp"
    ],
    category: "Soirée",
    sellerWhatsApp: "221773456789",
    sellerName: "Aïcha Ndiaye"
  },
  {
    id: "ensemble-bazin-riche",
    title: "Ensemble Bazin Riche",
    description: "Ensemble complet en bazin riche avec broderies traditionnelles",
    price: 95000,
    condition: "GOOD" as const,
    images: [
      "/categories/tradi.webp",
      "/categories/tradi.webp"
    ],
    category: "Traditionnel",
    sellerWhatsApp: "221774567890",
    sellerName: "Mariama Fall"
  }
]

export function FeaturedProducts() {
  const [favorites, setFavorites] = useState<string[]>([])

  const handleFavoriteToggle = (productId: string) => {
    setFavorites(prev => 
      prev.includes(productId) 
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    )
  }

  const handleWhatsAppContact = (productId: string, sellerWhatsApp: string, title: string) => {
    const message = encodeURIComponent(
      `Bonjour, je suis intéressé(e) par votre article "${title}" sur Boudoir.`
    )
    const whatsappUrl = `https://wa.me/${sellerWhatsApp}?text=${message}`
    window.open(whatsappUrl, '_blank')
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
              sellerWhatsApp={product.sellerWhatsApp}
              sellerName={product.sellerName}
              onFavoriteToggle={handleFavoriteToggle}
              onWhatsAppContact={handleWhatsAppContact}
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