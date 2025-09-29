'use client'
import React from 'react'
import { cn } from '@/lib/utils'
import { 
  CheckCircleIcon, 
  ExclamationTriangleIcon, 
  XCircleIcon, 
  InformationCircleIcon,
  UserGroupIcon,
  SunIcon,
  BeakerIcon
} from '@heroicons/react/24/outline'

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info' | 'ganado' | 'cultivo' | 'leche'
  size?: 'sm' | 'md' | 'lg'
  animate?: boolean
  icon?: React.ReactNode
  showIcon?: boolean
}

export const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant = 'default', size = 'md', animate = true, icon, showIcon = true, children, ...props }, ref) => {
    const defaultIcons = {
      success: CheckCircleIcon,
      warning: ExclamationTriangleIcon,
      error: XCircleIcon,
      info: InformationCircleIcon,
      ganado: UserGroupIcon,
      cultivo: SunIcon,
      leche: BeakerIcon,
    }

    const DefaultIcon = defaultIcons[variant as keyof typeof defaultIcons]

    const baseClasses = cn(
      // Base styles
      'inline-flex items-center font-medium rounded-full transition-all duration-300 ease-out',
      'border shadow-sm',
      
      // Size variants
      {
        'px-1.5 py-0.5 text-xs gap-1': size === 'sm',
        'px-2 py-0.5 text-xs gap-1': size === 'md',
        'px-2.5 py-1 text-sm gap-1.5': size === 'lg',
      },
      
      // Color variants
      {
        'bg-slate-100 text-slate-800 border-slate-200 hover:bg-slate-200': variant === 'default',
        'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100': variant === 'success',
        'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100': variant === 'warning',
        'bg-red-50 text-red-700 border-red-200 hover:bg-red-100': variant === 'error',
        'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100': variant === 'info',
        'bg-orange-50 text-orange-700 border-orange-200 hover:bg-orange-100': variant === 'ganado',
        'bg-lime-50 text-lime-700 border-lime-200 hover:bg-lime-100': variant === 'cultivo',
        'bg-yellow-50 text-yellow-700 border-yellow-200 hover:bg-yellow-100': variant === 'leche',
      },
      
      // Animations
      animate && 'hover:scale-105 hover:shadow-md',
      
      className
    )

    return (
      <span ref={ref} className={baseClasses} {...props}>
        {(icon || (showIcon && DefaultIcon)) && (
          <span className={cn(
            'flex-shrink-0',
            animate && 'animate-bounce-in'
          )}>
            {icon || (DefaultIcon && <DefaultIcon className={cn(
              size === 'sm' ? 'h-3 w-3' : size === 'md' ? 'h-3 w-3' : 'h-4 w-4'
            )} />)}
          </span>
        )}
        <span className={cn(
          'font-medium',
          animate && 'animate-slide-up'
        )}>
          {children}
        </span>
      </span>
    )
  }
)

Badge.displayName = 'Badge'
