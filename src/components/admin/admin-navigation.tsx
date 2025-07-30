'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { cn } from '@/lib/utils'

const adminNavItems = [
  {
    href: '/admin/moderation',
    label: 'Modération'
  },
  {
    href: '/admin/moderation-history',
    label: 'Historique Modération'
  },
  {
    href: '/admin/analytics',
    label: 'Analytics'
  },
  {
    href: '/admin/users',
    label: 'Gestion Utilisateurs'
  }
]

export function AdminNavigation() {
  const pathname = usePathname()
  
  return (
    <div className="hidden md:flex space-x-6">
      {adminNavItems.map((item) => {
        const isActive = pathname === item.href
        
        return (
          <Link 
            key={item.href}
            href={item.href} 
            className={cn(
              "px-3 py-2 text-sm font-medium transition-colors",
              isActive 
                ? "text-blue-600 border-b-2 border-blue-600" 
                : "text-gray-600 hover:text-gray-900"
            )}
          >
            {item.label}
          </Link>
        )
      })}
    </div>
  )
}