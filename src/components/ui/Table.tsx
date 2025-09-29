'use client'
import React from 'react'
import { cn } from '@/lib/utils'

interface TableColumn<T> {
  key: string
  title: string
  dataIndex: string
  render?: (value: any, record: T, index: number) => React.ReactNode
  width?: string | number
  align?: 'left' | 'center' | 'right'
}

interface TableProps<T> {
  columns: TableColumn<T>[]
  data: T[]
  loading?: boolean
  pagination?: {
    current: number
    pageSize: number
    total: number
    onChange: (page: number, pageSize: number) => void
  }
  className?: string
  animate?: boolean
  striped?: boolean
  hoverable?: boolean
}

export function Table<T extends Record<string, any>>({
  columns,
  data,
  loading = false,
  pagination,
  className,
  animate = true,
  striped = true,
  hoverable = true
}: TableProps<T>) {
  const startIndex = pagination ? (pagination.current - 1) * pagination.pageSize : 0

  return (
    <div className={cn('relative overflow-hidden rounded-xl border border-gray-200', className)}>
      {/* Loading overlay */}
      {loading && (
        <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-10">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-green-500 border-t-transparent" />
        </div>
      )}
      
      <div className="overflow-x-auto">
        <table className="w-full">
          {/* Header */}
          <thead className="bg-gray-50">
            <tr>
              {columns.map((column, index) => (
                <th
                  key={column.key}
                  className={cn(
                    'px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider',
                    column.align === 'center' && 'text-center',
                    column.align === 'right' && 'text-right',
                    animate && 'animate-slide-down'
                  )}
                  style={{ width: column.width }}
                >
                  {column.title}
                </th>
              ))}
            </tr>
          </thead>
          
          {/* Body */}
          <tbody className="bg-white divide-y divide-gray-200">
            {data.map((record, rowIndex) => (
              <tr
                key={record.id || rowIndex}
                className={cn(
                  'transition-all duration-200',
                  striped && rowIndex % 2 === 0 && 'bg-gray-50',
                  hoverable && 'hover:bg-green-50 hover:shadow-sm',
                  animate && 'animate-fade-in'
                )}
                style={{ animationDelay: `${rowIndex * 50}ms` }}
              >
                {columns.map((column, colIndex) => (
                  <td
                    key={column.key}
                    className={cn(
                      'px-6 py-4 whitespace-nowrap text-sm text-gray-900',
                      column.align === 'center' && 'text-center',
                      column.align === 'right' && 'text-right',
                      animate && 'animate-slide-up'
                    )}
                    style={{ animationDelay: `${(rowIndex * 50) + (colIndex * 10)}ms` }}
                  >
                    {column.render
                      ? column.render(record[column.dataIndex], record, startIndex + rowIndex)
                      : record[column.dataIndex]
                    }
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {/* Pagination */}
      {pagination && (
        <div className="bg-white px-6 py-3 border-t border-gray-200 flex items-center justify-between">
          <div className="text-sm text-gray-700">
            Mostrando {startIndex + 1} a {Math.min(startIndex + pagination.pageSize, pagination.total)} de {pagination.total} resultados
          </div>
          <div className="flex space-x-2">
            {Array.from({ length: Math.ceil(pagination.total / pagination.pageSize) }, (_, i) => (
              <button
                key={i}
                onClick={() => pagination.onChange(i + 1, pagination.pageSize)}
                className={cn(
                  'px-3 py-1 text-sm rounded-md transition-all duration-200',
                  pagination.current === i + 1
                    ? 'bg-green-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200',
                  animate && 'hover:scale-105'
                )}
              >
                {i + 1}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
