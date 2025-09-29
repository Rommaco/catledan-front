'use client'
import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react'
import { cn } from '@/lib/utils'
import { XMarkIcon, CheckCircleIcon, ExclamationTriangleIcon, InformationCircleIcon, XCircleIcon } from '@heroicons/react/24/outline'

interface Toast {
  id: string
  type: 'success' | 'error' | 'warning' | 'info'
  title?: string
  message: string
  duration?: number
}

interface ToastContextType {
  toasts: Toast[]
  addToast: (toast: Omit<Toast, 'id'>) => void
  removeToast: (id: string) => void
}

const ToastContext = createContext<ToastContextType | undefined>(undefined)

export const useToast = () => {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider')
  }
  return context
}

interface ToastProviderProps {
  children: ReactNode
}

export const ToastProvider: React.FC<ToastProviderProps> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([])

  const addToast = useCallback((toast: Omit<Toast, 'id'>) => {
    const id = Math.random().toString(36).substr(2, 9)
    const newToast = { ...toast, id }
    
    setToasts(prev => [...prev, newToast])
    
    // Auto remove after duration
    setTimeout(() => {
      removeToast(id)
    }, toast.duration || 5000)
  }, [])

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id))
  }, [])

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast }}>
      {children}
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </ToastContext.Provider>
  )
}

interface ToastContainerProps {
  toasts: Toast[]
  removeToast: (id: string) => void
}

const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, removeToast }) => {
  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onRemove={removeToast} />
      ))}
    </div>
  )
}

interface ToastItemProps {
  toast: Toast
  onRemove: (id: string) => void
}

const ToastItem: React.FC<ToastItemProps> = ({ toast, onRemove }) => {
  const [isVisible, setIsVisible] = useState(false)
  const [isRemoving, setIsRemoving] = useState(false)

  useEffect(() => {
    // Start entrance animation
    setTimeout(() => setIsVisible(true), 10)
    
    // Auto remove after duration
    const timer = setTimeout(() => {
      handleRemove()
    }, toast.duration || 5000)

    return () => clearTimeout(timer)
  }, [])

  const handleRemove = () => {
    setIsRemoving(true)
    setTimeout(() => {
      onRemove(toast.id)
    }, 300)
  }

  const icons = {
    success: CheckCircleIcon,
    error: XCircleIcon,
    warning: ExclamationTriangleIcon,
    info: InformationCircleIcon,
  }

  const colors = {
    success: 'bg-white border-l-4 border-l-emerald-500 text-slate-800 shadow-emerald-100/20',
    error: 'bg-white border-l-4 border-l-red-500 text-slate-800 shadow-red-100/20',
    warning: 'bg-white border-l-4 border-l-amber-500 text-slate-800 shadow-amber-100/20',
    info: 'bg-white border-l-4 border-l-blue-500 text-slate-800 shadow-blue-100/20',
  }

  const iconColors = {
    success: 'text-emerald-500',
    error: 'text-red-500',
    warning: 'text-amber-500',
    info: 'text-blue-500',
  }

  const Icon = icons[toast.type]

  return (
    <div
      className={cn(
        'w-96 max-w-md bg-white shadow-lg rounded-xl pointer-events-auto overflow-hidden',
        'transform transition-all duration-300 ease-out',
        colors[toast.type],
        'hover:shadow-xl hover:scale-[1.02] cursor-pointer',
        'border border-gray-200',
        isVisible && !isRemoving 
          ? 'opacity-100 translate-x-0 scale-100' 
          : 'opacity-0 translate-x-full scale-95'
      )}
      onClick={handleRemove}
    >
      <div className="p-5">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0">
            <div className={cn(
              'p-2 rounded-full shadow-sm transition-all duration-300 delay-100',
              isVisible && !isRemoving ? 'scale-100 opacity-100' : 'scale-75 opacity-0',
              toast.type === 'success' && 'bg-emerald-100',
              toast.type === 'error' && 'bg-red-100',
              toast.type === 'warning' && 'bg-amber-100',
              toast.type === 'info' && 'bg-blue-100'
            )}>
              <Icon className={cn('h-5 w-5', iconColors[toast.type])} />
            </div>
          </div>
          <div className="flex-1 min-w-0">
            {toast.title && (
              <p className={cn(
                'text-base font-semibold text-slate-900 transition-all duration-300 delay-150 leading-tight',
                isVisible && !isRemoving ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
              )}>
                {toast.title}
              </p>
            )}
            <p className={cn(
              'text-sm text-slate-600 mt-2 transition-all duration-300 delay-200 leading-relaxed',
              isVisible && !isRemoving ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
            )}>
              {toast.message}
            </p>
          </div>
          <div className="flex-shrink-0 ml-3">
            <button
              className="rounded-full p-2 inline-flex text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-all duration-200 hover:bg-gray-100 hover:scale-110"
              onClick={(e) => {
                e.stopPropagation()
                handleRemove()
              }}
            >
              <span className="sr-only">Close</span>
              <XMarkIcon className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
      
      {/* Progress bar */}
      <div className="h-1 bg-gray-200 rounded-b-xl overflow-hidden">
        <div className={cn(
          'h-full transition-all duration-5000 ease-linear',
          toast.type === 'success' && 'bg-emerald-500',
          toast.type === 'error' && 'bg-red-500',
          toast.type === 'warning' && 'bg-amber-500',
          toast.type === 'info' && 'bg-blue-500',
          isVisible && !isRemoving ? 'animate-progress' : 'w-full'
        )} />
      </div>
    </div>
  )
}
