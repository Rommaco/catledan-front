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

export const TestOfflineIndicator: React.FC = () => {
  const { status, syncStats, forceSync, clearSyncedData, clearCache } = useOfflineStatus()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // No renderizar hasta que esté montado en el cliente
  if (!mounted) {
    return null
  }

  return (
    <div className="fixed top-4 right-4 z-50">
      <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-4 max-w-sm">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-gray-900">
            🔧 Test Offline Status
          </h3>
          <div className="flex items-center space-x-2">
            {status.isOnline ? (
              <Badge variant="success" className="flex items-center space-x-1">
                <WifiIcon className="w-4 h-4" />
                <span>Online</span>
              </Badge>
            ) : (
              <Badge variant="warning" className="flex items-center space-x-1">
                <SignalSlashIcon className="w-4 h-4" />
                <span>Offline</span>
              </Badge>
            )}
          </div>
        </div>

        <div className="space-y-2 text-xs">
          <div className="flex justify-between">
            <span className="text-gray-600">Estado:</span>
            <span className={`font-medium ${
              status.isOnline ? 'text-green-600' : 'text-orange-600'
            }`}>
              {status.isOnline ? 'Conectado' : 'Sin conexión'}
            </span>
          </div>
          
          <div className="flex justify-between">
            <span className="text-gray-600">Sincronización:</span>
            <span className={`font-medium ${
              status.syncStatus === 'idle' ? 'text-green-600' :
              status.syncStatus === 'syncing' ? 'text-blue-600' :
              status.syncStatus === 'error' ? 'text-red-600' : 'text-orange-600'
            }`}>
              {status.syncStatus === 'idle' ? 'Listo' :
               status.syncStatus === 'syncing' ? 'Sincronizando...' :
               status.syncStatus === 'error' ? 'Error' : 'Pendiente'}
            </span>
          </div>

          <div className="flex justify-between">
            <span className="text-gray-600">Datos offline:</span>
            <span className="font-medium text-blue-600">
              {syncStats.offlineDataCount}
            </span>
          </div>

          <div className="flex justify-between">
            <span className="text-gray-600">Cola de sync:</span>
            <span className="font-medium text-orange-600">
              {syncStats.syncQueueCount}
            </span>
          </div>

          <div className="flex justify-between">
            <span className="text-gray-600">Cache:</span>
            <span className="font-medium text-purple-600">
              {syncStats.cacheCount}
            </span>
          </div>
        </div>

        <div className="mt-3 pt-3 border-t border-gray-200">
          <div className="flex space-x-2">
            <Button
              size="sm"
              variant="secondary"
              onClick={forceSync}
              disabled={status.syncStatus === 'syncing'}
              className="flex items-center space-x-1"
            >
              <ArrowPathIcon className="w-3 h-3" />
              <span>Sync</span>
            </Button>
            
            <Button
              size="sm"
              variant="secondary"
              onClick={clearSyncedData}
              className="flex items-center space-x-1"
            >
              <span>🧹</span>
              <span>Clear</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
