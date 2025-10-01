'use client'
import { useState, useCallback, useEffect } from 'react'
import { ganadoService } from '@/lib/ganado/ganadoService'
// import { useOfflineData } from '@/hooks/offline/useOfflineData' // Deshabilitado temporalmente
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
  // OFFLINE FEATURES - DESHABILITADO PARA PRODUCCIÓN
  // const [offlineData, setOfflineData] = useState<Ganado[]>([])
  // const saveOfflineData = async (data: any) => {
  //   if (typeof window !== 'undefined') {
  //     const offlineGanado = JSON.parse(localStorage.getItem('offline_ganado') || '[]')
  //     offlineGanado.push(data)
  //     localStorage.setItem('offline_ganado', JSON.stringify(offlineGanado))
  //   }
  // }
  // const syncData = async () => {
  //   console.log('🔄 Sincronización simple pendiente de implementar')
  // }

  const fetchGanado = useCallback(async (filters?: GanadoFilters) => {
    try {
      setLoading(true)
      setError(null)
      
      // OFFLINE FEATURES - DESHABILITADO PARA PRODUCCIÓN
      // if (typeof window !== 'undefined' && !navigator.onLine) {
      //   console.log('📴 Offline: Cargando ganado desde localStorage')
      //   const localData = JSON.parse(localStorage.getItem('offline_ganado') || '[]')
      //   setData(localData)
      //   setTotal(localData.length)
      //   setOfflineData(localData)
      //   setLoading(false)
      //   return
      // }
      
      // Cargar del servidor NORMALMENTE
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
      
      // OFFLINE FEATURES - DESHABILITADO PARA PRODUCCIÓN
      // if (typeof window !== 'undefined' && !navigator.onLine) {
      //   const newGanado = {
      //     ...ganadoData,
      //     _id: `offline_${Date.now()}`,
      //     createdAt: new Date().toISOString(),
      //     updatedAt: new Date().toISOString()
      //   } as Ganado
      //   await saveOfflineData(newGanado, 'create')
      //   console.log('💾 Ganado guardado offline')
      //   setOfflineData(prev => [...prev, newGanado])
      //   setData(prev => [...prev, newGanado])
      //   setTotal(prev => prev + 1)
      //   return
      // }
      
      // Guardar en servidor NORMALMENTE (MODO ONLINE)
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
      
      // OFFLINE FEATURES - DESHABILITADO PARA PRODUCCIÓN
      // if (typeof window !== 'undefined' && !navigator.onLine) {
      //   const updatedGanado = {
      //     ...(data.find(g => g._id === id) || {}),
      //     ...ganadoData,
      //     _id: id,
      //     updatedAt: new Date().toISOString()
      //   } as Ganado
      //   console.log('💾 Ganado actualizado offline')
      //   setData(prev => prev.map(g => g._id === id ? updatedGanado : g))
      //   setOfflineData(prev => prev.map(g => g._id === id ? updatedGanado : g))
      //   if (typeof window !== 'undefined') {
      //     const localData = JSON.parse(localStorage.getItem('offline_ganado') || '[]')
      //     const updated = localData.map((g: Ganado) => g._id === id ? updatedGanado : g)
      //     localStorage.setItem('offline_ganado', JSON.stringify(updated))
      //   }
      //   return
      // }
      
      // Actualizar en servidor NORMALMENTE (MODO ONLINE)
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
      
      // OFFLINE FEATURES - DESHABILITADO PARA PRODUCCIÓN
      // if (typeof window !== 'undefined' && !navigator.onLine) {
      //   console.log('💾 Ganado eliminado offline')
      //   setData(prev => prev.filter(g => g._id !== id))
      //   setOfflineData(prev => prev.filter(g => g._id !== id))
      //   setTotal(prev => prev - 1)
      //   if (typeof window !== 'undefined') {
      //     const localData = JSON.parse(localStorage.getItem('offline_ganado') || '[]')
      //     const filtered = localData.filter((g: Ganado) => g._id !== id)
      //     localStorage.setItem('offline_ganado', JSON.stringify(filtered))
      //   }
      //   return
      // }
      
      // Eliminar en servidor NORMALMENTE (MODO ONLINE)
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
    // syncData, // OFFLINE FEATURE - DESHABILITADO
    
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
