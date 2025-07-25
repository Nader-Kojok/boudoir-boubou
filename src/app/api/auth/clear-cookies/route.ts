import { NextRequest, NextResponse } from 'next/server'
import { clearAuthCookies } from '@/lib/cookie-utils'

/**
 * API route to clear authentication cookies
 * Useful for resolving header size issues
 */
export async function POST(request: NextRequest) {
  try {
    const response = NextResponse.json({ 
      success: true, 
      message: 'Authentication cookies cleared successfully' 
    })
    
    return clearAuthCookies(response)
  } catch (error) {
    console.error('Error clearing cookies:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to clear cookies' },
      { status: 500 }
    )
  }
}

/**
 * GET endpoint to check current cookie size
 */
export async function GET(request: NextRequest) {
  try {
    const cookieHeader = request.headers.get('cookie') || ''
    const cookieSize = new TextEncoder().encode(cookieHeader).length
    const headerString = JSON.stringify(Object.fromEntries(request.headers.entries()))
    const totalHeaderSize = new TextEncoder().encode(headerString).length
    
    return NextResponse.json({
      cookieSize: `${cookieSize} bytes`,
      totalHeaderSize: `${totalHeaderSize} bytes`,
      isLarge: totalHeaderSize > 6 * 1024, // 6KB threshold
      cookies: request.cookies.getAll().map(c => ({
        name: c.name,
        size: `${c.value.length} chars`
      }))
    })
  } catch (error) {
    console.error('Error checking cookie size:', error)
    return NextResponse.json(
      { error: 'Failed to check cookie size' },
      { status: 500 }
    )
  }
}