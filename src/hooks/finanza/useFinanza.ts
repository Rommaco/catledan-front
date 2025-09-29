'use client'
import { useState, useCallback, useEffect } from 'react'
import { finanzaService } from '@/lib/finanza/finanzaService'
import {
  Finanza,
  CreateFinanzaData,
  UpdateFinanzaData,
  FinanzaFilters,
  FinanzaStats,
} from '@/types/finanza'
import { useToast } from '../useToast'

export const useFinanza = () => {
  const [data, setData] = useState<Finanza[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const { toast } = useToast()

  const fetchFinanzas = useCallback(
    async (filters?: FinanzaFilters) => {
      try {
        setLoading(true)
        setError(null)

        const response = await finanzaService.getAll({
          ...filters,
          page: currentPage,
          limit: pageSize,
        })

        setData(response.data)
        setTotal(response.total)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error desconocido')
        toast({
          type: 'error',
          title: 'Error',
          message: 'Error al cargar las finanzas.',
        })
      } finally {
        setLoading(false)
      }
    },
    [currentPage, pageSize, toast],
  )

  const addFinanza = useCallback(
    async (newData: CreateFinanzaData) => {
      try {
        setLoading(true)
        const createdRecord = await finanzaService.create(newData)
        toast({
          type: 'success',
          title: 'Éxito',
          message: 'Transacción financiera creada correctamente.',
        })
        fetchFinanzas() // Refresh data after adding
        return createdRecord
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error desconocido')
        toast({
          type: 'error',
          title: 'Error',
          message: 'Error al crear la transacción financiera.',
        })
        throw err
      } finally {
        setLoading(false)
      }
    },
    [toast, fetchFinanzas],
  )

  const updateFinanza = useCallback(
    async (id: string, updatedData: UpdateFinanzaData) => {
      try {
        setLoading(true)
        const newUpdatedRecord = await finanzaService.update(id, updatedData)
        toast({
          type: 'success',
          title: 'Éxito',
          message: 'Transacción financiera actualizada correctamente.',
        })
        fetchFinanzas() // Refresh data after updating
        return newUpdatedRecord
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error desconocido')
        toast({
          type: 'error',
          title: 'Error',
          message: 'Error al actualizar la transacción financiera.',
        })
        throw err
      } finally {
        setLoading(false)
      }
    },
    [toast, fetchFinanzas],
  )

  const deleteFinanza = useCallback(
    async (id: string) => {
      try {
        setLoading(true)
        await finanzaService.delete(id)
        toast({
          type: 'success',
          title: 'Éxito',
          message: 'Transacción financiera eliminada correctamente.',
        })
        fetchFinanzas() // Refresh data after deleting
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error desconocido')
        toast({
          type: 'error',
          title: 'Error',
          message: 'Error al eliminar la transacción financiera.',
        })
        throw err
      } finally {
        setLoading(false)
      }
    },
    [toast, fetchFinanzas],
  )

  return {
    data,
    total,
    loading,
    error,
    currentPage,
    pageSize,
    setCurrentPage,
    setPageSize,
    fetchFinanzas,
    addFinanza,
    updateFinanza,
    deleteFinanza,
  }
}

export const useFinanzaStats = (filters?: FinanzaFilters) => {
  const [stats, setStats] = useState<FinanzaStats>({
    totalIngresos: 0,
    totalGastos: 0,
    balance: 0,
    transaccionesCompletadas: 0,
    transaccionesPendientes: 0,
    transaccionesCanceladas: 0,
    ingresosPorCategoria: {},
    gastosPorCategoria: {},
  })
  const [loadingStats, setLoadingStats] = useState(false)
  const { toast } = useToast()

  const fetchStats = useCallback(async () => {
    setLoadingStats(true)
    try {
      const fetchedStats = await finanzaService.getStats()
      setStats(fetchedStats)
    } catch (err) {
      console.error('Error al cargar estadísticas de finanzas:', err)
      toast({
        type: 'error',
        title: 'Error',
        message: 'Error al cargar las estadísticas de finanzas.',
      })
      setStats({
        totalIngresos: 0,
        totalGastos: 0,
        balance: 0,
        transaccionesCompletadas: 0,
        transaccionesPendientes: 0,
        transaccionesCanceladas: 0,
        ingresosPorCategoria: {},
        gastosPorCategoria: {},
      })
    } finally {
      setLoadingStats(false)
    }
  }, [toast])

  useEffect(() => {
    fetchStats()
  }, [fetchStats, filters])

  return { stats, loadingStats, fetchStats }
}
