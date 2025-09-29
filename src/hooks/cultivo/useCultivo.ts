'use client'
import { useState, useCallback, useEffect } from 'react'
import { cultivoService } from '@/lib/cultivo/cultivoService'
import {
  Cultivo,
  CreateCultivoData,
  UpdateCultivoData,
  CultivoFilters,
  CultivoResponse,
  CultivoFormData,
} from '@/types/cultivo'
import { useToast } from '../useToast'

export const useCultivo = () => {
  const [data, setData] = useState<Cultivo[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const { toast } = useToast()

  const fetchCultivos = useCallback(
    async (filters?: CultivoFilters) => {
      try {
        setLoading(true)
        setError(null)

        const response = await cultivoService.getAll({
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
          message: 'Error al cargar los cultivos.',
        })
      } finally {
        setLoading(false)
      }
    },
    [currentPage, pageSize, toast],
  )

  const addCultivo = useCallback(
    async (newData: CreateCultivoData) => {
      try {
        setLoading(true)
        const createdCultivo = await cultivoService.create(newData)
        setData((prev) => [...prev, createdCultivo])
        setTotal((prev) => prev + 1)
        toast({
          type: 'success',
          title: 'Éxito',
          message: 'Cultivo agregado correctamente.',
        })
        return createdCultivo
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error desconocido')
        toast({
          type: 'error',
          title: 'Error',
          message: 'Error al agregar el cultivo.',
        })
        throw err
      } finally {
        setLoading(false)
      }
    },
    [toast],
  )

  const updateCultivo = useCallback(
    async (id: string, updatedData: UpdateCultivoData) => {
      try {
        setLoading(true)
        const newUpdatedCultivo = await cultivoService.update(id, updatedData)
        setData((prev) => prev.map((c) => (c._id === id ? newUpdatedCultivo : c)))
        toast({
          type: 'success',
          title: 'Éxito',
          message: 'Cultivo actualizado correctamente.',
        })
        return newUpdatedCultivo
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error desconocido')
        toast({
          type: 'error',
          title: 'Error',
          message: 'Error al actualizar el cultivo.',
        })
        throw err
      } finally {
        setLoading(false)
      }
    },
    [toast],
  )

  const deleteCultivo = useCallback(
    async (id: string) => {
      try {
        setLoading(true)
        await cultivoService.delete(id)
        setData((prev) => prev.filter((c) => c._id !== id))
        setTotal((prev) => prev - 1)
        toast({
          type: 'success',
          title: 'Éxito',
          message: 'Cultivo eliminado correctamente.',
        })
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error desconocido')
        toast({
          type: 'error',
          title: 'Error',
          message: 'Error al eliminar el cultivo.',
        })
        throw err
      } finally {
        setLoading(false)
      }
    },
    [toast],
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
    fetchCultivos,
    addCultivo,
    updateCultivo,
    deleteCultivo,
  }
}

export const useCultivoStats = (filters?: CultivoFilters) => {
  const [stats, setStats] = useState({
    total: 0,
    totalArea: 0,
    porTipo: {} as Record<string, number>,
    porEstado: {} as Record<string, number>,
  })
  const [loadingStats, setLoadingStats] = useState(false)
  const { toast } = useToast()

  const fetchStats = useCallback(async () => {
    setLoadingStats(true)
    try {
      const fetchedStats = await cultivoService.getStats()
      setStats(fetchedStats)
    } catch (err) {
      console.error('Error al cargar estadísticas de cultivos:', err)
      toast({
        type: 'error',
        title: 'Error',
        message: 'Error al cargar las estadísticas de cultivos.',
      })
      setStats({
        total: 0,
        totalArea: 0,
        porTipo: {},
        porEstado: {},
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
