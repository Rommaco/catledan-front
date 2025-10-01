'use client'
import { useState, useEffect, useCallback } from 'react'
import { indexedDBManager, OfflineDataItem } from '@/lib/offline/indexedDB'

export interface UseOfflineDataOptions {
  type: OfflineDataItem['type']
  autoSync?: boolean
  syncInterval?: number
}

export interface OfflineDataState<T = Record<string, unknown>> {
  data: T[]
  loading: boolean
  error: string | null
  lastSync: Date | null
  pendingCount: number
}

export const useOfflineData = <T = Record<string, unknown>>(options: UseOfflineDataOptions) => {
  const { type, autoSync = true, syncInterval = 60000 } = options
  
  const [state, setState] = useState<OfflineDataState<T>>({
    data: [],
    loading: true,
    error: null,
    lastSync: null,
    pendingCount: 0
  })

  // Cargar datos offline
  const loadOfflineData = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }))
      
      const offlineData = await indexedDBManager.getOfflineData(type)
      const unsyncedData = await indexedDBManager.getUnsyncedData()
      
      setState(prev => ({
        ...prev,
        data: offlineData.map(item => item.data) as T[],
        pendingCount: unsyncedData.filter(item => item.type === type).length,
        loading: false
      }))
    } catch (error) {
      console.error(`❌ Error cargando datos offline para ${type}:`, error)
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Error desconocido',
        loading: false
      }))
    }
  }, [type])

  // Guardar datos offline
  const saveOfflineData = useCallback(async (data: T, action: OfflineDataItem['action'] = 'create') => {
    try {
      const offlineItem: Omit<OfflineDataItem, 'id'> = {
        type,
        data,
        timestamp: Date.now(),
        synced: false,
        action
      }

      const id = await indexedDBManager.saveOfflineData(offlineItem)
      
      // Recargar datos
      await loadOfflineData()
      
      console.log(`💾 Datos ${type} guardados offline:`, { id, action })
      return id
    } catch (error) {
      console.error(`❌ Error guardando datos offline para ${type}:`, error)
      throw error
    }
  }, [type, loadOfflineData])

  // Actualizar datos offline
  const updateOfflineData = useCallback(async (id: number, data: T) => {
    try {
      // Obtener datos existentes
      const offlineData = await indexedDBManager.getOfflineData(type)
      const existingItem = offlineData.find(item => item.id === id)
      
      if (!existingItem) {
        throw new Error('Item no encontrado')
      }

      // Actualizar datos
      const updatedItem: Omit<OfflineDataItem, 'id'> = {
        ...existingItem,
        data,
        action: 'update',
        synced: false
      }

      await indexedDBManager.saveOfflineData(updatedItem)
      
      // Recargar datos
      await loadOfflineData()
      
      console.log(`📝 Datos ${type} actualizados offline:`, { id })
    } catch (error) {
      console.error(`❌ Error actualizando datos offline para ${type}:`, error)
      throw error
    }
  }, [type, loadOfflineData])

  // Eliminar datos offline
  const deleteOfflineData = useCallback(async (id: number) => {
    try {
      // Marcar como eliminado en lugar de eliminar físicamente
      const offlineData = await indexedDBManager.getOfflineData(type)
      const existingItem = offlineData.find(item => item.id === id)
      
      if (!existingItem) {
        throw new Error('Item no encontrado')
      }

      const deletedItem: Omit<OfflineDataItem, 'id'> = {
        ...existingItem,
        action: 'delete',
        synced: false
      }

      await indexedDBManager.saveOfflineData(deletedItem)
      
      // Recargar datos
      await loadOfflineData()
      
      console.log(`🗑️ Datos ${type} marcados para eliminación offline:`, { id })
    } catch (error) {
      console.error(`❌ Error eliminando datos offline para ${type}:`, error)
      throw error
    }
  }, [type, loadOfflineData])

  // Sincronizar datos con servidor
  const syncData = useCallback(async () => {
    try {
      const unsyncedData = await indexedDBManager.getUnsyncedData()
      const typeData = unsyncedData.filter(item => item.type === type)
      
      if (typeData.length === 0) {
        console.log(`✅ No hay datos ${type} pendientes de sincronización`)
        return
      }

      console.log(`🔄 Sincronizando ${typeData.length} items de ${type}...`)

      for (const item of typeData) {
        try {
          // Determinar endpoint según el tipo
          const endpoint = getEndpointForType(type)
          const method = getMethodForAction(item.action)
          
          const response = await fetch(endpoint, {
            method,
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
            },
            body: item.action !== 'delete' ? JSON.stringify(item.data) : undefined
          })

          if (response.ok) {
            // Marcar como sincronizado
            if (item.id) {
              await indexedDBManager.markAsSynced(item.id)
            }
            console.log(`✅ Item ${type} sincronizado:`, item.id)
          } else {
            console.error(`❌ Error sincronizando item ${type}:`, response.status)
          }
        } catch (error) {
          console.error(`❌ Error sincronizando item ${type}:`, error)
        }
      }

      // Recargar datos después de sincronización
      await loadOfflineData()
      
      setState(prev => ({
        ...prev,
        lastSync: new Date()
      }))
      
    } catch (error) {
      console.error(`❌ Error en sincronización de ${type}:`, error)
      throw error
    }
  }, [type, loadOfflineData])

  // Obtener endpoint según tipo
  const getEndpointForType = (type: OfflineDataItem['type']): string => {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'
    
    switch (type) {
      case 'ganado':
        return `${baseUrl}/ganado`
      case 'finanza':
        return `${baseUrl}/finanzas`
      case 'produccion':
        return `${baseUrl}/produccion-leche`
      case 'cultivo':
        return `${baseUrl}/cultivos`
      case 'reporte':
        return `${baseUrl}/reportes`
      default:
        throw new Error(`Tipo no soportado: ${type}`)
    }
  }

  // Obtener método HTTP según acción
  const getMethodForAction = (action: OfflineDataItem['action']): string => {
    switch (action) {
      case 'create':
        return 'POST'
      case 'update':
        return 'PUT'
      case 'delete':
        return 'DELETE'
      default:
        return 'POST'
    }
  }

  // Cargar datos al montar
  useEffect(() => {
    loadOfflineData()
  }, [loadOfflineData])

  // Sincronización automática
  useEffect(() => {
    if (!autoSync) return

    const interval = setInterval(() => {
      // Solo sincronizar si hay conexión
      if (navigator.onLine) {
        syncData().catch(error => {
          console.error('❌ Error en sincronización automática:', error)
        })
      }
    }, syncInterval)

    return () => clearInterval(interval)
  }, [autoSync, syncInterval, syncData])

  // Sincronizar cuando se restaura la conexión
  useEffect(() => {
    const handleOnline = () => {
      if (autoSync) {
        syncData().catch(error => {
          console.error('❌ Error en sincronización al restaurar conexión:', error)
        })
      }
    }

    window.addEventListener('online', handleOnline)
    return () => window.removeEventListener('online', handleOnline)
  }, [autoSync, syncData])

  return {
    ...state,
    loadOfflineData,
    saveOfflineData,
    updateOfflineData,
    deleteOfflineData,
    syncData
  }
}
