'use client'
import { useState, useCallback } from 'react'
import { alertaService } from '@/lib/alerta/alertaService'
import type { Alerta, CreateAlertaData, AlertaFilters } from '@/types/alerta'

export const useAlerta = () => {
  const [data, setData] = useState<Alerta[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [filterLeido, setFilterLeido] = useState<boolean | undefined>(undefined)

  const fetchAlertas = useCallback(
    async (filters?: AlertaFilters) => {
      try {
        setLoading(true)
        setError(null)
        const res = await alertaService.getAll({
          ...filters,
          page: filters?.page ?? currentPage,
          limit: filters?.limit ?? pageSize,
          leido: filters?.leido ?? filterLeido,
        })
        setData(res.data)
        setTotal(res.total)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error desconocido')
      } finally {
        setLoading(false)
      }
    },
    [currentPage, pageSize, filterLeido],
  )

  const markAsRead = useCallback(async (id: string) => {
    return alertaService.markAsRead(id)
  }, [])

  const createAlerta = useCallback(async (newData: CreateAlertaData) => {
    return alertaService.create(newData)
  }, [])

  return {
    data,
    total,
    loading,
    error,
    currentPage,
    pageSize,
    filterLeido,
    setCurrentPage,
    setPageSize,
    setFilterLeido,
    fetchAlertas,
    markAsRead,
    createAlerta,
  }
}
