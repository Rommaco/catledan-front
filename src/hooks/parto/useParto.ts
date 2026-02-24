'use client'
import { useState, useCallback } from 'react'
import { partoService } from '@/lib/parto/partoService'
import type { Parto, CreatePartoData, UpdatePartoData } from '@/types/parto'

export const useParto = () => {
  const [data, setData] = useState<Parto[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)

  const fetchPartos = useCallback(async (filters?: { page?: number; limit?: number }) => {
    try {
      setLoading(true)
      setError(null)
      const res = await partoService.getAll({ page: filters?.page ?? currentPage, limit: filters?.limit ?? pageSize })
      setData(res.data)
      setTotal(res.total)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido')
    } finally {
      setLoading(false)
    }
  }, [currentPage, pageSize])

  const addParto = useCallback(async (d: CreatePartoData) => partoService.create(d), [])
  const updateParto = useCallback(async (id: string, d: UpdatePartoData) => partoService.update(id, d), [])
  const deleteParto = useCallback(async (id: string) => partoService.delete(id), [])

  return { data, total, loading, error, currentPage, pageSize, setCurrentPage, setPageSize, fetchPartos, addParto, updateParto, deleteParto }
}
