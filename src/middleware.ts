import { withAuth } from 'next-auth/middleware'
import { NextResponse } from 'next/server'
import { checkHeaderSize, logCookieInfo, clearAuthCookies } from '@/lib/cookie-utils'

export default withAuth(
  function middleware(req) {
    const { pathname } = req.nextUrl
    const token = req.nextauth.token

    // Check for large headers and log cookie info in development
    logCookieInfo(req)
    
    // If headers are too large, clear auth cookies and redirect to login
    if (checkHeaderSize(req)) {
      console.warn('Headers too large, clearing auth cookies')
      const response = NextResponse.redirect(new URL('/login?error=HeaderTooLarge', req.url))
      return clearAuthCookies(response)
    }

    // Vérifier les permissions basées sur les rôles pour les routes dashboard
    if (pathname.startsWith('/seller') && token?.role !== 'SELLER') {
      return NextResponse.redirect(new URL('/dashboard', req.url))
    }

    if (pathname.startsWith('/buyer') && token?.role !== 'BUYER') {
      return NextResponse.redirect(new URL('/dashboard', req.url))
    }

    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const { pathname } = req.nextUrl
        
        // Permettre l'accès aux routes publiques
        if (!pathname.startsWith('/dashboard') && !pathname.startsWith('/seller') && !pathname.startsWith('/buyer')) {
          return true
        }
        
        // Exiger une authentification pour les routes du dashboard, seller et buyer
        return !!token
      },
    },
  }
)

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (all API routes including NextAuth)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     * - login, register, error pages (auth pages)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|public|login|register|error|forgot-password|reset-password|verify-email).*)',
  ],
}