import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

export default async function DashboardPage() {
  try {
    const session = await getServerSession(authOptions)
    
    // Log for production debugging
    if (process.env.NODE_ENV === 'production') {
      console.log('[Dashboard] Session check:', {
        hasSession: !!session,
        hasUser: !!session?.user,
        userId: session?.user?.id
      })
    }
    
    if (!session?.user) {
      redirect('/login')
    }

    // Get user role from database
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true }
    })

    // Log for production debugging
    if (process.env.NODE_ENV === 'production') {
      console.log('[Dashboard] User role check:', {
        userId: session.user.id,
        userFound: !!user,
        role: user?.role
      })
    }

    if (!user) {
      console.error('[Dashboard] User not found in database:', session.user.id)
      redirect('/login')
    }

    // Redirect based on user role
    if (user.role === 'SELLER') {
      if (process.env.NODE_ENV === 'production') {
        console.log('[Dashboard] Redirecting to /seller')
      }
      redirect('/seller')
    } else if (user.role === 'BUYER') {
      if (process.env.NODE_ENV === 'production') {
        console.log('[Dashboard] Redirecting to /buyer')
      }
      redirect('/buyer')
    } else {
      // Default fallback for other roles
      if (process.env.NODE_ENV === 'production') {
        console.log('[Dashboard] Unknown role, redirecting to /buyer:', user.role)
      }
      redirect('/buyer')
    }
  } catch (error) {
    console.error('[Dashboard] Error:', error)
    redirect('/login?error=DashboardError')
  }
}