import { withAuth } from 'next-auth/middleware'
import { NextResponse } from 'next/server'

export default withAuth(
  function middleware(req) {
    const { pathname } = req.nextUrl
    const token = req.nextauth.token

    // Rediriger les utilisateurs non authentifiés vers la page de connexion
    if (!token && pathname.startsWith('/dashboard')) {
      return NextResponse.redirect(new URL('/login', req.url))
    }

    // Vérifier les permissions basées sur les rôles
    if (pathname.startsWith('/dashboard/seller') && token?.role !== 'SELLER') {
      return NextResponse.redirect(new URL('/dashboard', req.url))
    }

    if (pathname.startsWith('/dashboard/buyer') && token?.role !== 'BUYER') {
      return NextResponse.redirect(new URL('/dashboard', req.url))
    }

    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const { pathname } = req.nextUrl
        
        // Permettre l'accès aux routes publiques
        if (!pathname.startsWith('/dashboard')) {
          return true
        }
        
        // Exiger une authentification pour les routes du dashboard
        return !!token
      },
    },
  }
)

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api/auth (NextAuth.js routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!api/auth|_next/static|_next/image|favicon.ico|public).*)',
  ],
}