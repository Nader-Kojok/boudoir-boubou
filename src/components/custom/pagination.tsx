'use client'

import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight, MoreHorizontal } from 'lucide-react'
import { cn } from '@/lib/utils'

interface PaginationProps {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
  className?: string
  showFirstLast?: boolean
  maxVisiblePages?: number
}

export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  className,
  showFirstLast = true,
  maxVisiblePages = 7
}: PaginationProps) {
  if (totalPages <= 1) return null

  const getVisiblePages = () => {
    const pages: (number | 'ellipsis')[] = []
    
    if (totalPages <= maxVisiblePages) {
      // Show all pages if total is less than max
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i)
      }
    } else {
      // Always show first page
      pages.push(1)
      
      const startPage = Math.max(2, currentPage - Math.floor((maxVisiblePages - 3) / 2))
      const endPage = Math.min(totalPages - 1, startPage + maxVisiblePages - 4)
      
      // Add ellipsis after first page if needed
      if (startPage > 2) {
        pages.push('ellipsis')
      }
      
      // Add middle pages
      for (let i = startPage; i <= endPage; i++) {
        pages.push(i)
      }
      
      // Add ellipsis before last page if needed
      if (endPage < totalPages - 1) {
        pages.push('ellipsis')
      }
      
      // Always show last page
      if (totalPages > 1) {
        pages.push(totalPages)
      }
    }
    
    return pages
  }

  const visiblePages = getVisiblePages()

  return (
    <div className={cn("flex items-center justify-center gap-1", className)}>
      {/* First page button */}
      {showFirstLast && currentPage > 1 && (
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(1)}
          className="hidden sm:flex"
        >
          Premier
        </Button>
      )}
      
      {/* Previous button */}
      <Button
        variant="outline"
        size="sm"
        disabled={currentPage === 1}
        onClick={() => onPageChange(Math.max(1, currentPage - 1))}
        className="flex items-center gap-1"
      >
        <ChevronLeft className="h-4 w-4" />
        <span className="hidden sm:inline">Précédent</span>
      </Button>
      
      {/* Page numbers */}
      <div className="flex items-center gap-1">
        {visiblePages.map((page, index) => {
          if (page === 'ellipsis') {
            return (
              <div key={`ellipsis-${index}`} className="px-2">
                <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
              </div>
            )
          }
          
          return (
            <Button
              key={page}
              variant={currentPage === page ? 'default' : 'outline'}
              size="sm"
              onClick={() => onPageChange(page)}
              className={cn(
                "min-w-[40px]",
                currentPage === page && "bg-primary text-primary-foreground"
              )}
            >
              {page}
            </Button>
          )
        })}
      </div>
      
      {/* Next button */}
      <Button
        variant="outline"
        size="sm"
        disabled={currentPage === totalPages}
        onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
        className="flex items-center gap-1"
      >
        <span className="hidden sm:inline">Suivant</span>
        <ChevronRight className="h-4 w-4" />
      </Button>
      
      {/* Last page button */}
      {showFirstLast && currentPage < totalPages && (
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(totalPages)}
          className="hidden sm:flex"
        >
          Dernier
        </Button>
      )}
    </div>
  )
}

// Compact version for mobile
export function PaginationCompact({
  currentPage,
  totalPages,
  onPageChange,
  className
}: PaginationProps) {
  if (totalPages <= 1) return null

  return (
    <div className={cn("flex items-center justify-between", className)}>
      <Button
        variant="outline"
        size="sm"
        disabled={currentPage === 1}
        onClick={() => onPageChange(Math.max(1, currentPage - 1))}
        className="flex items-center gap-1"
      >
        <ChevronLeft className="h-4 w-4" />
        Précédent
      </Button>
      
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        Page {currentPage} sur {totalPages}
      </div>
      
      <Button
        variant="outline"
        size="sm"
        disabled={currentPage === totalPages}
        onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
        className="flex items-center gap-1"
      >
        Suivant
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  )
}

export default Pagination