import { getSession } from '@/lib/auth-utils'
import { redirect } from 'next/navigation'
import { ReactNode } from 'react'
import Link from 'next/link'
import { ModeratorNavigation } from '@/components/moderator/moderator-navigation'

interface ModeratorLayoutProps {
  children: ReactNode
}

export default async function ModeratorLayout({ children }: ModeratorLayoutProps) {
  const session = await getSession()
  
  if (!session) {
    redirect('/login')
  }

  // Vérifier si l'utilisateur a le rôle de modérateur
  if (session.user?.role !== 'MODERATOR') {
    redirect('/dashboard')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="border-b bg-white">
        <div className="container mx-auto px-4">
          <nav className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-8">
              <h2 className="text-xl font-semibold text-gray-900">Modération</h2>
              <ModeratorNavigation />
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