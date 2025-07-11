"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Icons } from "@/components/ui/icons"
import { Lock, Eye, EyeOff, AlertCircle, CheckCircle } from "lucide-react"

const changePasswordSchema = z.object({
  currentPassword: z
    .string()
    .min(1, "Le mot de passe actuel est requis"),
  newPassword: z
    .string()
    .min(8, "Le mot de passe doit contenir au moins 8 caractères")
    .regex(/[A-Z]/, "Le mot de passe doit contenir au moins une lettre majuscule")
    .regex(/[a-z]/, "Le mot de passe doit contenir au moins une lettre minuscule")
    .regex(/\d/, "Le mot de passe doit contenir au moins un chiffre")
    .regex(/[^\w\s]/, "Le mot de passe doit contenir au moins un caractère spécial"),
  confirmNewPassword: z
    .string()
    .min(1, "La confirmation du mot de passe est requise"),
}).refine((data) => data.newPassword === data.confirmNewPassword, {
  message: "Les mots de passe ne correspondent pas",
  path: ["confirmNewPassword"],
})

type ChangePasswordInput = z.infer<typeof changePasswordSchema>

export function ChangePasswordForm() {
  const [isLoading, setIsLoading] = useState(false)
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm<ChangePasswordInput>({
    resolver: zodResolver(changePasswordSchema),
  })

  const newPassword = watch("newPassword")

  const onSubmit = async (data: ChangePasswordInput) => {
    setIsLoading(true)
    setMessage(null)

    try {
      const response = await fetch("/api/user/change-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          currentPassword: data.currentPassword,
          newPassword: data.newPassword,
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.message || "Erreur lors du changement de mot de passe")
      }

      setMessage({
        type: "success",
        text: "Mot de passe modifié avec succès",
      })

      // Réinitialiser le formulaire
      reset()
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
    <Card>
      <CardHeader>
        <CardTitle>Changer le mot de passe</CardTitle>
        <CardDescription>
          Modifiez votre mot de passe pour sécuriser votre compte
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" suppressHydrationWarning>
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

          <div className="space-y-2">
            <Label htmlFor="currentPassword">Mot de passe actuel</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="currentPassword"
                type={showCurrentPassword ? "text" : "password"}
                placeholder="Votre mot de passe actuel"
                className="pl-10 pr-10"
                {...register("currentPassword")}
                disabled={isLoading}
              />
              <button
                type="button"
                className="absolute right-3 top-3 text-muted-foreground hover:text-foreground"
                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
              >
                {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {errors.currentPassword && (
              <p className="text-sm text-destructive">{errors.currentPassword.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="newPassword">Nouveau mot de passe</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="newPassword"
                type={showNewPassword ? "text" : "password"}
                placeholder="Votre nouveau mot de passe"
                className="pl-10 pr-10"
                {...register("newPassword")}
                disabled={isLoading}
              />
              <button
                type="button"
                className="absolute right-3 top-3 text-muted-foreground hover:text-foreground"
                onClick={() => setShowNewPassword(!showNewPassword)}
              >
                {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {errors.newPassword && (
              <p className="text-sm text-destructive">{errors.newPassword.message}</p>
            )}
            {newPassword && (
              <div className="text-xs text-muted-foreground space-y-1">
                <p className={newPassword.length >= 8 ? "text-green-600" : ""}>
                  ✓ Au moins 8 caractères
                </p>
                <p className={/[A-Z]/.test(newPassword) ? "text-green-600" : ""}>
                  ✓ Une lettre majuscule
                </p>
                <p className={/[a-z]/.test(newPassword) ? "text-green-600" : ""}>
                  ✓ Une lettre minuscule
                </p>
                <p className={/\d/.test(newPassword) ? "text-green-600" : ""}>
                  ✓ Un chiffre
                </p>
                <p className={/[^\w\s]/.test(newPassword) ? "text-green-600" : ""}>
                  ✓ Un caractère spécial
                </p>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmNewPassword">Confirmer le nouveau mot de passe</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="confirmNewPassword"
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Confirmez votre nouveau mot de passe"
                className="pl-10 pr-10"
                {...register("confirmNewPassword")}
                disabled={isLoading}
              />
              <button
                type="button"
                className="absolute right-3 top-3 text-muted-foreground hover:text-foreground"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {errors.confirmNewPassword && (
              <p className="text-sm text-destructive">{errors.confirmNewPassword.message}</p>
            )}
          </div>

          <div className="flex justify-end">
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
                  Modification...
                </>
              ) : (
                "Changer le mot de passe"
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}