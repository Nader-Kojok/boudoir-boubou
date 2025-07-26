'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  MoreHorizontal
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface PaginationInfo {
  currentPage: number
  totalPages: number
  totalItems: number
  itemsPerPage: number
  hasNextPage: boolean
  hasPreviousPage: boolean
}

interface DataPaginationProps {
  pagination: PaginationInfo
  onPageChange: (page: number) => void
  onPageSizeChange: (pageSize: number) => void
  loading?: boolean
  showPageSizeSelector?: boolean
  showItemsInfo?: boolean
  pageSizeOptions?: number[]
  className?: string
}

const DEFAULT_PAGE_SIZE_OPTIONS = [10, 25, 50, 100]

export function DataPagination({
  pagination,
  onPageChange,
  onPageSizeChange,
  loading = false,
  showPageSizeSelector = true,
  showItemsInfo = true,
  pageSizeOptions = DEFAULT_PAGE_SIZE_OPTIONS,
  className
}: DataPaginationProps) {
  const {
    currentPage,
    totalPages,
    totalItems,
    itemsPerPage,
    hasNextPage,
    hasPreviousPage
  } = pagination

  // Calculer les numéros de page à afficher
  const getVisiblePages = () => {
    const delta = 2 // Nombre de pages à afficher de chaque côté de la page actuelle
    const range = []
    const rangeWithDots = []

    for (
      let i = Math.max(2, currentPage - delta);
      i <= Math.min(totalPages - 1, currentPage + delta);
      i++
    ) {
      range.push(i)
    }

    if (currentPage - delta > 2) {
      rangeWithDots.push(1, '...')
    } else {
      rangeWithDots.push(1)
    }

    rangeWithDots.push(...range)

    if (currentPage + delta < totalPages - 1) {
      rangeWithDots.push('...', totalPages)
    } else if (totalPages > 1) {
      rangeWithDots.push(totalPages)
    }

    return rangeWithDots.filter((item, index, arr) => {
      // Supprimer les doublons
      return arr.indexOf(item) === index
    })
  }

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages && page !== currentPage && !loading) {
      onPageChange(page)
    }
  }

  const handlePageSizeChange = (newPageSize: string) => {
    const pageSize = parseInt(newPageSize)
    if (pageSize !== itemsPerPage && !loading) {
      onPageSizeChange(pageSize)
    }
  }

  // Calculer les informations d'affichage
  const startItem = (currentPage - 1) * itemsPerPage + 1
  const endItem = Math.min(currentPage * itemsPerPage, totalItems)

  if (totalPages <= 1 && !showItemsInfo && !showPageSizeSelector) {
    return null
  }

  return (
    <div className={cn(
      'flex items-center justify-between px-2 py-4',
      className
    )}>
      {/* Informations sur les éléments */}
      <div className="flex items-center space-x-4">
        {showItemsInfo && (
          <div className="text-sm text-muted-foreground">
            {totalItems > 0 ? (
              <>
                Affichage de <span className="font-medium">{startItem}</span> à{' '}
                <span className="font-medium">{endItem}</span> sur{' '}
                <span className="font-medium">{totalItems}</span> résultats
              </>
            ) : (
              'Aucun résultat'
            )}
          </div>
        )}

        {showPageSizeSelector && totalItems > 0 && (
          <div className="flex items-center space-x-2">
            <span className="text-sm text-muted-foreground">Lignes par page:</span>
            <Select
              value={itemsPerPage.toString()}
              onValueChange={handlePageSizeChange}
              disabled={loading}
            >
              <SelectTrigger className="h-8 w-16">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {pageSizeOptions.map((size) => (
                  <SelectItem key={size} value={size.toString()}>
                    {size}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
      </div>

      {/* Navigation de pagination */}
      {totalPages > 1 && (
        <div className="flex items-center space-x-2">
          {/* Informations de page */}
          <div className="text-sm text-muted-foreground mr-4">
            Page <span className="font-medium">{currentPage}</span> sur{' '}
            <span className="font-medium">{totalPages}</span>
          </div>

          {/* Boutons de navigation */}
          <div className="flex items-center space-x-1">
            {/* Première page */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(1)}
              disabled={!hasPreviousPage || loading}
              className="h-8 w-8 p-0"
            >
              <ChevronsLeft className="h-4 w-4" />
            </Button>

            {/* Page précédente */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={!hasPreviousPage || loading}
              className="h-8 w-8 p-0"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>

            {/* Numéros de page */}
            {getVisiblePages().map((page, index) => {
              if (page === '...') {
                return (
                  <Button
                    key={`dots-${index}`}
                    variant="ghost"
                    size="sm"
                    disabled
                    className="h-8 w-8 p-0"
                  >
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                )
              }

              const pageNumber = page as number
              const isCurrentPage = pageNumber === currentPage

              return (
                <Button
                  key={pageNumber}
                  variant={isCurrentPage ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => handlePageChange(pageNumber)}
                  disabled={loading}
                  className={cn(
                    'h-8 w-8 p-0',
                    isCurrentPage && 'bg-primary text-primary-foreground'
                  )}
                >
                  {pageNumber}
                </Button>
              )
            })}

            {/* Page suivante */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={!hasNextPage || loading}
              className="h-8 w-8 p-0"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>

            {/* Dernière page */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(totalPages)}
              disabled={!hasNextPage || loading}
              className="h-8 w-8 p-0"
            >
              <ChevronsRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

// Hook pour gérer la pagination côté client
export function usePagination({
  totalItems,
  initialPageSize = 25,
  initialPage = 1
}: {
  totalItems: number
  initialPageSize?: number
  initialPage?: number
}) {
  const [currentPage, setCurrentPage] = useState(initialPage)
  const [pageSize, setPageSize] = useState(initialPageSize)

  const totalPages = Math.ceil(totalItems / pageSize)
  const hasNextPage = currentPage < totalPages
  const hasPreviousPage = currentPage > 1

  // Réinitialiser à la page 1 si la page actuelle dépasse le total
  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(1)
    }
  }, [currentPage, totalPages])

  // Réinitialiser à la page 1 quand la taille de page change
  const handlePageSizeChange = (newPageSize: number) => {
    setPageSize(newPageSize)
    setCurrentPage(1)
  }

  const pagination: PaginationInfo = {
    currentPage,
    totalPages,
    totalItems,
    itemsPerPage: pageSize,
    hasNextPage,
    hasPreviousPage
  }

  return {
    pagination,
    setCurrentPage,
    setPageSize: handlePageSizeChange,
    // Calculer les indices pour le slice des données
    startIndex: (currentPage - 1) * pageSize,
    endIndex: currentPage * pageSize
  }
}