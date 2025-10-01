'use client'
import { useState, useEffect, useCallback } from 'react'

export interface OfflineStatus {
  isOnline: boolean
  isOffline: boolean
  lastOnline: Date | null
  connectionType: string | null
  syncStatus: 'idle' | 'syncing' | 'error'
  pendingSync: number
}

export interface SyncStats {
  offlineDataCount: number
  syncQueueCount: number
  cacheCount: number
  lastSync: Date | null
}

export const useOfflineStatus = () => {
  const [status, setStatus] = useState<OfflineStatus>({
    isOnline: true, // Valor inicial seguro para SSR
    isOffline: false, // Valor inicial seguro para SSR
    lastOnline: null,
    connectionType: null,
    syncStatus: 'idle',
    pendingSync: 0
  })

  const [isClient, setIsClient] = useState(false)

  const [syncStats, setSyncStats] = useState<SyncStats>({
    offlineDataCount: 0,
    syncQueueCount: 0,
    cacheCount: 0,
    lastSync: null
  })

  // Detectar cuando estamos en el cliente
  useEffect(() => {
    setIsClient(true)
    
    // Establecer estado inicial real del cliente
    setStatus(prev => ({
      ...prev,
      isOnline: navigator.onLine,
      isOffline: !navigator.onLine
    }))
  }, [])

  // Actualizar estadísticas de sincronización
  const updateSyncStats = useCallback(async () => {
    try {
      // Importar dinámicamente para evitar problemas de SSR
      const { indexedDBManager } = await import('@/lib/offline/indexedDB')
      const stats = await indexedDBManager.getStorageStats()
      
      setSyncStats(prev => ({
        ...prev,
        offlineDataCount: stats.offlineDataCount,
        syncQueueCount: stats.syncQueueCount,
        cacheCount: stats.cacheCount
      }))

      setStatus(prev => ({
        ...prev,
        pendingSync: stats.syncQueueCount
      }))
    } catch (error) {
      console.error('❌ Error actualizando estadísticas de sincronización:', error)
    }
  }, [])

  // Iniciar sincronización
  const triggerSync = useCallback(async () => {
    if (!status.isOnline) {
      console.log('📴 No se puede sincronizar - Sin conexión')
      return
    }

    setStatus(prev => ({ ...prev, syncStatus: 'syncing' }))

    try {
      // Enviar mensaje al Service Worker para procesar cola de sincronización
      if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
        const messageChannel = new MessageChannel()
        
        const syncPromise = new Promise<void>((resolve, reject) => {
          messageChannel.port1.onmessage = (event) => {
            const { type, data } = event.data
            
            if (type === 'SYNC_RESULTS') {
              console.log('✅ Sincronización completada:', data)
              setStatus(prev => ({ ...prev, syncStatus: 'idle' }))
              setSyncStats(prev => ({ ...prev, lastSync: new Date() }))
              // Actualizar estadísticas después de un delay para evitar dependencias circulares
              setTimeout(() => {
                updateSyncStats()
              }, 100)
              resolve()
            } else if (type === 'SYNC_ERROR') {
              console.error('❌ Error en sincronización:', data)
              setStatus(prev => ({ ...prev, syncStatus: 'error' }))
              reject(new Error(data))
            }
          }
        })

        navigator.serviceWorker.controller.postMessage(
          { type: 'SYNC_QUEUE' },
          [messageChannel.port2]
        )

        await syncPromise
      } else {
        console.log('⚠️ Service Worker no disponible para sincronización')
        setStatus(prev => ({ ...prev, syncStatus: 'idle' }))
      }
    } catch (error) {
      console.error('❌ Error en sincronización:', error)
      setStatus(prev => ({ ...prev, syncStatus: 'error' }))
    }
  }, [status.isOnline, updateSyncStats])

  // Detectar cambios en el estado de conexión
  useEffect(() => {
    if (!isClient) return

    const handleOnline = () => {
      console.log('🌐 Conexión restaurada')
      setStatus(prev => ({
        ...prev,
        isOnline: true,
        isOffline: false,
        lastOnline: new Date()
      }))
    }

    const handleOffline = () => {
      console.log('📴 Conexión perdida - Modo offline activado')
      setStatus(prev => ({
        ...prev,
        isOnline: false,
        isOffline: true
      }))
    }

    // Detectar tipo de conexión si está disponible
    const updateConnectionType = () => {
      if ('connection' in navigator) {
        const connection = (navigator as { connection?: { effectiveType?: string } }).connection
        setStatus(prev => ({
          ...prev,
          connectionType: connection?.effectiveType || 'unknown'
        }))
      }
    }

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
    window.addEventListener('load', updateConnectionType)

    // Detectar tipo de conexión inicial
    updateConnectionType()

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
      window.removeEventListener('load', updateConnectionType)
    }
  }, [isClient])

  // Sincronizar cuando se restaura la conexión
  useEffect(() => {
    if (isClient && status.isOnline && status.lastOnline) {
      // Solo sincronizar si acabamos de restaurar la conexión
      const timeSinceLastOnline = Date.now() - status.lastOnline.getTime()
      if (timeSinceLastOnline < 5000) { // Solo en los primeros 5 segundos
        // Llamar triggerSync sin incluirlo en las dependencias
        triggerSync().catch(error => {
          console.error('❌ Error en sincronización automática:', error)
        })
      }
    }
  }, [isClient, status.isOnline, status.lastOnline]) // Dependencias estables

  // Actualizar estadísticas periódicamente
  useEffect(() => {
    updateSyncStats()
    
    const interval = setInterval(updateSyncStats, 30000) // Cada 30 segundos
    
    return () => clearInterval(interval)
  }, [updateSyncStats])

  // Forzar sincronización manual
  const forceSync = useCallback(async () => {
    console.log('🔄 Forzando sincronización manual...')
    await triggerSync()
  }, [triggerSync])

  // Limpiar datos sincronizados
  const clearSyncedData = useCallback(async () => {
    try {
      const { indexedDBManager } = await import('@/lib/offline/indexedDB')
      await indexedDBManager.deleteSyncedData()
      await updateSyncStats()
      console.log('🧹 Datos sincronizados eliminados')
    } catch (error) {
      console.error('❌ Error limpiando datos sincronizados:', error)
    }
  }, [updateSyncStats])

  // Limpiar cache
  const clearCache = useCallback(async () => {
    try {
      if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
        const messageChannel = new MessageChannel()
        
        const clearPromise = new Promise<void>((resolve, reject) => {
          messageChannel.port1.onmessage = (event) => {
            const { type } = event.data
            
            if (type === 'CACHE_CLEARED') {
              console.log('🧹 Cache limpiado')
              updateSyncStats()
              resolve()
            } else if (type === 'CACHE_ERROR') {
              console.error('❌ Error limpiando cache:', event.data)
              reject(new Error('Error limpiando cache'))
            }
          }
        })

        navigator.serviceWorker.controller.postMessage(
          { type: 'CLEAR_CACHE' },
          [messageChannel.port2]
        )

        await clearPromise
      }
    } catch (error) {
      console.error('❌ Error limpiando cache:', error)
    }
  }, [updateSyncStats])

  return {
    status,
    syncStats,
    triggerSync,
    forceSync,
    clearSyncedData,
    clearCache,
    updateSyncStats
  }
}