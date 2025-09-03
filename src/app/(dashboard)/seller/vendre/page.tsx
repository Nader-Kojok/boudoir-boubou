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
import PaymentSelection from '@/components/forms/payment-selection'
import PromotionOptions from '@/components/forms/promotion-options'

import { handleError, handleSuccess } from '@/hooks/use-notifications'
import { delayedLocationChange } from '@/utils/delayed-navigation'
import { cleanupDraftsIfNeeded, safeLocalStorageSet } from '@/lib/localStorage-utils'
import { validateMultipleImageFiles as validateBlobFiles } from '@/lib/blob-storage'

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
  { value: 'tradi-casual', label: 'Vêtements tradi-casual' },
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
  const [showPayment, setShowPayment] = useState(false)
  const [selectedPromotions, setSelectedPromotions] = useState<string[]>([])
  const [promotionCost, setPromotionCost] = useState(0)
  const [paymentCompleted, setPaymentCompleted] = useState(false)
  
  // Frais de publication de base
  const BASE_PUBLICATION_FEE = 1000

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

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
     const files = event.target.files
     if (!files || files.length === 0) return
 
     try {
       const fileArray = Array.from(files)
       
       // Valider les fichiers
       const validation = validateBlobFiles(fileArray)
       
       if (!validation.isValid) {
         handleError(new Error(validation.error || 'Fichiers invalides'), 'Validation des images')
         return
       }
 
       // Vérifier la limite de 8 images
       const remainingSlots = 8 - uploadedImages.length
       if (remainingSlots <= 0) {
         handleError(new Error('Vous avez atteint la limite de 8 images'), 'Upload des images')
         return
       }
 
       const filesToUpload = fileArray.slice(0, remainingSlots)
       
       // Créer FormData pour l'upload
       const formData = new FormData()
       filesToUpload.forEach((file, index) => {
         formData.append(`file${index}`, file)
       })
       
       // Uploader vers Vercel Blob via API
       const response = await fetch('/api/upload/multiple', {
         method: 'POST',
         body: formData,
       })
       
       if (!response.ok) {
         const errorData = await response.json()
         throw new Error(errorData.error || 'Erreur lors de l\'upload')
       }
       
       const uploadData = await response.json()
       
       // Ajouter les nouvelles URLs d'images
       setUploadedImages(prev => {
         const newImages = [...prev, ...uploadData.images.map((img: {url: string}) => img.url)]
         return newImages.slice(0, 8) // Limiter à 8 images maximum
       })
 
       handleSuccess(`${uploadData.count} image(s) uploadée(s) avec succès`)
 
     } catch (error) {
       handleError(error, 'Upload des images')
     }
 
     // Réinitialiser l'input pour permettre de sélectionner les mêmes fichiers
     event.target.value = ''
   }

  const removeImage = (index: number) => {
    setUploadedImages((prev) => prev.filter((_, i) => i !== index))
  }



  const saveDraft = async () => {
    try {
      const formData = form.getValues()
      
      // Générer un ID unique pour le brouillon
      const draftId = `draft_${Date.now()}`
      
      // Créer les données du brouillon avec images optimisées
      const draftData = {
        id: draftId,
        ...formData,
        images: uploadedImages.slice(0, 5), // Limiter à 5 images max
        savedAt: new Date().toISOString()
      }
      
      // Calculer la taille approximative du nouveau brouillon
      const draftSize = JSON.stringify(draftData).length
      
      // Nettoyer si nécessaire avant d'ajouter
      cleanupDraftsIfNeeded(draftSize)
      
      // Récupérer les brouillons existants après nettoyage
      const existingDrafts = JSON.parse(localStorage.getItem('article-drafts') || '[]')
      
      // Ajouter le nouveau brouillon
      const updatedDrafts = [...existingDrafts, draftData]
      
      // Limiter à 5 brouillons maximum pour éviter les problèmes de taille
      if (updatedDrafts.length > 5) {
        updatedDrafts.shift() // Supprimer le plus ancien
      }
      
      // Tenter de sauvegarder avec la fonction sécurisée
      const draftsSuccess = safeLocalStorageSet('article-drafts', JSON.stringify(updatedDrafts))
      const currentDraftSuccess = safeLocalStorageSet('article-draft', JSON.stringify(draftData))
      
      if (draftsSuccess && currentDraftSuccess) {
        handleSuccess('Brouillon sauvegardé avec succès!')
      } else if (currentDraftSuccess) {
        // Si on a pu sauvegarder au moins le brouillon actuel
        handleSuccess('Brouillon sauvegardé (anciens brouillons supprimés pour libérer de l\'espace)')
      } else {
        // En dernier recours, essayer avec un brouillon minimal
        const minimalDraft = {
          id: draftId,
          title: formData.title || '',
          description: formData.description || '',
          category: formData.category || '',
          price: formData.price || '',
          condition: formData.condition || '',
          images: uploadedImages.slice(0, 2), // Seulement 2 images
          savedAt: new Date().toISOString()
        }
        
        if (safeLocalStorageSet('article-draft', JSON.stringify(minimalDraft))) {
          handleSuccess('Brouillon sauvegardé (version allégée - espace de stockage limité)')
        } else {
          throw new Error('Espace de stockage insuffisant')
        }
      }
      
    } catch {
      handleError(new Error('Impossible de sauvegarder le brouillon - espace de stockage insuffisant. Veuillez supprimer des brouillons existants dans la section "Mes brouillons".'), 'Sauvegarde du brouillon')
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
    if (uploadedImages.length === 0) {
      handleError(new Error('Veuillez ajouter au moins une photo de votre article.'), 'Validation')
      return
    }

    // Si c'est une modification, procéder normalement
    if (isEditing) {
      setIsSubmitting(true)
      try {
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

        const response = await fetch(`/api/articles/${editId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(articleData)
        })

        const result = await response.json()

        if (!response.ok) {
          throw new Error(result.error || 'Erreur lors de la mise à jour de l\'article')
        }

        handleSuccess('Votre article a été mis à jour avec succès!')
        delayedLocationChange('/seller/articles', 3000)
        
      } catch (error) {
        handleError(error, 'Mise à jour de l\'article')
      } finally {
        setIsSubmitting(false)
      }
      return
    }

    // Pour une nouvelle publication, afficher les options de paiement
    setShowPayment(true)
  }

  const handlePaymentSuccess = async (paymentMethod: string, transactionId: string) => {
    setIsSubmitting(true)

    try {
      const data = form.getValues()
      const totalAmount = BASE_PUBLICATION_FEE + promotionCost
      
      const articleData = {
        title: data.title,
        description: data.description,
        category: data.category,
        price: data.price,
        condition: data.condition,
        size: data.size,
        brand: data.brand,
        color: data.color,
        images: uploadedImages,
        paymentData: {
          method: paymentMethod,
          amount: totalAmount,
          transactionId,
          promotions: selectedPromotions
        }
      }

      const response = await fetch('/api/articles', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(articleData)
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Erreur lors de la publication de l\'article')
      }

      // Clear localStorage draft
      localStorage.removeItem('article-draft')
      
      setPaymentCompleted(true)
      handleSuccess('Paiement effectué! Votre article est en cours de modération.')
      
      // Redirect after success
      setTimeout(() => {
        delayedLocationChange('/seller/articles')
      }, 3000)
      
    } catch (error) {
      handleError(error, 'Publication de l\'article')
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
                  Attire l'œil des acheteurs : utilise des photos de qualité.
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

            {/* Information sur la modération */}
            {!isEditing && (
              <Card className="border-blue-200 bg-blue-50">
                <CardHeader className="bg-blue-100/50">
                  <CardTitle className="text-blue-900 flex items-center gap-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Processus de modération
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="space-y-3 text-sm text-blue-800">
                    <p className="font-medium">📋 Votre article sera examiné avant publication :</p>
                    <ul className="space-y-2 ml-4">
                      <li className="flex items-start gap-2">
                        <span className="text-blue-600">•</span>
                        <span>Après paiement, votre article sera <strong>en attente de modération</strong></span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-blue-600">•</span>
                        <span>Notre équipe vérifiera la qualité des photos et la conformité</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-blue-600">•</span>
                        <span>Une fois approuvé, votre article sera visible sur la plateforme</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-blue-600">•</span>
                        <span>Vous pouvez suivre le statut dans la section "Mes Articles"</span>
                      </li>
                    </ul>
                    <p className="text-xs text-blue-600 mt-3">
                      ⏱️ Délai de modération : généralement sous 24h
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}

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
                          J'accepte les conditions d'utilisation de Boudoir du Boubou
                        </FormLabel>
                        <FormDescription className="text-boudoir-beige-700">
                          En cochant cette case, je confirme que je respecte les règles de la plateforme Boudoir du Boubou et que les informations fournies sont exactes. Je m'engage à vendre des articles authentiques et en bon état.
                        </FormDescription>
                        <FormMessage />
                      </div>
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* Options de promotion et récapitulatif des frais */}
            {!isEditing && (
              <>
                <PromotionOptions
                  selectedPromotions={selectedPromotions}
                  onPromotionChange={setSelectedPromotions}
                  onCostChange={setPromotionCost}
                />
                
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-blue-900 mb-2">Récapitulatif des frais</h3>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span>Frais de publication:</span>
                      <span>{BASE_PUBLICATION_FEE} FCFA</span>
                    </div>
                    {promotionCost > 0 && (
                      <div className="flex justify-between">
                        <span>Options de promotion:</span>
                        <span>{promotionCost} FCFA</span>
                      </div>
                    )}
                    <div className="flex justify-between font-semibold border-t pt-1">
                      <span>Total:</span>
                      <span>{BASE_PUBLICATION_FEE + promotionCost} FCFA</span>
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* Composant de paiement */}
            {showPayment && !paymentCompleted && (
              <PaymentSelection
                amount={BASE_PUBLICATION_FEE + promotionCost}
                onPaymentSuccess={handlePaymentSuccess}
                onCancel={() => setShowPayment(false)}
                isProcessing={isSubmitting}
              />
            )}

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