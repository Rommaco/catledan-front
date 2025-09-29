'use client'
import React from 'react'
import { cn } from '@/lib/utils'

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'elevated' | 'outlined' | 'gradient'
  hover?: boolean
  glow?: boolean
  animate?: boolean
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant = 'default', hover = true, glow = false, animate = true, children, ...props }, ref) => {
    const baseClasses = cn(
      'relative rounded-2xl transition-all duration-300 ease-out overflow-hidden',
      
      // Variants
      {
        'bg-white border border-gray-200': variant === 'default',
        'bg-white shadow-lg border border-gray-100': variant === 'elevated',
        'bg-transparent border-2 border-green-200': variant === 'outlined',
        'bg-gradient-to-br from-green-50 to-emerald-50 border border-green-100': variant === 'gradient',
      },
      
      // Interactive effects
      hover && 'hover:shadow-xl hover:-translate-y-1',
      glow && 'shadow-glow hover:shadow-glow-lg',
      animate && 'animate-fade-in',
      
      className
    )

    return (
      <div ref={ref} className={baseClasses} {...props}>
        {/* Gradient overlay */}
        {variant === 'gradient' && (
          <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-emerald-500/5 animate-gradient-x" />
        )}
        
        {/* Content */}
        <div className="relative z-10 p-6">
          {children}
        </div>
        
        {/* Hover effect */}
        {hover && (
          <div className="absolute inset-0 bg-gradient-to-r from-green-500/0 via-green-500/5 to-emerald-500/0 opacity-0 hover:opacity-100 transition-opacity duration-500" />
        )}
      </div>
    )
  }
)

Card.displayName = 'Card'
