'use client'

import { useState } from 'react'
import Link from 'next/link'
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
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [smsSent, setSmsSent] = useState(false)

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

      setSmsSent(true)
      setMessage({
        type: 'success',
        text: 'Un SMS de réinitialisation a été envoyé à votre numéro.',
      })
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
    <div className="container flex h-screen w-screen flex-col items-center justify-center">
      <Link
        href="/login"
        className="absolute left-4 top-4 md:left-8 md:top-8 flex items-center text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Retour à la connexion
      </Link>

      <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[400px]">
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