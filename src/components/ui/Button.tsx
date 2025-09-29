'use client'
import React from 'react'
import { cn } from '@/lib/utils'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'ghost'
  size?: 'sm' | 'md' | 'lg' | 'xl'
  loading?: boolean
  icon?: React.ReactNode
  animate?: boolean
  glow?: boolean
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ 
    className, 
    variant = 'primary', 
    size = 'md', 
    loading = false, 
    icon,
    animate = true,
    glow = false,
    children, 
    ...props 
  }, ref) => {
    const baseClasses = cn(
      // Base styles
      'relative inline-flex items-center justify-center font-medium rounded-xl transition-all duration-300 ease-out',
      'focus:outline-none focus:ring-2 focus:ring-offset-2',
      'disabled:opacity-50 disabled:cursor-not-allowed',
      
      // Animations
      animate && 'hover:scale-105 active:scale-95',
      glow && 'shadow-glow hover:shadow-glow-lg',
      
      // Size variants
      {
        'px-3 py-1.5 text-sm': size === 'sm',
        'px-4 py-2 text-base': size === 'md',
        'px-6 py-3 text-lg': size === 'lg',
        'px-8 py-4 text-xl': size === 'xl',
      },
      
      // Color variants
      {
        'bg-green-600 text-white hover:bg-green-700 focus:ring-green-500': variant === 'primary',
        'bg-slate-100 text-slate-900 hover:bg-slate-200 focus:ring-slate-500': variant === 'secondary',
        'bg-emerald-500 text-white hover:bg-emerald-600 focus:ring-emerald-500': variant === 'success',
        'bg-amber-500 text-white hover:bg-amber-600 focus:ring-amber-500': variant === 'warning',
        'bg-red-500 text-white hover:bg-red-600 focus:ring-red-500': variant === 'error',
        'bg-transparent text-slate-900 hover:bg-slate-100 focus:ring-slate-500': variant === 'ghost',
      },
      
      className
    )

    return (
      <button
        ref={ref}
        className={baseClasses}
        disabled={loading}
        {...props}
      >
        {/* Shimmer effect */}
        {animate && (
          <div className="absolute inset-0 -top-1 -left-1 bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-500 animate-shimmer rounded-xl" />
        )}
        
        {/* Loading spinner */}
        {loading && (
          <div className="animate-spin rounded-full h-4 w-4 border-2 border-current border-t-transparent mr-2" />
        )}
        
        {/* Icon */}
        {icon && !loading && (
          <span className={cn('mr-2', animate && 'animate-slide-right')}>
            {icon}
          </span>
        )}
        
        {/* Content */}
        <span className={cn('relative z-10', animate && 'animate-slide-up')}>
          {children}
        </span>
      </button>
    )
  }
)

Button.displayName = 'Button'
