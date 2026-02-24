'use client'
import { useState, useCallback, useEffect } from 'react'
import { parcelaService } from '@/lib/parcela/parcelaService'
import type {
  Parcela,
  CreateParcelaData,
  UpdateParcelaData,
  ParcelaFilters,
} from '@/types/parcela'
import { useToast } from '../useToast'

export const useParcela = () => {
  const [data, setData] = useState<Parcela[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const { toast } = useToast()

  const fetchParcelas = useCallback(
    async (filters?: ParcelaFilters) => {
      try {
        setLoading(true)
        setError(null)
        const res = await parcelaService.getAll({
          ...filters,
          page: filters?.page ?? currentPage,
          limit: filters?.limit ?? pageSize,
        })
        setData(res.data)
        setTotal(res.total)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error desconocido')
        toast({
          type: 'error',
          title: 'Error',
          message: 'Error al cargar las parcelas.',
        })
      } finally {
        setLoading(false)
      }
    },
    [currentPage, pageSize, toast],
  )

  const addParcela = useCallback(async (newData: CreateParcelaData) => {
    return parcelaService.create(newData)
  }, [])

  const updateParcela = useCallback(
    async (id: string, updatedData: UpdateParcelaData) => parcelaService.update(id, updatedData),
    [],
  )

  const deleteParcela = useCallback(async (id: string) => parcelaService.delete(id), [])

  return {
    data,
    total,
    loading,
    error,
    currentPage,
    pageSize,
    setCurrentPage,
    setPageSize,
    fetchParcelas,
    addParcela,
    updateParcela,
    deleteParcela,
  }
}
