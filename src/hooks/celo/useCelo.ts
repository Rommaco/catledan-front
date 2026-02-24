'use client'
import { useState, useCallback } from 'react'
import { celoService } from '@/lib/celo/celoService'
import type { Celo, CreateCeloData, UpdateCeloData } from '@/types/celo'

export const useCelo = () => {
  const [data, setData] = useState<Celo[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)

  const fetchCelos = useCallback(async (filters?: { page?: number; limit?: number }) => {
    try {
      setLoading(true)
      setError(null)
      const res = await celoService.getAll({ page: filters?.page ?? currentPage, limit: filters?.limit ?? pageSize })
      setData(res.data)
      setTotal(res.total)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido')
    } finally {
      setLoading(false)
    }
  }, [currentPage, pageSize])

  const addCelo = useCallback(async (d: CreateCeloData) => celoService.create(d), [])
  const updateCelo = useCallback(async (id: string, d: UpdateCeloData) => celoService.update(id, d), [])
  const deleteCelo = useCallback(async (id: string) => celoService.delete(id), [])

  return { data, total, loading, error, currentPage, pageSize, setCurrentPage, setPageSize, fetchCelos, addCelo, updateCelo, deleteCelo }
}
