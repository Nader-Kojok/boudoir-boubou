'use client'

import React, { useState, useMemo, useCallback } from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  MoreHorizontal
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { AdvancedFilters } from './advanced-filters'
import { DataPagination, usePagination } from './data-pagination'

export interface Column<T = Record<string, unknown>> {
  key: string
  label: string
  sortable?: boolean
  filterable?: boolean
  width?: string
  align?: 'left' | 'center' | 'right'
  render?: (value: unknown, row: T, index: number) => React.ReactNode
  className?: string
}

export interface FilterConfig {
  key: string
  label: string
  type: 'select' | 'date' | 'text' | 'number'
  options?: { value: string; label: string }[]
  placeholder?: string
}

export interface Action<T = Record<string, unknown>> {
  key: string
  label: string
  icon?: React.ReactNode
  onClick: (row: T) => void
  variant?: 'default' | 'destructive' | 'outline' | 'secondary'
  disabled?: (row: T) => boolean
  hidden?: (row: T) => boolean
}

export interface BulkAction<T = Record<string, unknown>> {
  key: string
  label: string
  icon?: React.ReactNode
  onClick: (selectedRows: T[]) => void
  variant?: 'default' | 'destructive' | 'outline' | 'secondary'
  disabled?: (selectedRows: T[]) => boolean
}

interface DataTableProps<T = Record<string, unknown>> {
  data: T[]
  columns: Column<T>[]
  loading?: boolean
  title?: string
  description?: string
  filters?: FilterConfig[]
  actions?: Action<T>[]
  bulkActions?: BulkAction<T>[]
  onExport?: (data: T[], filters: Record<string, unknown>) => void
  onRefresh?: () => void
  selectable?: boolean
  searchable?: boolean
  pagination?: boolean
  initialPageSize?: number
  emptyMessage?: string
  className?: string
  rowClassName?: (row: T, index: number) => string
  getRowId?: (row: T, index: number) => string | number
}

export function DataTable<T extends Record<string, unknown>>({
  data,
  columns,
  loading = false,
  title,
  description,
  filters = [],
  actions = [],
  bulkActions = [],
  onExport,
  onRefresh,
  selectable = false,
  searchable = true,
  pagination = true,
  initialPageSize = 25,
  emptyMessage = 'Aucune donnée disponible',
  className,
  rowClassName,
  getRowId = (row: T, index: number) => (row.id as string | number) || index
}: DataTableProps<T>) {
  const [sortConfig, setSortConfig] = useState<{
    key: string
    direction: 'asc' | 'desc'
  } | null>(null)
  const [filterValues, setFilterValues] = useState<Record<string, string | number | boolean | undefined>>({})
  const [selectedRows, setSelectedRows] = useState<Set<string | number>>(new Set())

  // Filtrage et tri des données
  const filteredAndSortedData = useMemo(() => {
    let result = [...data]

    // Appliquer les filtres
    Object.entries(filterValues).forEach(([key, value]) => {
      if (value === undefined || value === '' || value === 'ALL') return

      if (key === 'search' && searchable) {
        // Recherche globale
        const searchValue = value?.toString().toLowerCase() || ''
        result = result.filter(row =>
          columns.some(col => {
            const cellValue = row[col.key]
            return cellValue?.toString().toLowerCase().includes(searchValue)
          })
        )
      } else if (key.endsWith('From') || key.endsWith('To')) {
        // Filtres de date
        const baseKey = key.replace(/(From|To)$/, '')
        const isFrom = key.endsWith('From')
        if (typeof value === 'string' || typeof value === 'number') {
          const dateValue = new Date(value)
          
          result = result.filter(row => {
            const rowDate = new Date(row[baseKey] as string | number | Date)
            return isFrom ? rowDate >= dateValue : rowDate <= dateValue
          })
        }
      } else {
          // Autres filtres
          result = result.filter(row => {
            const rowValue = row[key]
            if (typeof value === 'number') {
              return rowValue === value
            }
            const searchValue = value?.toString().toLowerCase() || ''
            return rowValue?.toString().toLowerCase().includes(searchValue)
          })
      }
    })

    // Appliquer le tri
    if (sortConfig) {
      result.sort((a, b) => {
        const aValue = a[sortConfig.key]
        const bValue = b[sortConfig.key]

        if (aValue === null || aValue === undefined) return 1
        if (bValue === null || bValue === undefined) return -1

        if (typeof aValue === 'number' && typeof bValue === 'number') {
          return sortConfig.direction === 'asc' ? aValue - bValue : bValue - aValue
        }

        if (aValue instanceof Date && bValue instanceof Date) {
          return sortConfig.direction === 'asc'
            ? aValue.getTime() - bValue.getTime()
            : bValue.getTime() - aValue.getTime()
        }

        const aStr = aValue.toString().toLowerCase()
        const bStr = bValue.toString().toLowerCase()
        
        return sortConfig.direction === 'asc'
          ? aStr.localeCompare(bStr)
          : bStr.localeCompare(aStr)
      })
    }

    return result
  }, [data, filterValues, sortConfig, columns, searchable])

  // Pagination
  const {
    pagination: paginationInfo,
    setCurrentPage,
    setPageSize,
    startIndex,
    endIndex
  } = usePagination({
    totalItems: filteredAndSortedData.length,
    initialPageSize
  })

  const paginatedData = pagination
    ? filteredAndSortedData.slice(startIndex, endIndex)
    : filteredAndSortedData

  // Gestion du tri
  const handleSort = useCallback((key: string) => {
    setSortConfig(current => {
      if (current?.key === key) {
        return current.direction === 'asc'
          ? { key, direction: 'desc' }
          : null
      }
      return { key, direction: 'asc' }
    })
  }, [])

  // Gestion de la sélection
  const handleSelectAll = useCallback((checked: boolean) => {
    if (checked) {
      const allIds = paginatedData.map((row, index) => getRowId(row, index))
      setSelectedRows(new Set(allIds))
    } else {
      setSelectedRows(new Set())
    }
  }, [paginatedData, getRowId])

  const handleSelectRow = useCallback((rowId: string | number, checked: boolean) => {
    setSelectedRows(prev => {
      const newSet = new Set(prev)
      if (checked) {
        newSet.add(rowId)
      } else {
        newSet.delete(rowId)
      }
      return newSet
    })
  }, [])

  const selectedRowsData = useMemo(() => {
    return paginatedData.filter((row, index) => 
      selectedRows.has(getRowId(row, index))
    )
  }, [paginatedData, selectedRows, getRowId])

  // Gestion de l'export
  const handleExport = useCallback(() => {
    if (onExport) {
      onExport(filteredAndSortedData, filterValues)
    }
  }, [onExport, filteredAndSortedData, filterValues])

  const getSortIcon = (columnKey: string) => {
    if (sortConfig?.key !== columnKey) {
      return <ArrowUpDown className="h-4 w-4" />
    }
    return sortConfig.direction === 'asc'
      ? <ArrowUp className="h-4 w-4" />
      : <ArrowDown className="h-4 w-4" />
  }

  const isAllSelected = paginatedData.length > 0 && 
    paginatedData.every((row, index) => selectedRows.has(getRowId(row, index)))
  const isIndeterminate = selectedRows.size > 0 && !isAllSelected

  return (
    <Card className={className}>
      {(title || description) && (
        <CardHeader>
          {title && <CardTitle>{title}</CardTitle>}
          {description && (
            <p className="text-sm text-muted-foreground">{description}</p>
          )}
        </CardHeader>
      )}
      
      <CardContent className="space-y-4">
        {/* Filtres */}
        {(filters.length > 0 || searchable || onExport || onRefresh) && (
          <AdvancedFilters
            filters={searchable ? [{ key: 'search', label: 'Recherche', type: 'text', placeholder: 'Rechercher...' }, ...filters] : filters}
            values={filterValues}
            onChange={setFilterValues}
            onExport={onExport ? handleExport : undefined}
            onRefresh={onRefresh}
            loading={loading}
          />
        )}

        {/* Actions en lot */}
        {bulkActions.length > 0 && selectedRows.size > 0 && (
          <div className="flex items-center space-x-2 p-2 bg-muted rounded-md">
            <span className="text-sm text-muted-foreground">
              {selectedRows.size} élément(s) sélectionné(s)
            </span>
            <div className="flex space-x-2">
              {bulkActions.map(action => (
                <Button
                  key={action.key}
                  variant={action.variant || 'outline'}
                  size="sm"
                  onClick={() => action.onClick(selectedRowsData)}
                  disabled={action.disabled?.(selectedRowsData) || loading}
                >
                  {action.icon}
                  {action.label}
                </Button>
              ))}
            </div>
          </div>
        )}

        {/* Tableau */}
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                {selectable && (
                  <TableHead className="w-12">
                    <Checkbox
                      checked={isAllSelected}
                      onCheckedChange={handleSelectAll}
                      aria-label="Sélectionner tout"
                      ref={(el) => {
                        if (el) (el as HTMLInputElement).indeterminate = isIndeterminate
                      }}
                    />
                  </TableHead>
                )}
                
                {columns.map(column => (
                  <TableHead
                    key={column.key}
                    className={cn(
                      column.width && `w-[${column.width}]`,
                      column.align === 'center' && 'text-center',
                      column.align === 'right' && 'text-right',
                      column.sortable && 'cursor-pointer select-none',
                      column.className
                    )}
                    onClick={column.sortable ? () => handleSort(column.key) : undefined}
                  >
                    <div className="flex items-center space-x-2">
                      <span>{column.label}</span>
                      {column.sortable && getSortIcon(column.key)}
                    </div>
                  </TableHead>
                ))}
                
                {actions.length > 0 && (
                  <TableHead className="w-12">
                    <span className="sr-only">Actions</span>
                  </TableHead>
                )}
              </TableRow>
            </TableHeader>
            
            <TableBody>
              {loading ? (
                // Skeleton de chargement
                Array.from({ length: initialPageSize }).map((_, index) => (
                  <TableRow key={index}>
                    {selectable && (
                      <TableCell>
                        <Skeleton className="h-4 w-4" />
                      </TableCell>
                    )}
                    {columns.map(column => (
                      <TableCell key={column.key}>
                        <Skeleton className="h-4 w-full" />
                      </TableCell>
                    ))}
                    {actions.length > 0 && (
                      <TableCell>
                        <Skeleton className="h-8 w-8" />
                      </TableCell>
                    )}
                  </TableRow>
                ))
              ) : paginatedData.length === 0 ? (
                // Message vide
                <TableRow>
                  <TableCell
                    colSpan={columns.length + (selectable ? 1 : 0) + (actions.length > 0 ? 1 : 0)}
                    className="h-24 text-center text-muted-foreground"
                  >
                    {emptyMessage}
                  </TableCell>
                </TableRow>
              ) : (
                // Données
                paginatedData.map((row, index) => {
                  const rowId = getRowId(row, index)
                  const isSelected = selectedRows.has(rowId)
                  
                  return (
                    <TableRow
                      key={rowId}
                      className={cn(
                        isSelected && 'bg-muted/50',
                        rowClassName?.(row, index)
                      )}
                    >
                      {selectable && (
                        <TableCell>
                          <Checkbox
                            checked={isSelected}
                            onCheckedChange={(checked) => handleSelectRow(rowId, checked as boolean)}
                            aria-label={`Sélectionner la ligne ${index + 1}`}
                          />
                        </TableCell>
                      )}
                      
                      {columns.map(column => (
                        <TableCell
                          key={column.key}
                          className={cn(
                            column.align === 'center' && 'text-center',
                            column.align === 'right' && 'text-right',
                            column.className
                          )}
                        >
                          {column.render ? (
                            (() => {
                              const rendered = column.render(row?.[column.key], row, index)
                              // Handle empty objects and invalid ReactNode types
                              if (rendered && typeof rendered === 'object' && rendered.constructor === Object && Object.keys(rendered).length === 0) {
                                return '-'
                              }
                              return (rendered as React.ReactNode) ?? '-'
                            })()
                          ) : (
                            (row?.[column.key] as React.ReactNode) || '-'
                          )}
                        </TableCell>
                      ))}
                      
                      {actions.length > 0 && (
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-8 w-8 p-0">
                                <span className="sr-only">Ouvrir le menu</span>
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              {actions
                                .filter(action => !action.hidden?.(row))
                                .map((action, actionIndex) => (
                                  <div key={action.key}>
                                    <DropdownMenuItem
                                      onClick={() => action.onClick(row)}
                                      disabled={action.disabled?.(row)}
                                      className={cn(
                                        action.variant === 'destructive' && 'text-destructive focus:text-destructive'
                                      )}
                                    >
                                      {action.icon}
                                      {action.label}
                                    </DropdownMenuItem>
                                    {actionIndex < actions.length - 1 && (
                                      <DropdownMenuSeparator />
                                    )}
                                  </div>
                                ))
                              }
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      )}
                    </TableRow>
                  )
                })
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        {pagination && !loading && (
          <DataPagination
            pagination={paginationInfo}
            onPageChange={setCurrentPage}
            onPageSizeChange={setPageSize}
            loading={loading}
          />
        )}
      </CardContent>
    </Card>
  )
}