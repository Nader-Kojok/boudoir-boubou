/**
 * Utility functions for managing authentication cookies and preventing header size issues
 */

import { NextRequest, NextResponse } from 'next/server'

/**
 * Clear all NextAuth cookies to prevent header size issues
 */
export function clearAuthCookies(response: NextResponse) {
  const cookiesToClear = [
    'next-auth.session-token',
    'next-auth.callback-url',
    'next-auth.csrf-token',
    '__Secure-next-auth.session-token',
    '__Host-next-auth.csrf-token',
  ]

  cookiesToClear.forEach(cookieName => {
    response.cookies.set(cookieName, '', {
      expires: new Date(0),
      path: '/',
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax'
    })
  })

  return response
}

/**
 * Check if request headers are approaching size limits
 */
export function checkHeaderSize(request: NextRequest): boolean {
  const headerString = JSON.stringify(Object.fromEntries(request.headers.entries()))
  const headerSize = new TextEncoder().encode(headerString).length
  
  // Warn if headers are larger than 6KB (Vercel limit is around 8KB)
  if (headerSize > 6 * 1024) {
    console.warn(`Large headers detected: ${headerSize} bytes`)
    return true
  }
  
  return false
}

/**
 * Get cookie size for debugging
 */
export function getCookieSize(request: NextRequest): number {
  const cookieHeader = request.headers.get('cookie') || ''
  return new TextEncoder().encode(cookieHeader).length
}

/**
 * Log cookie information for debugging
 */
export function logCookieInfo(request: NextRequest) {
  if (process.env.NODE_ENV === 'development') {
    const cookieSize = getCookieSize(request)
    const headerSize = checkHeaderSize(request)
    
    console.log('Cookie Debug Info:', {
      cookieSize: `${cookieSize} bytes`,
      headerSizeWarning: headerSize,
      cookies: request.cookies.getAll().map(c => ({ name: c.name, size: c.value.length }))
    })
  }
}