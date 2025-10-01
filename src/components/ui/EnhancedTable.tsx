'use client'
import React, { useState } from 'react'
import { cn } from '@/lib/utils'
import { 
  ChevronLeftIcon, 
  ChevronRightIcon, 
  ArrowPathIcon,
  DocumentArrowDownIcon,
  TableCellsIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  CalendarIcon
} from '@heroicons/react/24/outline'
import { DatePicker } from './DatePicker'
import { Button } from './Button'
import { Input } from './Input'
import { CustomSelect } from './CustomSelect'
import ExportButtons from '../ExcelExport/ExportButtons'

interface TableColumn<T> {
  key: string
  title: string
  dataIndex: string
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  render?: (value: any, record: T, index: number) => React.ReactNode
  width?: string | number
  align?: 'left' | 'center' | 'right'
  sortable?: boolean
}

interface FilterOption {
  value: string
  label: string
}

interface CustomFilter {
  key: string
  label: string
  type: 'select' | 'date' | 'text'
  options?: FilterOption[]
  placeholder?: string
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
  title?: string
  showFilters?: boolean
  showExport?: boolean
  showRefresh?: boolean
  showActions?: boolean
  onRefresh?: () => void
  onExportPDF?: () => void
  onExportExcel?: () => void
  onView?: (record: T) => void
  onEdit?: (record: T) => void
  onDelete?: (record: T) => void
  exportFilename?: string
  exportTitle?: string
  customFilters?: CustomFilter[]
}

export function EnhancedTable<T = Record<string, unknown>>({
  columns,
  data,
  loading = false,
  pagination,
  className,
  animate = true,
  striped = true,
  hoverable = true,
  title = "Tabla de Datos",
  showFilters = true,
  showExport = true,
  showRefresh = true,
  showActions = true,
  onRefresh,
  onExportPDF,
  onExportExcel,
  onView,
  onEdit,
  onDelete,
  exportFilename = 'reporte',
  exportTitle = 'Reporte de Datos',
  customFilters = []
}: TableProps<T>) {
  const [searchTerm, setSearchTerm] = useState('')
  const [dateFrom, setDateFrom] = useState<Date | null>(null)
  const [dateTo, setDateTo] = useState<Date | null>(null)
  const [selectedFilter, setSelectedFilter] = useState<string>('')
  const [customFilterValues, setCustomFilterValues] = useState<Record<string, string>>({})

  // Filtrar datos
  const filteredData = React.useMemo(() => {
    let filtered = data

    // Filtro por búsqueda
    if (searchTerm) {
      filtered = filtered.filter((item: T) => {
        return Object.values(item).some(value => 
          value && value.toString().toLowerCase().includes(searchTerm.toLowerCase())
        )
      })
    }

    // Filtro por fechas
    if (dateFrom || dateTo) {
      filtered = filtered.filter((item: T) => {
        // Buscar campos de fecha en el objeto
        const dateFields = ['fecha', 'fechaCreacion', 'fechaActualizacion', 'createdAt', 'updatedAt', 'fechaIngreso']
        
        for (const field of dateFields) {
          if (item[field]) {
            const itemDate = new Date(item[field])
            if (!isNaN(itemDate.getTime())) {
              const isAfterFrom = !dateFrom || itemDate >= dateFrom
              const isBeforeTo = !dateTo || itemDate <= dateTo
              return isAfterFrom && isBeforeTo
            }
          }
        }
        
        // Si no encuentra campos de fecha, incluir el item
        return true
      })
    }

    // Filtros personalizados
    customFilters.forEach(filter => {
      const filterValue = customFilterValues[filter.key]
      if (filterValue) {
        filtered = filtered.filter((item: T) => {
          const itemValue = item[filter.key]
          if (filter.type === 'select') {
            return itemValue === filterValue
          } else if (filter.type === 'text') {
            return itemValue && itemValue.toString().toLowerCase().includes(filterValue.toLowerCase())
          }
          return true
        })
      }
    })

    return filtered
  }, [data, searchTerm, dateFrom, dateTo, customFilterValues, customFilters])

  // Paginación de datos filtrados
  const paginatedData = React.useMemo(() => {
    if (!pagination) return filteredData
    
    const startIndex = (pagination.current - 1) * pagination.pageSize
    const endIndex = startIndex + pagination.pageSize
    return filteredData.slice(startIndex, endIndex)
  }, [filteredData, pagination])

  const startIndex = pagination ? (pagination.current - 1) * pagination.pageSize : 0

  // Agregar columna de acciones si está habilitada
  const tableColumns = showActions ? [
    ...columns,
    {
      key: 'actions',
      title: 'Acciones',
      dataIndex: 'actions',
      width: '120px',
      align: 'center' as const,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars
      render: (_: any, record: T) => (
        <div className="flex items-center justify-center space-x-2">
          {onView && (
            <button
              onClick={() => onView(record)}
              className="p-1 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-md transition-all duration-200 hover:scale-110"
              title="Ver detalles"
            >
              <EyeIcon className="h-4 w-4" />
            </button>
          )}
          {onEdit && (
            <button
              onClick={() => onEdit(record)}
              className="p-1 text-green-600 hover:text-green-800 hover:bg-green-50 rounded-md transition-all duration-200 hover:scale-110"
              title="Editar"
            >
              <PencilIcon className="h-4 w-4" />
            </button>
          )}
          {onDelete && (
            <button
              onClick={() => onDelete(record)}
              className="p-1 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-md transition-all duration-200 hover:scale-110"
              title="Eliminar"
            >
              <TrashIcon className="h-4 w-4" />
            </button>
          )}
        </div>
      )
    }
  ] : columns

  return (
    <div className={cn('relative overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm', className)}>
      {/* Header con controles */}
      <div className="bg-gradient-to-r from-gray-50 to-white border-b border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <TableCellsIcon className="h-5 w-5 text-green-600" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
          </div>
          
          <div className="flex items-center space-x-2">
            {/* Botón de actualizar */}
            {showRefresh && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onRefresh}
                className="p-2 hover:bg-gray-100"
                animate={animate}
              >
                <ArrowPathIcon className="h-4 w-4" />
              </Button>
            )}
            
            {/* Botones de exportar */}
            {showExport && (
              <ExportButtons
                data={filteredData}
                columns={columns.map(col => ({
                  title: col.title,
                  dataIndex: col.dataIndex,
                  key: col.key
                }))}
                filename={exportFilename}
                title={exportTitle}
                size="sm"
                disabled={loading || filteredData.length === 0}
              />
            )}
          </div>
        </div>

        {/* Filtros */}
        {showFilters && (
          <div className="space-y-4">
            {/* Filtros básicos */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Búsqueda */}
              <div className="md:col-span-2">
                <Input
                  placeholder="Buscar..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  icon={<MagnifyingGlassIcon className="w-5 h-5" />}
                  variant="filled"
                  animate={animate}
                />
              </div>
              
              {/* Filtro por fecha desde */}
              <DatePicker
                placeholder="Fecha desde"
                value={dateFrom}
                onChange={setDateFrom}
                animate={animate}
                variant="filled"
                maxDate={dateTo || new Date()}
              />
              
              {/* Filtro por fecha hasta */}
              <DatePicker
                placeholder="Fecha hasta"
                value={dateTo}
                onChange={setDateTo}
                animate={animate}
                variant="filled"
                minDate={dateFrom}
                maxDate={new Date()}
              />
            </div>

            {/* Filtros personalizados */}
            {customFilters.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {customFilters.map((filter) => (
                  <div key={filter.key}>
                    {filter.type === 'select' ? (
                      <CustomSelect
                        label={filter.label}
                        value={customFilterValues[filter.key] || ''}
                        onChange={(value) => setCustomFilterValues(prev => ({ ...prev, [filter.key]: value }))}
                        options={filter.options || []}
                        placeholder={filter.placeholder || `Seleccionar ${filter.label.toLowerCase()}`}
                        variant="filled"
                        animate={animate}
                      />
                    ) : filter.type === 'text' ? (
                      <Input
                        label={filter.label}
                        value={customFilterValues[filter.key] || ''}
                        onChange={(e) => setCustomFilterValues(prev => ({ ...prev, [filter.key]: e.target.value }))}
                        placeholder={filter.placeholder || `Buscar por ${filter.label.toLowerCase()}`}
                        variant="filled"
                        animate={animate}
                      />
                    ) : null}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Loading overlay */}
      {loading && (
        <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-10">
          <div className="flex flex-col items-center space-y-2">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-green-500 border-t-transparent" />
            <p className="text-sm text-gray-600">Cargando...</p>
          </div>
        </div>
      )}
      
      <div className="overflow-x-auto">
        <table className="w-full">
          {/* Header */}
          <thead className="bg-gray-50">
            <tr>
              {tableColumns.map((column, index) => (
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
                  <div className="flex items-center space-x-1">
                    <span>{column.title}</span>
                    {column.sortable && (
                      <button className="p-1 hover:bg-gray-200 rounded transition-colors duration-200">
                        <FunnelIcon className="h-3 w-3" />
                      </button>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          
          {/* Body */}
          <tbody className="bg-white divide-y divide-gray-200">
            {paginatedData.map((record, rowIndex) => (
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
                {tableColumns.map((column, colIndex) => (
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
        <div className="bg-white px-6 py-4 border-t border-gray-200 flex items-center justify-between">
          <div className="text-sm text-gray-700">
            Mostrando {startIndex + 1} a {Math.min(startIndex + pagination.pageSize, filteredData.length)} de {filteredData.length} resultados
          </div>
          
          <div className="flex items-center space-x-2">
            {/* Botones de navegación */}
            <button
              onClick={() => pagination.onChange(Math.max(1, pagination.current - 1), pagination.pageSize)}
              disabled={pagination.current === 1}
              className={cn(
                'p-2 rounded-md transition-all duration-200',
                pagination.current === 1
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-300',
                animate && 'hover:scale-105'
              )}
            >
              <ChevronLeftIcon className="h-4 w-4" />
            </button>
            
            {/* Números de página */}
            <div className="flex space-x-1">
              {Array.from({ length: Math.min(5, Math.ceil(filteredData.length / pagination.pageSize)) }, (_, i) => {
                const pageNum = i + 1
                return (
                  <button
                    key={pageNum}
                    onClick={() => pagination.onChange(pageNum, pagination.pageSize)}
                    className={cn(
                      'px-3 py-1 text-sm rounded-md transition-all duration-200',
                      pagination.current === pageNum
                        ? 'bg-green-500 text-white'
                        : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300',
                      animate && 'hover:scale-105'
                    )}
                  >
                    {pageNum}
                  </button>
                )
              })}
            </div>
            
            <button
              onClick={() => pagination.onChange(Math.min(Math.ceil(pagination.total / pagination.pageSize), pagination.current + 1), pagination.pageSize)}
              disabled={pagination.current >= Math.ceil(pagination.total / pagination.pageSize)}
              className={cn(
                'p-2 rounded-md transition-all duration-200',
                pagination.current >= Math.ceil(pagination.total / pagination.pageSize)
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-300',
                animate && 'hover:scale-105'
              )}
            >
              <ChevronRightIcon className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

EnhancedTable.displayName = 'EnhancedTable'
