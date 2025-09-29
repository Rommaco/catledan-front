'use client'
import React from 'react'
import { cn } from '@/lib/utils'
import { ChevronDownIcon } from '@heroicons/react/24/outline'

interface SelectOption {
  value: string | number
  label: string
  disabled?: boolean
}

interface SelectProps extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'onChange'> {
  label?: string
  error?: string
  helper?: string
  options: SelectOption[]
  placeholder?: string
  animate?: boolean
  variant?: 'default' | 'filled' | 'outlined'
  onChange?: (value: string | number) => void
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, label, error, helper, options, placeholder, animate = true, variant = 'default', onChange, ...props }, ref) => {
    const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
      if (onChange) {
        const value = e.target.value
        // Try to convert to number if it's a valid number
        onChange(isNaN(Number(value)) ? value : Number(value))
      }
    }

    const selectVariants = {
      default: 'bg-white border border-gray-200 focus:border-green-500 focus:ring-green-500/20',
      filled: 'bg-gray-50 border border-gray-200 focus:bg-white focus:border-green-500 focus:ring-green-500/20',
      outlined: 'bg-transparent border-2 border-gray-300 focus:border-green-500 focus:ring-green-500/20',
    }

    return (
      <div className="space-y-2">
        {label && (
          <label className={cn(
            'block text-sm font-medium text-slate-700 transition-colors duration-200',
            animate && 'animate-slide-down'
          )}>
            {label}
          </label>
        )}
        
        <div className="relative group">
          <select
            ref={ref}
            onChange={handleChange}
            className={cn(
              // Base styles
              'block w-full rounded-xl py-3 px-4 text-slate-900 shadow-sm transition-all duration-300 ease-out',
              'focus:outline-none focus:ring-2 focus:ring-offset-0 appearance-none cursor-pointer',
              'hover:shadow-md focus:shadow-lg pr-12',
              
              // Variants
              selectVariants[variant],
              
              // Error state
              error && 'border-red-300 focus:border-red-500 focus:ring-red-500/20',
              
              // Animations
              animate && 'animate-fade-in hover:scale-[1.02] focus:scale-[1.02]',
              
              // Custom focus styles
              'focus:border-green-500 focus:ring-2 focus:ring-green-500/20',
              
              className
            )}
            {...props}
          >
            {placeholder && (
              <option value="" disabled>
                {placeholder}
              </option>
            )}
            {options.map((option) => (
              <option
                key={option.value}
                value={option.value}
                disabled={option.disabled}
              >
                {option.label}
              </option>
            ))}
          </select>
          
          {/* Custom chevron icon */}
          <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none">
            <ChevronDownIcon className={cn(
              'h-5 w-5 text-gray-400 transition-all duration-200 group-focus-within:text-green-500',
              animate && 'animate-bounce-in'
            )} />
          </div>
          
          {/* Floating border effect */}
          {animate && !error && (
            <div className="absolute inset-0 rounded-xl border-2 border-transparent bg-gradient-to-r from-green-500/0 via-green-500/20 to-emerald-500/0 opacity-0 group-focus-within:opacity-100 transition-opacity duration-300 pointer-events-none" />
          )}
        </div>
        
        {(error || helper) && (
          <div className={cn(
            'flex items-center space-x-1',
            animate && 'animate-slide-up'
          )}>
            <p className={cn(
              'text-sm transition-colors duration-200',
              error ? 'text-red-600' : 'text-slate-500'
            )}>
              {error || helper}
            </p>
            {error && (
              <div className="w-1 h-1 bg-red-500 rounded-full animate-pulse" />
            )}
          </div>
        )}
      </div>
    )
  }
)

Select.displayName = 'Select'
