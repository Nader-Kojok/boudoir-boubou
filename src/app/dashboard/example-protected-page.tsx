import { redirect } from 'next/navigation'
import { getSession, hasRole } from '@/lib/auth-utils'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

/**
 * Exemple de page protégée utilisant NextAuth.js côté serveur
 * Cette page démontre les bonnes pratiques pour l'authentification
 */
export default async function ExampleProtectedPage() {
  // Récupérer la session côté serveur
  const session = await getSession()
  
  // Rediriger si non authentifié
  if (!session?.user) {
    redirect('/auth/signin')
  }

  // Vérifier les permissions (exemple)
  const isSeller = await hasRole('SELLER')
  const isBuyer = await hasRole('BUYER')

  return (
    <div className="container mx-auto py-8">
      <Card>
        <CardHeader>
          <CardTitle>Page Protégée - Exemple</CardTitle>
          <CardDescription>
            Cette page démontre l&apos;utilisation correcte de NextAuth.js côté serveur
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold mb-2">Informations de session</h3>
            <div className="space-y-2">
              <p><strong>Nom:</strong> {session.user.name}</p>
              <p><strong>Email:</strong> {session.user.email}</p>
              <p><strong>ID:</strong> {session.user.id}</p>
              <div className="flex items-center gap-2">
                <strong>Rôle:</strong>
                <Badge variant={isSeller ? 'default' : 'secondary'}>
                  {session.user.role}
                </Badge>
              </div>
            </div>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-2">Permissions</h3>
            <div className="space-y-1">
              <p>✅ Accès aux pages protégées</p>
              <p>{isSeller ? '✅' : '❌'} Accès vendeur</p>
              <p>{isBuyer ? '✅' : '❌'} Accès acheteur</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}