'use client'
import React, { useEffect } from 'react'
import { useServiceWorker } from '@/hooks/offline/useServiceWorker'
import { indexedDBManager } from '@/lib/offline/indexedDB'

interface ServiceWorkerProviderProps {
  children: React.ReactNode
}

export const ServiceWorkerProvider: React.FC<ServiceWorkerProviderProps> = ({ children }) => {
  const { isSupported, isRegistered, error, updateServiceWorker } = useServiceWorker()

  // Inicializar IndexedDB cuando el Service Worker esté listo
  useEffect(() => {
    if (isRegistered) {
      const initOfflineStorage = async () => {
        try {
          await indexedDBManager.init()
          console.log('✅ IndexedDB inicializado para modo offline')
        } catch (error) {
          console.error('❌ Error inicializando IndexedDB:', error)
        }
      }

      initOfflineStorage()
    }
  }, [isRegistered])

  // Mostrar errores de Service Worker en desarrollo
  useEffect(() => {
    if (error && process.env.NODE_ENV === 'development') {
      console.error('❌ Service Worker Error:', error)
    }
  }, [error])

  // Verificar actualizaciones periódicamente
  useEffect(() => {
    if (!isRegistered) return

    const checkForUpdates = () => {
      updateServiceWorker()
    }

    // Verificar actualizaciones cada 30 minutos
    const interval = setInterval(checkForUpdates, 30 * 60 * 1000)

    return () => clearInterval(interval)
  }, [isRegistered, updateServiceWorker])

  // Manejar eventos de visibilidad para sincronización
  useEffect(() => {
    if (!isRegistered) return

    const handleVisibilityChange = () => {
      if (!document.hidden && navigator.onLine) {
        // Página visible y con conexión - sincronizar datos
        console.log('🔄 Página visible - Iniciando sincronización automática')
        
        // Enviar mensaje al Service Worker para sincronizar
        if (navigator.serviceWorker.controller) {
          navigator.serviceWorker.controller.postMessage({ type: 'SYNC_QUEUE' })
        }
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [isRegistered])

  // Mostrar estado en desarrollo
  if (process.env.NODE_ENV === 'development' && !isSupported) {
    console.warn('⚠️ Service Workers no soportados en este navegador')
  }

  if (process.env.NODE_ENV === 'development' && error) {
    console.error('❌ Error en Service Worker:', error)
  }

  return <>{children}</>
}
