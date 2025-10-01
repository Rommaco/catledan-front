'use client'
import React, { useState, useEffect } from 'react'
import { useOfflineStatus } from '@/hooks/offline/useOfflineStatus'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { 
  WifiIcon, 
  SignalSlashIcon, 
  ArrowPathIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ClockIcon
} from '@heroicons/react/24/outline'

export const OfflineIndicator: React.FC = () => {
  const { status, syncStats, forceSync, clearSyncedData, clearCache } = useOfflineStatus()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // No renderizar hasta que esté montado en el cliente
  if (!mounted) {
    return null
  }

  const getStatusIcon = () => {
    if (status.syncStatus === 'syncing') {
      return <ArrowPathIcon className="w-4 h-4 animate-spin" />
    }
    
    if (status.isOffline) {
      return <SignalSlashIcon className="w-4 h-4" />
    }
    
    if (status.pendingSync > 0) {
      return <ClockIcon className="w-4 h-4" />
    }
    
    return <WifiIcon className="w-4 h-4" />
  }

  const getStatusColor = () => {
    if (status.isOffline) return 'bg-orange-100 text-orange-800 border-orange-200'
    if (status.syncStatus === 'syncing') return 'bg-blue-100 text-blue-800 border-blue-200'
    if (status.syncStatus === 'error') return 'bg-red-100 text-red-800 border-red-200'
    if (status.pendingSync > 0) return 'bg-yellow-100 text-yellow-800 border-yellow-200'
    return 'bg-green-100 text-green-800 border-green-200'
  }

  const getStatusText = () => {
    if (status.isOffline) return 'Modo Offline'
    if (status.syncStatus === 'syncing') return 'Sincronizando...'
    if (status.syncStatus === 'error') return 'Error de Sincronización'
    if (status.pendingSync > 0) return `${status.pendingSync} pendientes`
    return 'En Línea'
  }

  const getConnectionInfo = () => {
    if (status.connectionType) {
      return ` • ${status.connectionType.toUpperCase()}`
    }
    return ''
  }

  return (
    <div className="fixed top-4 right-4 z-50">
      <div className="flex items-center gap-2">
        {/* Indicador principal */}
        <Badge 
          className={`flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium border ${getStatusColor()}`}
        >
          {getStatusIcon()}
          <span>{getStatusText()}</span>
          {getConnectionInfo()}
        </Badge>

        {/* Botones de acción */}
        {status.isOnline && (
          <div className="flex items-center gap-1">
            {status.pendingSync > 0 && (
              <Button
                size="sm"
                variant="secondary"
                onClick={forceSync}
                disabled={status.syncStatus === 'syncing'}
                className="h-8 px-2 text-xs"
              >
                <ArrowPathIcon className={`w-3 h-3 ${status.syncStatus === 'syncing' ? 'animate-spin' : ''}`} />
                Sincronizar
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Panel de estadísticas (expandible) */}
      {(status.pendingSync > 0 || syncStats.offlineDataCount > 0) && (
        <div className="mt-2 bg-white border border-gray-200 rounded-lg shadow-lg p-3 min-w-[300px]">
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Datos Offline:</span>
              <span className="font-medium">{syncStats.offlineDataCount}</span>
            </div>
            
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Cola de Sincronización:</span>
              <span className="font-medium">{syncStats.syncQueueCount}</span>
            </div>
            
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Cache:</span>
              <span className="font-medium">{syncStats.cacheCount}</span>
            </div>

            {syncStats.lastSync && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Última Sincronización:</span>
                <span className="font-medium text-xs">
                  {new Date(syncStats.lastSync).toLocaleTimeString()}
                </span>
              </div>
            )}

            {/* Botones de gestión */}
            <div className="flex gap-2 pt-2 border-t border-gray-100">
              <Button
                size="sm"
                variant="secondary"
                onClick={clearSyncedData}
                className="flex-1 text-xs"
              >
                Limpiar Sincronizados
              </Button>
              
              <Button
                size="sm"
                variant="secondary"
                onClick={clearCache}
                className="flex-1 text-xs"
              >
                Limpiar Cache
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Notificación de estado */}
      {status.syncStatus === 'error' && (
        <div className="mt-2 bg-red-50 border border-red-200 rounded-lg p-3 min-w-[300px]">
          <div className="flex items-center gap-2">
            <ExclamationTriangleIcon className="w-4 h-4 text-red-600" />
            <span className="text-sm text-red-800 font-medium">
              Error de Sincronización
            </span>
          </div>
          <p className="text-xs text-red-600 mt-1">
            Algunos datos no se pudieron sincronizar. Se reintentará automáticamente.
          </p>
        </div>
      )}

      {status.syncStatus === 'syncing' && (
        <div className="mt-2 bg-blue-50 border border-blue-200 rounded-lg p-3 min-w-[300px]">
          <div className="flex items-center gap-2">
            <ArrowPathIcon className="w-4 h-4 text-blue-600 animate-spin" />
            <span className="text-sm text-blue-800 font-medium">
              Sincronizando Datos
            </span>
          </div>
          <p className="text-xs text-blue-600 mt-1">
            Enviando datos offline al servidor...
          </p>
        </div>
      )}

      {status.isOffline && (
        <div className="mt-2 bg-orange-50 border border-orange-200 rounded-lg p-3 min-w-[300px]">
          <div className="flex items-center gap-2">
            <SignalSlashIcon className="w-4 h-4 text-orange-600" />
            <span className="text-sm text-orange-800 font-medium">
              Modo Offline Activo
            </span>
          </div>
          <p className="text-xs text-orange-600 mt-1">
            Los datos se guardarán localmente y se sincronizarán cuando vuelva la conexión.
          </p>
        </div>
      )}
    </div>
  )
}
