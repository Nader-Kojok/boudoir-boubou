'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import Image from 'next/image'
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
  const [uploadedImages, setUploadedImages] = useState<string[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      description: '',
      price: '',
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

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true)
    try {
      // Ici, vous ajouteriez la logique pour envoyer les données au serveur
      console.log('Données du formulaire:', data)
      console.log('Images uploadées:', uploadedImages)
      
      // Simulation d'un délai d'envoi
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Redirection ou message de succès
      alert('Votre article a été publié avec succès!')
    } catch (error) {
      console.error('Erreur lors de la publication:', error)
      alert('Une erreur est survenue. Veuillez réessayer.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-boudoir-beige-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-boudoir-beige-900 mb-2">
            Vends ton article
          </h1>
          <p className="text-boudoir-beige-700">
            Remplis ce formulaire pour mettre en vente ton vêtement sur Le Boudoir du BouBou
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
                            {categories.map((category) => (
                              <SelectItem key={category.value} value={category.value}>
                                {category.label}
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
                            €
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
                className="border-boudoir-beige-300 text-boudoir-beige-700 hover:bg-boudoir-beige-100"
              >
                Sauvegarder le brouillon
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="bg-boudoir-vert-eau-500 hover:bg-boudoir-vert-eau-600 text-white"
              >
                {isSubmitting ? 'Publication...' : 'Ajouter'}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  )
}