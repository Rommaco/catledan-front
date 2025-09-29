import { useState, useCallback } from 'react'
import { produccionLecheService } from '@/lib/produccionLeche/produccionLecheService'
import { 
  ProduccionLeche, 
  CreateProduccionLecheData, 
  UpdateProduccionLecheData, 
  ProduccionLecheFilters 
} from '@/types/produccionLeche'

export const useProduccionLeche = () => {
  const [data, setData] = useState<ProduccionLeche[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchProduccionLeche = useCallback(async (filters?: ProduccionLecheFilters) => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await produccionLecheService.getAll(filters)
      setData(response.data)
      setTotal(response.total)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido')
    } finally {
      setLoading(false)
    }
  }, [])

  const addProduccionLeche = useCallback(async (newProduccion: CreateProduccionLecheData) => {
    try {
      const createdProduccion = await produccionLecheService.create(newProduccion)
      setData(prev => [...prev, createdProduccion])
      setTotal(prev => prev + 1)
      return createdProduccion
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al agregar producción')
      throw err
    }
  }, [])

  const updateProduccionLeche = useCallback(async (id: string, updatedProduccion: UpdateProduccionLecheData) => {
    try {
      const newUpdatedProduccion = await produccionLecheService.update(id, updatedProduccion)
      setData(prev => prev.map(p => p._id === id ? newUpdatedProduccion : p))
      return newUpdatedProduccion
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al actualizar producción')
      throw err
    }
  }, [])

  const deleteProduccionLeche = useCallback(async (id: string) => {
    try {
      await produccionLecheService.delete(id)
      setData(prev => prev.filter(p => p._id !== id))
      setTotal(prev => prev - 1)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al eliminar producción')
      throw err
    }
  }, [])

  const getById = useCallback(async (id: string) => {
    try {
      return await produccionLecheService.getById(id)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al obtener producción')
      throw err
    }
  }, [])

  return {
    data,
    total,
    loading,
    error,
    fetchProduccionLeche,
    addProduccionLeche,
    updateProduccionLeche,
    deleteProduccionLeche,
    getById
  }
}

export const useProduccionLecheStats = () => {
  const [stats, setStats] = useState<{
    total: number;
    promedioDiario: number;
    totalLitros: number;
    porMes: Record<string, number>;
  }>({
    total: 0,
    promedioDiario: 0,
    totalLitros: 0,
    porMes: {}
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchStats = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const statsData = await produccionLecheService.getStats()
      setStats(statsData)
    } catch (err) {
      console.error('Error al cargar estadísticas:', err)
      // No establecer error para que la UI no se rompa
      // Las estadísticas son opcionales
      setStats({
        total: 0,
        promedioDiario: 0,
        totalLitros: 0,
        porMes: {}
      })
    } finally {
      setLoading(false)
    }
  }, [])

  return {
    stats,
    loading,
    error,
    fetchStats
  }
}
