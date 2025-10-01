'use client'
import React, { useState, useEffect } from 'react'
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline'

export const BrowserCompatibilityWarning: React.FC = () => {
  const [showWarning, setShowWarning] = useState(false)
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
    
    // Verificar soporte de Service Workers
    if (!('serviceWorker' in navigator)) {
      setShowWarning(true)
    }
  }, [])

  if (!isClient || !showWarning) {
    return null
  }

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:max-w-md z-50">
      <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-lg shadow-lg">
        <div className="flex">
          <div className="flex-shrink-0">
            <ExclamationTriangleIcon className="h-5 w-5 text-yellow-400" />
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-yellow-800">
              Modo Offline No Disponible
            </h3>
            <div className="mt-2 text-sm text-yellow-700">
              <p>
                Tu navegador no soporta Service Workers, por lo que el modo offline no está disponible.
                La aplicación funcionará normalmente, pero requiere conexión a internet.
              </p>
              <p className="mt-2">
                <strong>Navegadores compatibles:</strong> Chrome, Edge, Firefox, Safari (versiones recientes), Brave
              </p>
            </div>
            <div className="mt-4">
              <button
                type="button"
                onClick={() => setShowWarning(false)}
                className="text-sm font-medium text-yellow-800 hover:text-yellow-900"
              >
                Entendido
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
