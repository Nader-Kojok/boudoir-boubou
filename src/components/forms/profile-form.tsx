"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Icons } from "@/components/ui/icons"
import { User, Phone, AlertCircle, CheckCircle, ShoppingBag, Store } from "lucide-react"
import type { UserRole } from "@prisma/client"
import { handleError } from "@/hooks/use-notifications"
import { delayedRefresh } from "@/utils/delayed-navigation"
import { validateImageFile, convertToBase64 } from "@/lib/image-validation"

const profileSchema = z.object({
  name: z
    .string()
    .min(1, "Le nom est requis")
    .min(2, "Le nom doit contenir au moins 2 caractères")
    .max(50, "Le nom ne peut pas dépasser 50 caractères"),
  phone: z
    .string()
    .min(1, "Le téléphone est requis")
    .regex(
      /^(\+221|221)?[0-9]{9}$/,
      "Format de numéro invalide (ex: +221771234567 ou 771234567)"
    ),
  role: z.enum(["SELLER", "BUYER", "ADMIN"], {
    required_error: "Veuillez sélectionner un rôle",
  }),
  image: z.string().optional(),
  bannerImage: z.string().optional(),
})

type ProfileInput = z.infer<typeof profileSchema>

interface ProfileFormProps {
  user: {
    id: string
    name: string | null
    phone: string
    role: UserRole
    image?: string | null
    bannerImage?: string | null
  }
}

export function ProfileForm({ user }: ProfileFormProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(user.image || null)
  const [bannerPreview, setBannerPreview] = useState<string | null>(user.bannerImage || null)

  // Handle image upload
   const handleImageUpload = async (file: File, type: 'image' | 'bannerImage') => {
     try {
       // Validate image file using centralized validation
       const validation = await validateImageFile(file)
       if (!validation.isValid) {
         setMessage({ type: 'error', text: validation.error || 'Fichier invalide' })
         return
       }

      const base64 = await convertToBase64(file)
      if (type === 'image') {
        setImagePreview(base64)
        setValue('image', base64, { shouldDirty: true })
      } else {
        setBannerPreview(base64)
        setValue('bannerImage', base64, { shouldDirty: true })
      }
      
      // Clear any previous error messages
      setMessage(null)
    } catch (error) {
      handleError(error, 'Téléchargement image')
      setMessage({ type: 'error', text: 'Erreur lors du téléchargement de l&apos;image' })
    }
  }

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isDirty },
  } = useForm<ProfileInput>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user.name || "",
      phone: user.phone,
      role: user.role,
      image: user.image || "",
      bannerImage: user.bannerImage || "",
    },
  })

  const watchRole = watch("role")

  const onSubmit = async (data: ProfileInput) => {
    setIsLoading(true)
    setMessage(null)

    try {
      const response = await fetch("/api/user/profile", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Erreur lors de la mise à jour")
      }

      setMessage({
        type: "success",
        text: "Profil mis à jour avec succès",
      })

      // Rafraîchir la page pour mettre à jour les données après un délai
      delayedRefresh(router, 2000)
    } catch (error) {
      setMessage({
        type: "error",
        text: error instanceof Error ? error.message : "Une erreur est survenue",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" suppressHydrationWarning>
      {message && (
        <Alert variant={message.type === "error" ? "destructive" : "default"}>
          {message.type === "error" ? (
            <AlertCircle className="h-4 w-4" />
          ) : (
            <CheckCircle className="h-4 w-4" />
          )}
          <AlertDescription>{message.text}</AlertDescription>
        </Alert>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="name">Nom complet</Label>
          <div className="relative">
            <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              id="name"
              type="text"
              placeholder="Votre nom complet"
              className="pl-10"
              {...register("name")}
              disabled={isLoading}
            />
          </div>
          {errors.name && (
            <p className="text-sm text-destructive">{errors.name.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="phone">Téléphone</Label>
          <div className="relative">
            <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              id="phone"
              type="tel"
              placeholder="+221771234567"
              className="pl-10"
              {...register("phone")}
              disabled={isLoading}
            />
          </div>
          {errors.phone && (
            <p className="text-sm text-destructive">{errors.phone.message}</p>
          )}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="image">Photo de profil</Label>
          <div className="flex items-center space-x-4">
             {imagePreview && (
               <div className="relative w-20 h-20 rounded-full overflow-hidden border-2 border-gray-200">
                 <Image
                   src={imagePreview}
                   alt="Aperçu photo de profil"
                   fill
                   className="object-cover"
                 />
                 <button
                   type="button"
                   onClick={() => {
                     setImagePreview(null)
                     setValue('image', '', { shouldDirty: true })
                   }}
                   className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600"
                   disabled={isLoading}
                 >
                   ×
                 </button>
               </div>
             )}
            <div className="flex-1">
              <Input
                id="image"
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  if (file) {
                    handleImageUpload(file, 'image')
                  }
                }}
                className="cursor-pointer"
                disabled={isLoading}
              />
              <p className="text-xs text-gray-500 mt-1">
                Formats acceptés: JPG, PNG, GIF (max 5MB)
              </p>
            </div>
          </div>
          {errors.image && (
            <p className="text-sm text-destructive">{errors.image.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="bannerImage">Image de bannière</Label>
          <div className="space-y-2">
             {bannerPreview && (
               <div className="relative w-full h-32 rounded-lg overflow-hidden border-2 border-gray-200">
                 <Image
                   src={bannerPreview}
                   alt="Aperçu image de bannière"
                   fill
                   className="object-cover"
                 />
                 <button
                   type="button"
                   onClick={() => {
                     setBannerPreview(null)
                     setValue('bannerImage', '', { shouldDirty: true })
                   }}
                   className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600"
                   disabled={isLoading}
                 >
                   ×
                 </button>
               </div>
             )}
            <div>
              <Input
                id="bannerImage"
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  if (file) {
                    handleImageUpload(file, 'bannerImage')
                  }
                }}
                className="cursor-pointer"
                disabled={isLoading}
              />
              <p className="text-xs text-gray-500 mt-1">
                Formats acceptés: JPG, PNG, GIF (max 5MB)
              </p>
            </div>
          </div>
          {errors.bannerImage && (
            <p className="text-sm text-destructive">{errors.bannerImage.message}</p>
          )}
        </div>
      </div>

      <div className="space-y-3">
        <Label>Type de compte</Label>
        <RadioGroup
          value={watchRole}
          onValueChange={(value) => setValue("role", value as "BUYER" | "SELLER" | "ADMIN", { shouldDirty: true })}
          className="grid grid-cols-1 gap-3 md:grid-cols-2"
        >
          <div className="flex items-center space-x-3 border rounded-lg p-3 hover:bg-accent">
            <RadioGroupItem value="BUYER" id="buyer-profile" />
            <div className="flex items-center space-x-2">
              <ShoppingBag className="h-4 w-4 text-primary" />
              <div>
                <Label htmlFor="buyer-profile" className="font-medium cursor-pointer">
                  Acheteur
                </Label>
                <p className="text-xs text-muted-foreground">
                  Découvrir et acheter de la lingerie
                </p>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-3 border rounded-lg p-3 hover:bg-accent">
            <RadioGroupItem value="SELLER" id="seller-profile" />
            <div className="flex items-center space-x-2">
              <Store className="h-4 w-4 text-primary" />
              <div>
                <Label htmlFor="seller-profile" className="font-medium cursor-pointer">
                  Vendeur
                </Label>
                <p className="text-xs text-muted-foreground">
                  Créer une boutique et vendre
                </p>
              </div>
            </div>
          </div>
        </RadioGroup>
        {errors.role && (
          <p className="text-sm text-destructive">{errors.role.message}</p>
        )}
      </div>

      <div className="flex justify-end space-x-2">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
          disabled={isLoading}
        >
          Annuler
        </Button>
        <Button
          type="submit"
          disabled={isLoading || !isDirty}
        >
          {isLoading ? (
            <>
              <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
              Mise à jour...
            </>
          ) : (
            "Sauvegarder"
          )}
        </Button>
      </div>
    </form>
  )
}