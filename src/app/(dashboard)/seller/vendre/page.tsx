'use client'

import { useState, useCallback } from 'react'
import * as React from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import Image from 'next/image'
import { useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Plus, X, Camera } from 'lucide-react'
import { handleError, handleSuccess } from '@/hooks/use-notifications'
import { delayedLocationChange } from '@/utils/delayed-navigation'

const formSchema = z.object({
  title: z.string().min(5, {
    message: "Le titre doit contenir au moins 5 caractères.",
  }),
  description: z.string().min(20, {
    message: "La description doit contenir au moins 20 caractères.",
  }),
  category: z.string({
    required_error: "Veuillez sélectionner une catégorie.",
  }),
  price: z.string().min(1, {
    message: "Le prix est requis.",
  }),
  condition: z.string({
    required_error: "Veuillez indiquer l&apos;état de l&apos;article.",
  }),
  size: z.string().optional(),
  brand: z.string().optional(),
  color: z.string().optional(),
  acceptTerms: z.boolean().refine((val) => val === true, {
    message: "Vous devez accepter les conditions d&apos;utilisation.",
  }),
})

type FormData = z.infer<typeof formSchema>

const categories = [
  { value: 'mariage', label: 'Tenues de mariage' },
  { value: 'soiree', label: 'Tenues de soirée' },
  { value: 'traditionnel', label: 'Vêtements traditionnels' },
  { value: 'casual', label: 'Vêtements casual' },
  { value: 'accessoires', label: 'Accessoires' },
]

const conditions = [
  { value: 'EXCELLENT', label: 'Excellent état' },
  { value: 'GOOD', label: 'Bon état' },
  { value: 'FAIR', label: 'État correct' },
]

const sizes = [
  { value: 'xs', label: 'XS' },
  { value: 's', label: 'S' },
  { value: 'm', label: 'M' },
  { value: 'l', label: 'L' },
  { value: 'xl', label: 'XL' },
  { value: 'xxl', label: 'XXL' },
  { value: 'unique', label: 'Taille unique' },
]

export default function VendrePage() {
  const searchParams = useSearchParams()
  const editId = searchParams.get('edit')
  const isEditing = !!editId
  
  const [uploadedImages, setUploadedImages] = useState<string[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoading, setIsLoading] = useState(isEditing)
  const [apiCategories, setApiCategories] = useState<{id: string, name: string, slug: string}[]>([])

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      description: '',
      category: '',
      price: '',
      condition: '',
      size: '',
      brand: '',
      color: '',
      acceptTerms: false,
    },
  })

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (files) {
      Array.from(files).forEach((file) => {
        const reader = new FileReader()
        reader.onload = (e) => {
          if (e.target?.result) {
            setUploadedImages((prev) => [...prev, e.target!.result as string])
          }
        }
        reader.readAsDataURL(file)
      })
    }
  }

  const removeImage = (index: number) => {
    setUploadedImages((prev) => prev.filter((_, i) => i !== index))
  }

  const saveDraft = async () => {
    try {
      const formData = form.getValues()
      
      // Générer un ID unique pour le brouillon
      const draftId = `draft_${Date.now()}`
      
      // Sauvegarder en localStorage pour le moment
      const draftData = {
        id: draftId,
        ...formData,
        images: uploadedImages,
        savedAt: new Date().toISOString()
      }
      
      // Récupérer les brouillons existants
      const existingDrafts = JSON.parse(localStorage.getItem('article-drafts') || '[]')
      
      // Ajouter le nouveau brouillon
      const updatedDrafts = [...existingDrafts, draftData]
      
      // Limiter à 10 brouillons maximum
      if (updatedDrafts.length > 10) {
        updatedDrafts.shift() // Supprimer le plus ancien
      }
      
      localStorage.setItem('article-drafts', JSON.stringify(updatedDrafts))
      
      // Aussi sauvegarder le brouillon actuel pour le chargement automatique
      localStorage.setItem('article-draft', JSON.stringify(draftData))
      
      handleSuccess('Brouillon sauvegardé avec succès!')
    } catch (error) {
      handleError(error, 'Sauvegarde du brouillon')
    }
  }

  // Fonction pour charger les catégories depuis l'API
  const loadCategories = async () => {
    try {
      const response = await fetch('/api/categories')
      if (response.ok) {
        const categories = await response.json()
        setApiCategories(categories)
      }
    } catch (error) {
      console.error('Erreur lors du chargement des catégories:', error)
    }
  }

  // Fonction pour charger les données de l'article à éditer
  const loadArticleData = useCallback(async (articleId: string) => {
    try {
      setIsLoading(true)
      const response = await fetch(`/api/articles/${articleId}`)
      
      if (!response.ok) {
        throw new Error('Article non trouvé')
      }
      
      const data = await response.json()
      const article = data.article
      
      // Remplir le formulaire avec les données de l'article
      const formData = {
        title: article.title || '',
        description: article.description || '',
        category: article.category?.slug || '',
        price: article.price?.toString() || '',
        condition: article.condition || '',
        size: article.size || '',
        brand: article.brand || '',
        color: article.color || '',
        acceptTerms: true, // Déjà accepté lors de la création
      }
      
      form.reset(formData)
      
      // Parser les images si elles existent
      if (article.images) {
        try {
          const images = typeof article.images === 'string' 
            ? JSON.parse(article.images) 
            : article.images
          setUploadedImages(images)
        } catch (imageError) {
          console.error('Erreur lors du parsing des images:', imageError)
          setUploadedImages([])
        }
      }
      
    } catch (error) {
      handleError(error, 'Chargement de l\'article')
    } finally {
      setIsLoading(false)
    }
  }, [form])

  // Charger les données au montage du composant
  React.useEffect(() => {
    // Charger les catégories depuis l'API
    loadCategories()
    
    if (isEditing && editId) {
      loadArticleData(editId)
    } else {
      // Charger le brouillon seulement si on n'est pas en mode édition
      const savedDraft = localStorage.getItem('article-draft')
      if (savedDraft) {
        try {
          const draftData = JSON.parse(savedDraft)
          // S'assurer que toutes les valeurs sont définies
          const cleanedData = {
            title: draftData.title || '',
            description: draftData.description || '',
            category: draftData.category || '',
            price: draftData.price || '',
            condition: draftData.condition || '',
            size: draftData.size || '',
            brand: draftData.brand || '',
            color: draftData.color || '',
            acceptTerms: draftData.acceptTerms || false,
          }
          form.reset(cleanedData)
          if (draftData.images) {
            setUploadedImages(draftData.images)
          }
        } catch (error) {
          handleError(error, 'Chargement du brouillon')
        }
      }
      setIsLoading(false)
    }
  }, [form, isEditing, editId, loadArticleData])

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true)
    try {
      // Vérifier qu'au moins une image est uploadée
      if (uploadedImages.length === 0) {
        handleError(new Error('Veuillez ajouter au moins une photo de votre article.'), 'Validation')
        return
      }

      // Préparer les données pour l'API
      const articleData = {
        title: data.title,
        description: data.description,
        category: data.category,
        price: data.price,
        condition: data.condition,
        size: data.size,
        brand: data.brand,
        color: data.color,
        images: uploadedImages
      }

      // Envoyer les données à l'API
      const url = isEditing ? `/api/articles/${editId}` : '/api/articles'
      const method = isEditing ? 'PUT' : 'POST'
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(articleData)
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || `Erreur lors de ${isEditing ? 'la mise à jour' : 'la création'} de l\'article`)
      }

      // Succès - rediriger vers la liste des articles après un délai
      const successMessage = isEditing ? 'Votre article a été mis à jour avec succès!' : 'Votre article a été publié avec succès!'
      handleSuccess(successMessage)
      delayedLocationChange('/seller/articles', 3000)
      
    } catch (error) {
      handleError(error, isEditing ? 'Mise à jour de l\'article' : 'Publication de l\'article')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-boudoir-beige-50 py-8">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 rounded w-1/3"></div>
            <div className="h-4 bg-gray-200 rounded w-2/3"></div>
            <div className="space-y-4">
              <div className="h-32 bg-gray-200 rounded"></div>
              <div className="h-24 bg-gray-200 rounded"></div>
              <div className="h-16 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-boudoir-beige-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-boudoir-beige-900 mb-2">
            {isEditing ? 'Modifier ton article' : 'Vends ton article'}
          </h1>
          <p className="text-boudoir-beige-700">
            {isEditing 
              ? 'Modifie les informations de ton article'
              : 'Remplis ce formulaire pour mettre en vente ton vêtement sur Le Boudoir du BouBou'
            }
          </p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            {/* Section Photos */}
            <Card className="border-boudoir-beige-200">
              <CardHeader className="bg-boudoir-beige-100/50">
                <CardTitle className="flex items-center gap-2 text-boudoir-beige-900">
                  <Camera className="h-5 w-5" />
                  Ajoute des photos
                </CardTitle>
                <p className="text-sm text-boudoir-beige-700">
                  Attire l&apos;œil des acheteurs : utilise des photos de qualité.
                  <a href="#" className="text-boudoir-ocre-600 hover:underline ml-1">
                    Découvre comment
                  </a>
                </p>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {uploadedImages.map((image, index) => (
                    <div key={index} className="relative group">
                      <Image
                        src={image}
                        alt={`Upload ${index + 1}`}
                        width={128}
                        height={128}
                        className="w-full h-32 object-cover rounded-lg border-2 border-boudoir-beige-200"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                  
                  {uploadedImages.length < 8 && (
                    <label className="flex flex-col items-center justify-center h-32 border-2 border-dashed border-boudoir-beige-300 rounded-lg cursor-pointer hover:border-boudoir-ocre-400 transition-colors">
                      <Plus className="h-8 w-8 text-boudoir-beige-400 mb-2" />
                      <span className="text-sm text-boudoir-beige-600">
                        Ajouter des photos
                      </span>
                      <input
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                      />
                    </label>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Section Informations de base */}
            <Card className="border-boudoir-beige-200">
              <CardContent className="p-6 space-y-6">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-boudoir-beige-900">Titre</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="ex : Chemise Sézane verte"
                          className="border-boudoir-beige-300 focus:border-boudoir-ocre-500"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-boudoir-beige-900">Décris ton article</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="ex : porté quelques fois, taille correctement"
                          className="border-boudoir-beige-300 focus:border-boudoir-ocre-500 min-h-24"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="category"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-boudoir-beige-900">Catégorie</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger className="border-boudoir-beige-300 focus:border-boudoir-ocre-500">
                              <SelectValue placeholder="Sélectionne une catégorie" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {apiCategories.length > 0 ? (
                              apiCategories.map((category) => (
                                <SelectItem key={category.id} value={category.slug}>
                                  {category.name}
                                </SelectItem>
                              ))
                            ) : (
                              categories.map((category) => (
                                <SelectItem key={category.value} value={category.value}>
                                  {category.label}
                                </SelectItem>
                              ))
                            )}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="condition"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-boudoir-beige-900">État</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger className="border-boudoir-beige-300 focus:border-boudoir-ocre-500">
                              <SelectValue placeholder="Sélectionne l'état" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {conditions.map((condition) => (
                              <SelectItem key={condition.value} value={condition.value}>
                                {condition.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <FormField
                    control={form.control}
                    name="size"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-boudoir-beige-900">Taille</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger className="border-boudoir-beige-300 focus:border-boudoir-ocre-500">
                              <SelectValue placeholder="Taille" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {sizes.map((size) => (
                              <SelectItem key={size.value} value={size.value}>
                                {size.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="brand"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-boudoir-beige-900">Marque</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="ex : Zara"
                            className="border-boudoir-beige-300 focus:border-boudoir-ocre-500"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="color"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-boudoir-beige-900">Couleur</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="ex : Rouge"
                            className="border-boudoir-beige-300 focus:border-boudoir-ocre-500"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Section Prix */}
            <Card className="border-boudoir-beige-200">
              <CardContent className="p-6">
                <FormField
                  control={form.control}
                  name="price"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-boudoir-beige-900">Prix</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            placeholder="0,00"
                            className="border-boudoir-beige-300 focus:border-boudoir-ocre-500 pr-8"
                            {...field}
                          />
                          <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-boudoir-beige-600">
                            F
                          </span>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* Section Conditions */}
            <Card className="border-boudoir-beige-200">
              <CardContent className="p-6">
                <FormField
                  control={form.control}
                  name="acceptTerms"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          className="border-boudoir-beige-400"
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel className="text-sm text-boudoir-beige-900">
                          Que penses-tu de notre procédure pour ajouter de nouveaux articles ?
                        </FormLabel>
                        <FormDescription className="text-boudoir-beige-700">
                          Un vendeur professionnel se faisant passer pour un consommateur ou un non-professionnel sur Vinted encourt les sanctions prévues à l&apos;
                          <a href="#" className="text-boudoir-ocre-600 hover:underline">
                            Article L. 132-2
                          </a>
                          {' '}du Code de la Consommation.
                        </FormDescription>
                        <FormMessage />
                      </div>
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* Boutons d'action */}
            <div className="flex flex-col sm:flex-row gap-4 justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={saveDraft}
                className="border-boudoir-beige-300 text-boudoir-beige-700 hover:bg-boudoir-beige-100"
              >
                Sauvegarder le brouillon
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting || isLoading}
                className="bg-gradient-to-r from-[#a67c3a] to-[#8b5a2b] hover:from-[#8b5a2b] hover:to-[#6d4422] text-white shadow-lg hover:shadow-xl transition-all duration-300"
              >
                {isSubmitting 
                  ? (isEditing ? 'Mise à jour...' : 'Publication...') 
                  : (isEditing ? 'Mettre à jour l\'article' : 'Publier l\'article')
                }
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  )
}