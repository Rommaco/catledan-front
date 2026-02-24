'use client'
import { useState, useCallback } from 'react'
import { insumoService } from '@/lib/insumo/insumoService'
import type { Insumo, CreateInsumoData, UpdateInsumoData, InsumoFilters } from '@/types/insumo'

export const useInsumo = () => {
  const [data, setData] = useState<Insumo[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)

  const fetchInsumos = useCallback(
    async (filters?: InsumoFilters) => {
      try {
        setLoading(true)
        setError(null)
        const res = await insumoService.getAll({
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

  const addInsumo = useCallback(async (newData: CreateInsumoData) => insumoService.create(newData), [])
  const updateInsumo = useCallback(
    async (id: string, updatedData: UpdateInsumoData) => insumoService.update(id, updatedData),
    [],
  )
  const deleteInsumo = useCallback(async (id: string) => insumoService.delete(id), [])

  return {
    data,
    total,
    loading,
    error,
    currentPage,
    pageSize,
    setCurrentPage,
    setPageSize,
    fetchInsumos,
    addInsumo,
    updateInsumo,
    deleteInsumo,
  }
}
