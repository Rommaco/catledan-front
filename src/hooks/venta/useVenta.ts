'use client'
import { useState, useCallback } from 'react'
import { ventaService } from '@/lib/venta/ventaService'
import type { Venta, CreateVentaData, UpdateVentaData, VentaFilters } from '@/types/venta'

export const useVenta = () => {
  const [data, setData] = useState<Venta[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)

  const fetchVentas = useCallback(
    async (filters?: VentaFilters) => {
      try {
        setLoading(true)
        setError(null)
        const res = await ventaService.getAll({
          ...filters,
          page: filters?.page ?? currentPage,
          limit: filters?.limit ?? pageSize,
        })
        setData(res.data)
        setTotal(res.total)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error desconocido')
      } finally {
        setLoading(false)
      }
    },
    [currentPage, pageSize],
  )

  const addVenta = useCallback(async (newData: CreateVentaData) => ventaService.create(newData), [])
  const updateVenta = useCallback(
    async (id: string, updatedData: UpdateVentaData) => ventaService.update(id, updatedData),
    [],
  )
  const deleteVenta = useCallback(async (id: string) => ventaService.delete(id), [])

  return {
    data,
    total,
    loading,
    error,
    currentPage,
    pageSize,
    setCurrentPage,
    setPageSize,
    fetchVentas,
    addVenta,
    updateVenta,
    deleteVenta,
  }
}
