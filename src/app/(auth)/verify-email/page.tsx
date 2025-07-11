'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Icons } from '@/components/ui/icons'
import { CheckCircle, AlertCircle, Phone, ArrowLeft } from 'lucide-react'

export default function VerifyPhonePage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get('token')
  const phone = searchParams.get('phone')
  
  const [isLoading, setIsLoading] = useState(false)
  const [isVerifying, setIsVerifying] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [isVerified, setIsVerified] = useState(false)

  // Vérifier automatiquement le téléphone si un token est présent
  useEffect(() => {
    const verifyPhone = async (verificationToken: string) => {
      setIsVerifying(true)
      setMessage(null)

      try {
        const response = await fetch('/api/auth/verify-phone', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ token: verificationToken }),
        })

        const result = await response.json()

        if (!response.ok) {
          throw new Error(result.message || 'Erreur lors de la vérification')
        }

        setIsVerified(true)
        setMessage({
          type: 'success',
          text: 'Numéro de téléphone vérifié avec succès ! Vous pouvez maintenant vous connecter.',
        })

        // Rediriger vers la page de connexion après 3 secondes
        setTimeout(() => {
          router.push('/login?message=phone-verified')
        }, 3000)
      } catch (error) {
        setMessage({
          type: 'error',
          text: error instanceof Error ? error.message : 'Une erreur est survenue',
        })
      } finally {
        setIsVerifying(false)
      }
    }

    if (token) {
      verifyPhone(token)
    }
  }, [token, router])



  const resendVerificationSMS = async () => {
    if (!phone) {
      setMessage({
        type: 'error',
        text: 'Numéro de téléphone manquant',
      })
      return
    }

    setIsLoading(true)
    setMessage(null)

    try {
      const response = await fetch('/api/auth/resend-verification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ phone }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.message || 'Erreur lors de l&apos;envoi')
      }

      setMessage({
        type: 'success',
        text: 'SMS de vérification renvoyé avec succès.',
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

  if (isVerifying) {
    return (
      <div className="container flex h-screen w-screen flex-col items-center justify-center">
        <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[400px]">
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col items-center space-y-4">
                <Icons.spinner className="h-8 w-8 animate-spin" />
                <div className="text-center">
                  <h3 className="text-lg font-medium">Vérification en cours...</h3>
                  <p className="text-sm text-muted-foreground">
                    Veuillez patienter pendant que nous vérifions votre numéro.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
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
              {isVerified ? 'Téléphone vérifié' : 'Vérification de téléphone'}
            </CardTitle>
            <CardDescription className="text-center">
              {isVerified
                ? 'Votre numéro de téléphone a été vérifié avec succès'
                : token
                ? 'Vérification de votre numéro de téléphone en cours...'
                : 'Vérifiez votre téléphone pour confirmer votre numéro'}
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

            {isVerified ? (
              <div className="space-y-4">
                <div className="flex items-center justify-center p-4 bg-green-50 dark:bg-green-950 rounded-lg">
                  <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
                </div>
                
                <div className="text-center space-y-2">
                  <p className="text-sm text-muted-foreground">
                    Vous allez être redirigé vers la page de connexion...
                  </p>
                </div>

                <Button asChild className="w-full">
                  <Link href="/login">Se connecter maintenant</Link>
                </Button>
              </div>
            ) : !token ? (
              <div className="space-y-4">
                <div className="flex items-center justify-center p-4 bg-blue-50 dark:bg-blue-950 rounded-lg">
                  <Phone className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                </div>
                
                <div className="text-center space-y-2">
                  <p className="text-sm text-muted-foreground">
                    Un SMS de vérification a été envoyé à votre numéro.
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Le SMS peut prendre quelques minutes à arriver.
                  </p>
                </div>

                {phone && (
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full"
                    onClick={resendVerificationSMS}
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
                        Renvoi...
                      </>
                    ) : (
                      'Renvoyer le SMS de vérification'
                    )}
                  </Button>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-center p-4 bg-red-50 dark:bg-red-950 rounded-lg">
                  <AlertCircle className="h-8 w-8 text-red-600 dark:text-red-400" />
                </div>
                
                <div className="text-center space-y-2">
                  <p className="text-sm text-muted-foreground">
                    Le lien de vérification est invalide ou a expiré.
                  </p>
                </div>

                {phone && (
                  <Button
                    type="button"
                    className="w-full"
                    onClick={resendVerificationSMS}
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
                        Renvoi...
                      </>
                    ) : (
                      'Demander un nouveau lien'
                    )}
                  </Button>
                )}
              </div>
            )}
          </CardContent>

          <CardFooter>
            <div className="text-center text-sm text-muted-foreground w-full">
              Besoin d&apos;aide ?{' '}
              <Link href="/contact" className="font-medium text-primary hover:underline">
                Contactez-nous
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