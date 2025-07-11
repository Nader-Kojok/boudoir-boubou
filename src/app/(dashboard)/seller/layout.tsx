import { getSession } from '@/lib/auth-utils'
import { redirect } from 'next/navigation'
import { ReactNode } from 'react'
import Link from 'next/link'

interface SellerLayoutProps {
  children: ReactNode
}

export default async function SellerLayout({ children }: SellerLayoutProps) {
  const session = await getSession()
  
  if (!session) {
    redirect('/login')
  }

  // Vérifier si l'utilisateur a le rôle de vendeur
  // Cette logique peut être adaptée selon votre système d'authentification
  if (session.user?.role !== 'SELLER' && session.user?.role !== 'ADMIN') {
    redirect('/dashboard')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="border-b bg-white">
        <div className="container mx-auto px-4">
          <nav className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-8">
              <h2 className="text-xl font-semibold text-gray-900">Espace Vendeur</h2>
              <div className="hidden md:flex space-x-6">
                <Link href="/seller" className="text-gray-600 hover:text-gray-900 px-3 py-2 text-sm font-medium">
                  Dashboard
                </Link>
                <Link href="/seller/vendre" className="text-gray-600 hover:text-gray-900 px-3 py-2 text-sm font-medium">
                  Vendre
                </Link>
                <Link href="/seller/articles" className="text-gray-600 hover:text-gray-900 px-3 py-2 text-sm font-medium">
                  Mes Articles
                </Link>

                <Link href="/seller/statistiques" className="text-gray-600 hover:text-gray-900 px-3 py-2 text-sm font-medium">
                  Statistiques
                </Link>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/" className="text-gray-600 hover:text-gray-900 text-sm">
                Retour au site
              </Link>
            </div>
          </nav>
        </div>
      </div>
      <main>{children}</main>
    </div>
  )
}