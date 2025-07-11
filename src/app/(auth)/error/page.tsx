'use client'

import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { AlertCircle, ArrowLeft } from 'lucide-react'

const errorMessages = {
  Configuration: 'Il y a un problème avec la configuration du serveur.',
  AccessDenied: 'Vous n&apos;avez pas l&apos;autorisation d&apos;accéder à cette ressource.',
  Verification: 'Le token de vérification a expiré ou a déjà été utilisé.',
  Default: 'Une erreur inattendue s&apos;est produite.',
  CredentialsSignin: 'Email ou mot de passe incorrect.',
  EmailSignin: 'Impossible d&apos;envoyer l&apos;email de connexion.',
  OAuthSignin: 'Erreur lors de la connexion avec le fournisseur OAuth.',
  OAuthCallback: 'Erreur lors du callback OAuth.',
  OAuthCreateAccount: 'Impossible de créer le compte OAuth.',
  EmailCreateAccount: 'Impossible de créer le compte avec cet email.',
  Callback: 'Erreur lors du callback d&apos;authentification.',
  OAuthAccountNotLinked: 'Pour confirmer votre identité, connectez-vous avec le même compte que vous avez utilisé à l&apos;origine.',
  SessionRequired: 'Veuillez vous connecter pour accéder à cette page.',
}

export default function AuthErrorPage() {
  const searchParams = useSearchParams()
  const error = searchParams.get('error') as keyof typeof errorMessages
  
  const errorMessage = errorMessages[error] || errorMessages.Default
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 to-purple-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center text-destructive">
              Erreur d&apos;authentification
            </CardTitle>
          <CardDescription className="text-center">
            Un problème est survenu lors de la connexion
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {errorMessage}
            </AlertDescription>
          </Alert>
          
          {error === 'OAuthAccountNotLinked' && (
            <div className="text-sm text-muted-foreground space-y-2">
              <p>
                Il semble que vous ayez déjà un compte avec cette adresse email 
                mais avec un autre fournisseur d&apos;authentification.
              </p>
              <p>
                Essayez de vous connecter avec la méthode que vous avez utilisée 
                lors de votre première inscription.
              </p>
            </div>
          )}
          
          {error === 'CredentialsSignin' && (
            <div className="text-sm text-muted-foreground">
              <p>
                Vérifiez votre email et votre mot de passe, puis réessayez.
              </p>
            </div>
          )}
        </CardContent>

        <CardFooter className="flex flex-col space-y-2">
          <Button asChild className="w-full">
            <Link href="/login">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Retour à la connexion
            </Link>
          </Button>
          
          <Button variant="outline" asChild className="w-full">
            <Link href="/register">
              Créer un nouveau compte
            </Link>
          </Button>
          
          <Button variant="ghost" asChild className="w-full">
            <Link href="/">
              Retour à l&apos;accueil
            </Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}