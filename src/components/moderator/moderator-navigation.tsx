'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Shield, Users, FileText, BarChart3, AlertTriangle } from 'lucide-react'

const navigationItems = [
  {
    name: 'Tableau de bord',
    href: '/moderator',
    icon: BarChart3
  },
  {
    name: 'Modération',
    href: '/moderator/moderation',
    icon: Shield
  },
  {
    name: 'Historique Modération',
    href: '/moderator/moderation-history',
    icon: Shield
  },
  {
    name: 'Signalements',
    href: '/moderator/signalements',
    icon: AlertTriangle
  },
  {
    name: 'Utilisateurs',
    href: '/moderator/users',
    icon: Users
  },
  {
    name: 'Rapports',
    href: '/moderator/reports',
    icon: FileText
  }
]

export function ModeratorNavigation() {
  const pathname = usePathname()

  return (
    <nav className="flex space-x-6">
      {navigationItems.map((item) => {
        const Icon = item.icon
        const isActive = pathname === item.href
        
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              'flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors',
              isActive
                ? 'bg-blue-100 text-blue-700'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
            )}
          >
            <Icon className="h-4 w-4 mr-2" />
            {item.name}
          </Link>
        )
      })}
    </nav>
  )
}