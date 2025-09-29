'use client'
import { useState, useCallback, useEffect } from 'react'
import { reporteService } from '@/lib/reporte/reporteService'
import {
  Reporte,
  CreateReporteData,
  UpdateReporteData,
  ReporteFilters,
  ReporteStats,
} from '@/types/reporte'
import { useToast } from '../useToast'

export const useReporte = () => {
  const [data, setData] = useState<Reporte[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const { toast } = useToast()

  const fetchReportes = useCallback(
    async (filters?: ReporteFilters) => {
      try {
        setLoading(true)
        setError(null)

        const response = await reporteService.getAll({
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
          message: 'Error al cargar los reportes.',
        })
      } finally {
        setLoading(false)
      }
    },
    [currentPage, pageSize, toast],
  )

  const addReporte = useCallback(
    async (newData: CreateReporteData) => {
      try {
        setLoading(true)
        const createdRecord = await reporteService.create(newData)
        toast({
          type: 'success',
          title: 'Éxito',
          message: 'Reporte creado correctamente.',
        })
        fetchReportes() // Refresh data after adding
        return createdRecord
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error desconocido')
        toast({
          type: 'error',
          title: 'Error',
          message: 'Error al crear el reporte.',
        })
        throw err
      } finally {
        setLoading(false)
      }
    },
    [toast, fetchReportes],
  )

  const updateReporte = useCallback(
    async (id: string, updatedData: UpdateReporteData) => {
      try {
        setLoading(true)
        const newUpdatedRecord = await reporteService.update(id, updatedData)
        toast({
          type: 'success',
          title: 'Éxito',
          message: 'Reporte actualizado correctamente.',
        })
        fetchReportes() // Refresh data after updating
        return newUpdatedRecord
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error desconocido')
        toast({
          type: 'error',
          title: 'Error',
          message: 'Error al actualizar el reporte.',
        })
        throw err
      } finally {
        setLoading(false)
      }
    },
    [toast, fetchReportes],
  )

  const deleteReporte = useCallback(
    async (id: string) => {
      try {
        setLoading(true)
        await reporteService.delete(id)
        toast({
          type: 'success',
          title: 'Éxito',
          message: 'Reporte eliminado correctamente.',
        })
        fetchReportes() // Refresh data after deleting
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error desconocido')
        toast({
          type: 'error',
          title: 'Error',
          message: 'Error al eliminar el reporte.',
        })
        throw err
      } finally {
        setLoading(false)
      }
    },
    [toast, fetchReportes],
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
    fetchReportes,
    addReporte,
    updateReporte,
    deleteReporte,
  }
}

export const useReporteStats = (filters?: ReporteFilters) => {
  const [stats, setStats] = useState<ReporteStats>({
    totalReportes: 0,
    reportesPorTipo: {},
    reportesRecientes: [],
  })
  const [loadingStats, setLoadingStats] = useState(false)
  const { toast } = useToast()

  const fetchStats = useCallback(async () => {
    setLoadingStats(true)
    try {
      const fetchedStats = await reporteService.getStats()
      setStats(fetchedStats)
    } catch (err) {
      console.error('Error al cargar estadísticas de reportes:', err)
      toast({
        type: 'error',
        title: 'Error',
        message: 'Error al cargar las estadísticas de reportes.',
      })
      setStats({
        totalReportes: 0,
        reportesPorTipo: {},
        reportesRecientes: [],
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
