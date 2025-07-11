"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
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
})

type ProfileInput = z.infer<typeof profileSchema>

interface ProfileFormProps {
  user: {
    id: string
    name: string | null
    phone: string
    role: UserRole
  }
}

export function ProfileForm({ user }: ProfileFormProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)

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

      // Rafraîchir la page pour mettre à jour les données
      router.refresh()
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