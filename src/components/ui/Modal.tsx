'use client'
import React, { useEffect, useState } from 'react'
import { cn } from '@/lib/utils'
import { Button } from './Button'
import { XMarkIcon } from '@heroicons/react/24/outline'

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  children: React.ReactNode
  size?: 'sm' | 'md' | 'lg' | 'xl'
  showCloseButton?: boolean
  animate?: boolean
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
  showCloseButton = true,
  animate = true
}) => {
  const [isAnimating, setIsAnimating] = useState(false)
  const [isVisible, setIsVisible] = useState(false)

  // Handle escape key and animations
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
      document.body.style.overflow = 'hidden'
      setIsVisible(true)
      // Start animation after DOM update
      setTimeout(() => setIsAnimating(true), 10)
    } else {
      // Start exit animation
      setIsAnimating(false)
      // Hide after animation completes
      setTimeout(() => setIsVisible(false), 300)
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = 'unset'
    }

    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = 'unset'
    }
  }, [isOpen, onClose])

  if (!isVisible) return null

  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className={cn(
          'absolute inset-0 bg-black/50 backdrop-blur-sm transition-all duration-300',
          isAnimating ? 'opacity-100' : 'opacity-0'
        )}
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className={cn(
        'relative bg-white rounded-2xl shadow-2xl w-full max-h-[90vh] overflow-hidden transition-all duration-300 ease-out transform',
        sizeClasses[size],
        'border border-gray-100',
        isAnimating ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 translate-y-4'
      )}>
        {/* Header */}
        {(title || showCloseButton) && (
          <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
            {title && (
              <h3 className={cn(
                'text-xl font-semibold text-slate-900 transition-all duration-300 delay-100',
                isAnimating ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'
              )}>
                {title}
              </h3>
            )}
            {showCloseButton && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-full transition-all duration-200 hover:scale-110"
                animate={animate}
              >
                <XMarkIcon className="w-5 h-5" />
              </Button>
            )}
          </div>
        )}
        
        {/* Content */}
        <div className={cn(
          'p-6 overflow-y-auto max-h-[calc(90vh-120px)] transition-all duration-300 delay-200',
          isAnimating ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
        )}>
          {children}
        </div>
        
        {/* Gradient overlay for visual enhancement */}
        {animate && (
          <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-emerald-500/5 pointer-events-none" />
        )}
      </div>
    </div>
  )
}
