import { withAuth } from 'next-auth/middleware'
import { NextResponse } from 'next/server'
import { checkHeaderSize, logCookieInfo, clearAuthCookies } from '@/lib/cookie-utils'

export default withAuth(
  function middleware(req) {
    const { pathname } = req.nextUrl
    const token = req.nextauth.token

    // Enhanced logging for debugging
    console.log('[Middleware] Request details:', {
      pathname,
      hasToken: !!token,
      tokenSub: token?.sub,
      tokenRole: token?.role,
      environment: process.env.NODE_ENV,
      userAgent: req.headers.get('user-agent')?.substring(0, 50),
      referer: req.headers.get('referer'),
      timestamp: new Date().toISOString()
    })

    // Check for large headers and log cookie info in development
    logCookieInfo(req)
    
    // If headers are too large, clear auth cookies and redirect to login
    if (checkHeaderSize(req)) {
      console.warn('[Middleware] Headers too large, clearing auth cookies')
      const response = NextResponse.redirect(new URL('/login?error=HeaderTooLarge', req.url))
      return clearAuthCookies(response)
    }

    // Vérifier les permissions basées sur les rôles pour les routes dashboard
    if (pathname.startsWith('/seller') && token?.role !== 'SELLER' && token?.role !== 'ADMIN') {
      console.log('[Middleware] 🚫 Access denied to /seller - Role:', token?.role, 'Required: SELLER or ADMIN')
      return NextResponse.redirect(new URL('/dashboard', req.url))
    }

    // Allow sellers to access buyer routes (like favorites) since sellers can also be buyers
    if (pathname.startsWith('/buyer') && token?.role !== 'BUYER' && token?.role !== 'ADMIN' && token?.role !== 'SELLER') {
      console.log('[Middleware] 🚫 Access denied to /buyer - Role:', token?.role, 'Required: BUYER, SELLER or ADMIN')
      return NextResponse.redirect(new URL('/dashboard', req.url))
    }

    console.log('[Middleware] ✅ Access granted to:', pathname)
    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const { pathname } = req.nextUrl
        
        console.log('[Middleware Auth Check]', {
          pathname,
          hasToken: !!token,
          tokenSub: token?.sub,
          isProtectedRoute: pathname.startsWith('/dashboard') || pathname.startsWith('/seller') || pathname.startsWith('/buyer')
        })
        
        // Permettre l'accès aux routes publiques
        if (!pathname.startsWith('/dashboard') && !pathname.startsWith('/seller') && !pathname.startsWith('/buyer')) {
          console.log('[Middleware] ✅ Public route access granted:', pathname)
          return true
        }
        
        // Exiger une authentification pour les routes du dashboard, seller et buyer
        const isAuthorized = !!token
        console.log('[Middleware] Auth result for protected route:', {
          pathname,
          isAuthorized,
          tokenPresent: !!token
        })
        
        return isAuthorized
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