'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'

import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Checkbox } from '@/components/ui/checkbox'
import { Icons } from '@/components/ui/icons'
import { registerSchema, type RegisterInput } from '@/lib/validations/auth'
import { Eye, EyeOff, Phone, Lock, User, AlertCircle, ShoppingBag, Store } from 'lucide-react'
import { delayedPush } from '@/utils/delayed-navigation'

export default function RegisterPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [authError, setAuthError] = useState('')

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      role: 'BUYER',
      acceptTerms: false,
    },
  })

  const watchRole = watch('role')
  const watchAcceptTerms = watch('acceptTerms')

  const onSubmit = async (data: RegisterInput) => {
    setIsLoading(true)
    setAuthError('')

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: data.name,
          phone: data.phone,
          password: data.password,
          confirmPassword: data.confirmPassword,
          role: data.role,
          acceptTerms: data.acceptTerms,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Erreur lors de l\'inscription')
      }

      // Connexion automatique après inscription
      const result = await signIn('credentials', {
        phone: data.phone,
        password: data.password,
        redirect: false,
      })

      if (result?.error) {
        setAuthError('Inscription réussie, mais erreur de connexion automatique')
        delayedPush(router, '/login', 2000)
      } else {
        delayedPush(router, '/dashboard', 2000, true)
      }
    } catch (error) {
      setAuthError(error instanceof Error ? error.message : 'Une erreur est survenue')
    } finally {
      setIsLoading(false)
    }
  }



  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 py-12 px-4 flex justify-center">
      <Card className="w-full max-w-lg">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">
            Inscription
          </CardTitle>
          <CardDescription className="text-center">
            Créez votre compte Boudoir du Boubou
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {authError && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{authError}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" suppressHydrationWarning>
            <div className="space-y-2">
              <Label htmlFor="name">Nom complet</Label>
              <div className="relative">
                <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="name"
                  type="text"
                  placeholder="Votre nom complet"
                  className="pl-10"
                  {...register('name')}
                  disabled={isLoading}
                />
              </div>
              {errors.name && (
                <p className="text-sm text-destructive">{errors.name.message}</p>
              )}
            </div>

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

            <div className="space-y-2">
              <Label htmlFor="password">Mot de passe</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  className="pl-10 pr-10"
                  {...register('password')}
                  disabled={isLoading}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isLoading}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
              {errors.password && (
                <p className="text-sm text-destructive">{errors.password.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirmer le mot de passe</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  className="pl-10 pr-10"
                  {...register('confirmPassword')}
                  disabled={isLoading}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  disabled={isLoading}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
              {errors.confirmPassword && (
                <p className="text-sm text-destructive">{errors.confirmPassword.message}</p>
              )}
            </div>

            <div className="space-y-3">
              <Label>Je souhaite :</Label>
              <RadioGroup
                value={watchRole}
                onValueChange={(value) => setValue('role', value as 'BUYER' | 'SELLER')}
                className="grid grid-cols-1 gap-3"
              >
                <div className="flex items-center space-x-3 border rounded-lg p-3 hover:bg-accent">
                  <RadioGroupItem value="BUYER" id="buyer" />
                  <div className="flex items-center space-x-2">
                    <ShoppingBag className="h-4 w-4 text-primary" />
                    <div>
                      <Label htmlFor="buyer" className="font-medium cursor-pointer">
                        Acheter des articles
                      </Label>
                      <p className="text-xs text-muted-foreground">
                        Découvrir et acheter de la lingerie d&apos;occasion
                      </p>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-3 border rounded-lg p-3 hover:bg-accent">
                  <RadioGroupItem value="SELLER" id="seller" />
                  <div className="flex items-center space-x-2">
                    <Store className="h-4 w-4 text-primary" />
                    <div>
                      <Label htmlFor="seller" className="font-medium cursor-pointer">
                        Vendre mes articles
                      </Label>
                      <p className="text-xs text-muted-foreground">
                        Créer une boutique et vendre ma lingerie
                      </p>
                    </div>
                  </div>
                </div>
              </RadioGroup>
              {errors.role && (
                <p className="text-sm text-destructive">{errors.role.message}</p>
              )}
            </div>

            <div className="flex items-start space-x-3">
              <Checkbox
                id="acceptTerms"
                checked={watchAcceptTerms}
                onCheckedChange={(checked) => setValue('acceptTerms', checked as boolean)}
                disabled={isLoading}
                className="mt-1 flex-shrink-0"
              />
              <div className="flex-1">
                <Label htmlFor="acceptTerms" className="text-sm cursor-pointer leading-relaxed block">
                  J&apos;accepte les{' '}
                  <Link href="/terms" className="text-primary hover:underline">
                    conditions d&apos;utilisation
                  </Link>{' '}
                  et la{' '}
                  <Link href="/privacy" className="text-primary hover:underline">
                    politique de confidentialité
                  </Link>
                </Label>
              </div>
            </div>
            {errors.acceptTerms && (
              <p className="text-sm text-destructive">{errors.acceptTerms.message}</p>
            )}

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
                  Création du compte...
                </>
              ) : (
                'Créer mon compte'
              )}
            </Button>
          </form>


        </CardContent>

        <CardFooter>
          <p className="text-center text-sm text-muted-foreground w-full">
            Déjà un compte ?{' '}
            <Link href="/login" className="text-primary hover:underline">
              Se connecter
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  )
}