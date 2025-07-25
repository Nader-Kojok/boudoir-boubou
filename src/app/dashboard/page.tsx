import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)
  
  if (!session?.user) {
    redirect('/login')
  }

  // Get user role from database
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { role: true }
  })

  if (!user) {
    redirect('/login')
  }

  // Redirect based on user role
  if (user.role === 'SELLER') {
    redirect('/seller')
  } else if (user.role === 'BUYER') {
    redirect('/buyer')
  } else {
    // Default fallback for other roles
    redirect('/buyer')
  }
}