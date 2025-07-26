'use client'

import { useState, useEffect } from 'react'
import { CategoryCard } from '@/components/custom/category-card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Search, Filter } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface Category {
  id: string
  name: string
  slug: string
  description: string | null
  image: string | null
  _count: {
    articles: number
  }
}

export default function CategoriesPage() {
  const router = useRouter()
  const [categories, setCategories] = useState<Category[]>([])
  const [filteredCategories, setFilteredCategories] = useState<Category[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchCategories()
  }, [])

  useEffect(() => {
    if (searchTerm) {
      const filtered = categories.filter(category =>
        category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (category.description && category.description.toLowerCase().includes(searchTerm.toLowerCase()))
      )
      setFilteredCategories(filtered)
    } else {
      setFilteredCategories(categories)
    }
  }, [searchTerm, categories])

  const fetchCategories = async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/categories')
      
      if (!response.ok) {
        throw new Error('Erreur lors du chargement des catégories')
      }
      
      const data = await response.json()
      setCategories(data)
      setFilteredCategories(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue')
    } finally {
      setIsLoading(false)
    }
  }

  const handleCategoryClick = (categoryId: string) => {
    router.push(`/catalogue?categoryId=${categoryId}`)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-8"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="bg-white rounded-lg shadow-sm p-4">
                  <div className="h-48 bg-gray-200 rounded mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Erreur</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <Button onClick={fetchCategories}>Réessayer</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
            Toutes les Catégories
          </h1>
          <p className="text-lg text-gray-600 max-w-3xl">
            Explorez toutes les catégories de vêtements disponibles sur notre plateforme. 
            Trouvez exactement ce que vous cherchez parmi notre large sélection.
          </p>
        </div>

        {/* Search and Filters */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                type="text"
                placeholder="Rechercher une catégorie..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button variant="outline" className="flex items-center gap-2">
              <Filter className="h-4 w-4" />
              Filtres
            </Button>
          </div>
        </div>

        {/* Categories Count */}
        <div className="mb-6">
          <p className="text-sm text-gray-600">
            {filteredCategories.length} catégorie{filteredCategories.length > 1 ? 's' : ''} trouvée{filteredCategories.length > 1 ? 's' : ''}
          </p>
        </div>

        {/* Categories Grid */}
        {filteredCategories.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredCategories.map((category) => (
              <CategoryCard
                key={category.id}
                id={category.id}
                name={category.name}
                description={category.description || ''}
                image={category.image || 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400&h=300&fit=crop&crop=center&auto=format&q=80'}
                productCount={category._count?.articles || 0}
                onClick={handleCategoryClick}
                className="h-full hover:shadow-lg transition-shadow duration-300"
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <Search className="h-12 w-12 mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Aucune catégorie trouvée
            </h3>
            <p className="text-gray-600">
              Essayez de modifier votre recherche ou de supprimer les filtres.
            </p>
          </div>
        )}

        {/* Back to Catalogue */}
        <div className="mt-12 text-center">
          <Button 
            onClick={() => router.push('/catalogue')}
            variant="outline"
            size="lg"
            className="border-2 border-boudoir-ocre-300 text-boudoir-ocre-700 hover:bg-boudoir-ocre-50"
          >
            Voir tous les articles
          </Button>
        </div>
      </div>
    </div>
  )
}