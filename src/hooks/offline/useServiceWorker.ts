'use client'
import { useEffect, useState } from 'react'

export interface ServiceWorkerState {
  isSupported: boolean
  isRegistered: boolean
  isUpdating: boolean
  registration: ServiceWorkerRegistration | null
  error: string | null
}

export const useServiceWorker = () => {
  const [state, setState] = useState<ServiceWorkerState>({
    isSupported: false,
    isRegistered: false,
    isUpdating: false,
    registration: null,
    error: null
  })

  useEffect(() => {
    // Verificar soporte de Service Workers
    if (typeof window === 'undefined') {
      setState(prev => ({ ...prev, isSupported: false }))
      return
    }

    // Verificar soporte de Service Workers
    if (!('serviceWorker' in navigator)) {
      console.warn('⚠️ Service Workers no soportados en este navegador')
      setState(prev => ({ ...prev, isSupported: false }))
      return
    }

    // Verificar que estamos en HTTPS o localhost
    if (location.protocol !== 'https:' && location.hostname !== 'localhost' && location.hostname !== '127.0.0.1') {
      console.warn('⚠️ Service Workers requieren HTTPS o localhost')
      setState(prev => ({ ...prev, isSupported: false }))
      return
    }

    setState(prev => ({ ...prev, isSupported: true }))

    // Registrar Service Worker
    const registerServiceWorker = async () => {
      try {
        console.log('🔧 Registrando Service Worker...')
        
        const registration = await navigator.serviceWorker.register('/sw-offline-real.js', {
          scope: '/'
        })

        console.log('✅ Service Worker registrado:', registration)

        setState(prev => ({
          ...prev,
          isRegistered: true,
          registration,
          error: null
        }))

        // Manejar actualizaciones
        registration.addEventListener('updatefound', () => {
          console.log('🔄 Service Worker: Actualización encontrada')
          setState(prev => ({ ...prev, isUpdating: true }))

          const newWorker = registration.installing
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed') {
                if (navigator.serviceWorker.controller) {
                  // Nueva versión disponible
                  console.log('🆕 Service Worker: Nueva versión disponible')
                  
                  // Notificar al usuario sobre la actualización
                  if (confirm('Hay una nueva versión disponible. ¿Deseas actualizar?')) {
                    newWorker.postMessage({ type: 'SKIP_WAITING' })
                    window.location.reload()
                  }
                } else {
                  // Primera instalación
                  console.log('🎉 Service Worker: Instalación completa')
                  setState(prev => ({ ...prev, isUpdating: false }))
                }
              }
            })
          }
        })

        // Manejar control de Service Worker
        if (registration.waiting) {
          console.log('⏳ Service Worker: Esperando activación')
        }

        if (registration.active) {
          console.log('✅ Service Worker: Activo y funcionando')
        }

      } catch (error) {
        console.error('❌ Error registrando Service Worker:', error)
        setState(prev => ({
          ...prev,
          error: error instanceof Error ? error.message : 'Error desconocido'
        }))
      }
    }

    // Verificar si ya está registrado
    navigator.serviceWorker.getRegistration()
      .then(registration => {
        if (registration) {
          console.log('✅ Service Worker ya registrado')
          setState(prev => ({
            ...prev,
            isRegistered: true,
            registration
          }))
        } else {
          registerServiceWorker()
        }
      })
      .catch(error => {
        console.error('❌ Error verificando registro de Service Worker:', error)
        setState(prev => ({
          ...prev,
          error: error instanceof Error ? error.message : 'Error verificando registro'
        }))
      })

    // Manejar mensajes del Service Worker
    const handleMessage = (event: MessageEvent) => {
      const { type, data } = event.data
      
      switch (type) {
        case 'CACHE_STATUS':
          console.log('📊 Estado del cache:', data)
          break
        case 'SYNC_RESULTS':
          console.log('🔄 Resultados de sincronización:', data)
          break
        case 'CACHE_CLEARED':
          console.log('🧹 Cache limpiado')
          break
        default:
          console.log('📨 Mensaje del Service Worker:', type, data)
      }
    }

    navigator.serviceWorker.addEventListener('message', handleMessage)

    // Limpiar listeners
    return () => {
      navigator.serviceWorker.removeEventListener('message', handleMessage)
    }
  }, [])

  // Forzar actualización del Service Worker
  const updateServiceWorker = async () => {
    if (!state.registration) return

    try {
      console.log('🔄 Forzando actualización del Service Worker...')
      await state.registration.update()
    } catch (error) {
      console.error('❌ Error actualizando Service Worker:', error)
    }
  }

  // Limpiar cache
  const clearCache = async () => {
    if (!state.registration) return

    try {
      console.log('🧹 Limpiando cache...')
      
      // Enviar mensaje al Service Worker
      if (navigator.serviceWorker.controller) {
        const messageChannel = new MessageChannel()
        
        const clearPromise = new Promise<void>((resolve, reject) => {
          messageChannel.port1.onmessage = (event) => {
            const { type } = event.data
            
            if (type === 'CACHE_CLEARED') {
              console.log('✅ Cache limpiado')
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
      throw error
    }
  }

  // Obtener estado del cache
  const getCacheStatus = async () => {
    if (!state.registration) return null

    try {
      if (navigator.serviceWorker.controller) {
        const messageChannel = new MessageChannel()
        
        const statusPromise = new Promise<Record<string, unknown> | null>((resolve, reject) => {
          messageChannel.port1.onmessage = (event) => {
            const { type, data } = event.data
            
            if (type === 'CACHE_STATUS') {
              resolve(data)
            } else if (type === 'CACHE_ERROR') {
              reject(new Error('Error obteniendo estado del cache'))
            }
          }
        })

        navigator.serviceWorker.controller.postMessage(
          { type: 'GET_CACHE_STATUS' },
          [messageChannel.port2]
        )

        return await statusPromise
      }
    } catch (error) {
      console.error('❌ Error obteniendo estado del cache:', error)
      return null
    }
  }

  return {
    ...state,
    updateServiceWorker,
    clearCache,
    getCacheStatus
  }
}
