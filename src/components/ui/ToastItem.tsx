'use client'

import React, { useEffect, useState } from 'react'
import { cn } from '@/lib/utils'
import { XMarkIcon, CheckCircleIcon, ExclamationTriangleIcon, InformationCircleIcon, XCircleIcon } from '@heroicons/react/24/outline'

interface ToastItemProps {
  id: string
  type: 'success' | 'error' | 'warning' | 'info'
  title?: string
  message: string
  duration?: number
  onDismiss?: () => void
}

export const ToastItem: React.FC<ToastItemProps> = ({
  id,
  type,
  title,
  message,
  duration = 5000,
  onDismiss
}) => {
  const [isVisible, setIsVisible] = useState(false)
  const [isExiting, setIsExiting] = useState(false)

  useEffect(() => {
    // Animar entrada
    const timer = setTimeout(() => setIsVisible(true), 100)
    
    // Auto dismiss
    const dismissTimer = setTimeout(() => {
      handleDismiss()
    }, duration)

    return () => {
      clearTimeout(timer)
      clearTimeout(dismissTimer)
    }
  }, [duration])

  const handleDismiss = () => {
    setIsExiting(true)
    setTimeout(() => {
      onDismiss?.()
    }, 300)
  }

  const getIcon = () => {
    const iconClass = "w-5 h-5"
    switch (type) {
      case 'success':
        return <CheckCircleIcon className={cn(iconClass, "text-green-500")} />
      case 'error':
        return <XCircleIcon className={cn(iconClass, "text-red-500")} />
      case 'warning':
        return <ExclamationTriangleIcon className={cn(iconClass, "text-yellow-500")} />
      case 'info':
        return <InformationCircleIcon className={cn(iconClass, "text-blue-500")} />
      default:
        return <InformationCircleIcon className={cn(iconClass, "text-gray-500")} />
    }
  }

  const getBackgroundColor = () => {
    switch (type) {
      case 'success':
        return 'bg-green-50 border-green-200'
      case 'error':
        return 'bg-red-50 border-red-200'
      case 'warning':
        return 'bg-yellow-50 border-yellow-200'
      case 'info':
        return 'bg-blue-50 border-blue-200'
      default:
        return 'bg-gray-50 border-gray-200'
    }
  }

  const getTextColor = () => {
    switch (type) {
      case 'success':
        return 'text-green-800'
      case 'error':
        return 'text-red-800'
      case 'warning':
        return 'text-yellow-800'
      case 'info':
        return 'text-blue-800'
      default:
        return 'text-gray-800'
    }
  }

  return (
    <div
      className={cn(
        'w-80 p-4 rounded-lg border shadow-lg transform transition-all duration-300 ease-in-out',
        getBackgroundColor(),
        isVisible && !isExiting
          ? 'translate-x-0 opacity-100 scale-100'
          : 'translate-x-full opacity-0 scale-95',
        isExiting && 'translate-x-full opacity-0 scale-95'
      )}
    >
      <div className="flex items-start space-x-3">
        <div className="flex-shrink-0">
          {getIcon()}
        </div>
        
        <div className="flex-1 min-w-0">
          {title && (
            <h4 className={cn('text-sm font-semibold mb-1', getTextColor())}>
              {title}
            </h4>
          )}
          <p className={cn('text-sm', getTextColor())}>
            {message}
          </p>
        </div>
        
        <div className="flex-shrink-0">
          <button
            onClick={handleDismiss}
            className={cn(
              'inline-flex items-center justify-center w-5 h-5 rounded-full transition-colors duration-200',
              type === 'success' && 'hover:bg-green-100 text-green-500',
              type === 'error' && 'hover:bg-red-100 text-red-500',
              type === 'warning' && 'hover:bg-yellow-100 text-yellow-500',
              type === 'info' && 'hover:bg-blue-100 text-blue-500',
              !type && 'hover:bg-gray-100 text-gray-500'
            )}
          >
            <XMarkIcon className="w-4 h-4" />
          </button>
        </div>
      </div>
      
      {/* Progress bar */}
      <div className="mt-3 w-full bg-white/50 rounded-full h-1 overflow-hidden">
        <div
          className={cn(
            'h-1 rounded-full transition-all duration-300 ease-linear',
            type === 'success' && 'bg-green-500',
            type === 'error' && 'bg-red-500',
            type === 'warning' && 'bg-yellow-500',
            type === 'info' && 'bg-blue-500',
            !type && 'bg-gray-500'
          )}
          style={{
            animation: `progress ${duration}ms linear forwards`
          }}
        />
      </div>
    </div>
  )
}
