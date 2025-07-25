import { getSession } from '@/lib/auth-utils'
import { redirect } from 'next/navigation'
import { ReactNode } from 'react'
import Link from 'next/link'

interface BuyerLayoutProps {
  children: ReactNode
}

export default async function BuyerLayout({ children }: BuyerLayoutProps) {
  const session = await getSession()
  
  if (!session) {
    redirect('/login')
  }

  // Vérifier si l'utilisateur a le rôle d'acheteur, vendeur ou admin
  // Les vendeurs peuvent aussi être acheteurs et accéder aux favoris
  if (session.user?.role !== 'BUYER' && session.user?.role !== 'ADMIN' && session.user?.role !== 'SELLER') {
    redirect('/dashboard')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="border-b bg-white">
        <div className="container mx-auto px-4">
          <nav className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-8">
              <h2 className="text-xl font-semibold text-gray-900">Espace Acheteur</h2>
              <div className="hidden md:flex space-x-6">
                <Link href="/buyer" className="text-gray-600 hover:text-gray-900 px-3 py-2 text-sm font-medium">
                  Tableau de bord
                </Link>
                <Link href="/buyer/favoris" className="text-gray-600 hover:text-gray-900 px-3 py-2 text-sm font-medium">
                  Mes favoris
                </Link>
                <Link href="/catalogue" className="text-gray-600 hover:text-gray-900 px-3 py-2 text-sm font-medium">
                  Catalogue
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
      <main className="container mx-auto px-4 py-8">
        {children}
      </main>
    </div>
  )
}