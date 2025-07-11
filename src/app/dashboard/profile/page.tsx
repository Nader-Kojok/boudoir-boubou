import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { ProfileForm } from '@/components/forms/profile-form'
import { ChangePasswordForm } from '@/components/forms/change-password-form'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { User, Calendar, Shield } from 'lucide-react'

export default async function ProfilePage() {
  const session = await getServerSession(authOptions)
  
  if (!session?.user) {
    redirect('/login')
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      name: true,
      phone: true,
      image: true,
      role: true,
      createdAt: true,
      phoneVerified: true,
    },
  })

  if (!user) {
    redirect('/login')
  }

  return (
    <div className="container mx-auto py-8 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Mon Profil</h1>
          <p className="text-muted-foreground">
            Gérez vos informations personnelles et paramètres de compte
          </p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Informations du profil */}
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Informations du compte
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex flex-col items-center space-y-4">
              <Avatar className="h-20 w-20">
                <AvatarImage src={user.image || ''} alt={user.name || ''} />
                <AvatarFallback className="text-lg">
                  {user.name?.charAt(0).toUpperCase() || 'U'}
                </AvatarFallback>
              </Avatar>
              <div className="text-center">
                <h3 className="font-semibold text-lg">{user.name}</h3>
                <p className="text-sm text-muted-foreground">{user.phone}</p>
              </div>
            </div>

            <Separator />

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Rôle</span>
                <Badge variant={user.role === 'SELLER' ? 'default' : 'secondary'}>
                  {user.role === 'SELLER' ? 'Vendeur' : 'Acheteur'}
                </Badge>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Téléphone vérifié</span>
                <Badge variant={user.phoneVerified ? 'default' : 'destructive'}>
                  {user.phoneVerified ? 'Vérifié' : 'Non vérifié'}
                </Badge>
              </div>
              
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="h-4 w-4" />
                <span>Membre depuis {new Date(user.createdAt).toLocaleDateString('fr-FR')}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Formulaire de modification */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Modifier mes informations</CardTitle>
            <CardDescription>
              Mettez à jour vos informations personnelles
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ProfileForm user={user} />
          </CardContent>
        </Card>
      </div>

      {/* Paramètres de sécurité */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Sécurité du compte
          </CardTitle>
          <CardDescription>
            Gérez la sécurité de votre compte
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <ChangePasswordForm />
          
          <Separator />
          
          <div className="space-y-2">
            <h4 className="font-medium">Authentification à deux facteurs</h4>
            <p className="text-sm text-muted-foreground">
              Ajoutez une couche de sécurité supplémentaire
            </p>
            {/* TODO: Ajouter la configuration 2FA */}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}