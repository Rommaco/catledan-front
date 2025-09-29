'use client'
import { useState, useCallback, useEffect } from 'react'
import { ganadoService } from '@/lib/ganado/ganadoService'
import { 
  Ganado, 
  CreateGanadoData, 
  UpdateGanadoData, 
  GanadoFilters,
  GanadoResponse
} from '@/types/ganado'

export const useGanado = () => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [data, setData] = useState<Ganado[]>([])
  const [total, setTotal] = useState(0)
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)

  const fetchGanado = useCallback(async (filters?: GanadoFilters) => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await ganadoService.getAll({
        ...filters,
        page: currentPage,
        limit: pageSize
      })
      
      setData(response.data)
      setTotal(response.total)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido')
    } finally {
      setLoading(false)
    }
  }, [currentPage, pageSize])

  const createGanado = useCallback(async (ganadoData: CreateGanadoData) => {
    try {
      setLoading(true)
      setError(null)
      
      await ganadoService.create(ganadoData)
      await fetchGanado() // Recargar la lista
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al crear ganado')
      throw err
    } finally {
      setLoading(false)
    }
  }, [fetchGanado])

  const updateGanado = useCallback(async (id: string, ganadoData: UpdateGanadoData) => {
    try {
      setLoading(true)
      setError(null)
      
      await ganadoService.update(id, ganadoData)
      await fetchGanado() // Recargar la lista
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al actualizar ganado')
      throw err
    } finally {
      setLoading(false)
    }
  }, [fetchGanado])

  const deleteGanado = useCallback(async (id: string) => {
    try {
      setLoading(true)
      setError(null)
      
      await ganadoService.delete(id)
      await fetchGanado() // Recargar la lista
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al eliminar ganado')
      throw err
    } finally {
      setLoading(false)
    }
  }, [fetchGanado])

  const refresh = useCallback(() => {
    fetchGanado()
  }, [fetchGanado])

  // Cargar datos al montar el componente
  useEffect(() => {
    fetchGanado()
  }, [fetchGanado])

  return {
    // Estado
    loading,
    error,
    data,
    total,
    currentPage,
    pageSize,
    
    // Acciones
    fetchGanado,
    createGanado,
    updateGanado,
    deleteGanado,
    refresh,
    
    // Paginación
    setCurrentPage,
    setPageSize,
  }
}

export const useGanadoStats = () => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [stats, setStats] = useState<{
    total: number;
    porCategoria: Record<string, number>;
    porEstado: Record<string, number>;
    porSexo: Record<string, number>;
  } | null>(null)

  const fetchStats = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      
      const data = await ganadoService.getStats()
      setStats(data)
    } catch (err) {
      console.error('Error al cargar estadísticas:', err)
      // No establecer error para que la UI no se rompa
      // Las estadísticas son opcionales
      setStats({
        total: 0,
        porCategoria: {},
        porEstado: {},
        porSexo: {}
      })
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchStats()
  }, [fetchStats])

  return {
    loading,
    error,
    stats,
    refresh: fetchStats,
  }
}
