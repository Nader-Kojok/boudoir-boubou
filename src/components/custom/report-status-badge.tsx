import { Badge } from '@/components/ui/badge'
import { CheckCircle, XCircle, Clock } from 'lucide-react'

interface ReportStatusBadgeProps {
  status: 'PENDING' | 'RESOLVED' | 'REJECTED'
}

export function ReportStatusBadge({ status }: ReportStatusBadgeProps) {
  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'PENDING':
        return {
          label: 'En attente',
          variant: 'secondary' as const,
          icon: Clock,
          className: 'text-orange-600 border-orange-200 bg-orange-50'
        }
      case 'RESOLVED':
        return {
          label: 'Résolu',
          variant: 'secondary' as const,
          icon: CheckCircle,
          className: 'text-green-600 border-green-200 bg-green-50'
        }
      case 'REJECTED':
        return {
          label: 'Rejeté',
          variant: 'secondary' as const,
          icon: XCircle,
          className: 'text-red-600 border-red-200 bg-red-50'
        }
      default:
        return {
          label: status,
          variant: 'secondary' as const,
          icon: Clock,
          className: ''
        }
    }
  }

  const config = getStatusConfig(status)
  const Icon = config.icon

  return (
    <Badge variant={config.variant} className={config.className}>
      <Icon className="h-3 w-3 mr-1" />
      {config.label}
    </Badge>
  )
}