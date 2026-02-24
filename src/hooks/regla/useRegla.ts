'use client'
import { useState, useCallback } from 'react'
import { reglaService } from '@/lib/regla/reglaService'
import type { Regla, CreateReglaData, UpdateReglaData, ReglaFilters } from '@/types/regla'

export const useRegla = () => {
  const [data, setData] = useState<Regla[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)

  const fetchReglas = useCallback(
    async (filters?: ReglaFilters) => {
      try {
        setLoading(true)
        setError(null)
        const res = await reglaService.getAll({
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

  const addRegla = useCallback(async (newData: CreateReglaData) => reglaService.create(newData), [])
  const updateRegla = useCallback(
    async (id: string, updatedData: UpdateReglaData) => reglaService.update(id, updatedData),
    [],
  )
  const deleteRegla = useCallback(async (id: string) => reglaService.delete(id), [])

  return {
    data,
    total,
    loading,
    error,
    currentPage,
    pageSize,
    setCurrentPage,
    setPageSize,
    fetchReglas,
    addRegla,
    updateRegla,
    deleteRegla,
  }
}
