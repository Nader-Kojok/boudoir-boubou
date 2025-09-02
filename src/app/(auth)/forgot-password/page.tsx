'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { forgotPasswordSchema, type ForgotPasswordInput } from '@/lib/validations/auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Icons } from '@/components/ui/icons'
import { Phone, ArrowLeft, CheckCircle, AlertCircle } from 'lucide-react'

export default function ForgotPasswordPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [smsSent, setSmsSent] = useState(false)
  const [developmentResetLink, setDevelopmentResetLink] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors },
    getValues,
  } = useForm<ForgotPasswordInput>({
    resolver: zodResolver(forgotPasswordSchema),
  })

  const onSubmit = async (data: ForgotPasswordInput) => {
    setIsLoading(true)
    setMessage(null)

    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.message || 'Erreur lors de l&apos;envoi du SMS')
      }

      // En mode développement, rediriger directement vers la page de changement de mot de passe
      if (result.resetLink) {
        const url = new URL(result.resetLink)
        const token = url.searchParams.get('token')
        if (token) {
          router.push(`/reset-password?token=${token}`)
          return
        }
      }

      setSmsSent(true)
      setMessage({
        type: 'success',
        text: 'Un SMS de réinitialisation a été envoyé à votre numéro.',
      })
      
      // En mode développement, stocker le lien de réinitialisation
      if (result.resetLink) {
        setDevelopmentResetLink(result.resetLink)
      }
    } catch (error) {
      setMessage({
        type: 'error',
        text: error instanceof Error ? error.message : 'Une erreur est survenue',
      })
    } finally {
      setIsLoading(false)
    }
  }

  const resendSMS = async () => {
    const phone = getValues('phone')
    if (!phone) return

    setIsLoading(true)
    setMessage(null)

    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ phone }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.message || 'Erreur lors de l&apos;envoi du SMS')
      }

      setMessage({
        type: 'success',
        text: 'SMS renvoyé avec succès.',
      })
      
      // En mode développement, mettre à jour le lien de réinitialisation
      if (result.resetLink) {
        setDevelopmentResetLink(result.resetLink)
      }
    } catch (error) {
      setMessage({
        type: 'error',
        text: error instanceof Error ? error.message : 'Une erreur est survenue',
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4">
      <Link
        href="/login"
        className="absolute left-4 top-4 md:left-8 md:top-8 flex items-center text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Retour à la connexion
      </Link>

      <div className="w-full max-w-md space-y-6">
        <Card>
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl text-center">
              {smsSent ? 'SMS envoyé' : 'Mot de passe oublié'}
            </CardTitle>
            <CardDescription className="text-center">
              {smsSent
                ? 'Vérifiez votre téléphone pour réinitialiser votre mot de passe'
                : 'Entrez votre numéro de téléphone pour recevoir un lien de réinitialisation'}
            </CardDescription>
          </CardHeader>

          <CardContent>
            {message && (
              <Alert variant={message.type === 'error' ? 'destructive' : 'default'} className="mb-4">
                {message.type === 'error' ? (
                  <AlertCircle className="h-4 w-4" />
                ) : (
                  <CheckCircle className="h-4 w-4" />
                )}
                <AlertDescription>{message.text}</AlertDescription>
              </Alert>
            )}

            {!smsSent ? (
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" suppressHydrationWarning>
                <div className="space-y-2">
                  <Label htmlFor="phone">Numéro de téléphone</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="+221771234567 ou 771234567"
                      className="pl-10"
                      {...register('phone')}
                      disabled={isLoading}
                    />
                  </div>
                  {errors.phone && (
                    <p className="text-sm text-destructive">{errors.phone.message}</p>
                  )}
                </div>

                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
                      Envoi en cours...
                    </>
                  ) : (
                    'Envoyer le lien de réinitialisation'
                  )}
                </Button>
              </form>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-center p-4 bg-green-50 dark:bg-green-950 rounded-lg">
                  <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
                </div>
                
                <div className="text-center space-y-2">
                  <p className="text-sm text-muted-foreground">
                    Un SMS a été envoyé à <strong>{getValues('phone')}</strong>
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Le SMS peut prendre quelques minutes à arriver.
                  </p>
                </div>

                {/* Mode développement : Afficher le lien direct */}
                {developmentResetLink && (
                  <div className="p-4 bg-blue-50 dark:bg-blue-950 rounded-lg border border-blue-200 dark:border-blue-800">
                    <div className="text-center space-y-3">
                      <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                        🔧 Mode Développement
                      </p>
                      <p className="text-xs text-blue-700 dark:text-blue-300">
                        Cliquez sur le lien ci-dessous pour réinitialiser votre mot de passe directement :
                      </p>
                      <Button
                        asChild
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                      >
                        <a href={developmentResetLink} target="_blank" rel="noopener noreferrer">
                          Réinitialiser le mot de passe
                        </a>
                      </Button>
                    </div>
                  </div>
                )}

                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={resendSMS}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
                      Renvoi...
                    </>
                  ) : (
                    'Renvoyer le SMS'
                  )}
                </Button>
              </div>
            )}
          </CardContent>

          <CardFooter>
            <div className="text-center text-sm text-muted-foreground w-full">
              Vous vous souvenez de votre mot de passe ?{' '}
              <Link href="/login" className="font-medium text-primary hover:underline">
                Se connecter
              </Link>
            </div>
          </CardFooter>
        </Card>

        <div className="text-center text-xs text-muted-foreground">
          Pas encore de compte ?{' '}
          <Link href="/register" className="font-medium text-primary hover:underline">
            S&apos;inscrire
          </Link>
        </div>
      </div>
    </div>
  )
}