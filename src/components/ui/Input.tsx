'use client'
import React, { useState, useEffect } from 'react'
import { cn } from '@/lib/utils'

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  helper?: string
  icon?: React.ReactNode
  animate?: boolean
  variant?: 'default' | 'filled' | 'outlined'
  validateOnBlur?: boolean
  validationRules?: {
    email?: boolean
    phone?: boolean
    required?: boolean
    minLength?: number
    maxLength?: number
  }
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, helper, icon, animate = true, variant = 'default', validateOnBlur = true, validationRules, ...props }, ref) => {
    const [validationError, setValidationError] = useState<string>('')
    const [hasBeenTouched, setHasBeenTouched] = useState(false)

    // Función de validación
    const validateInput = (value: string) => {
      if (!validationRules) return ''

      // Required validation
      if (validationRules.required && !value.trim()) {
        return 'Este campo es obligatorio'
      }

      // Email validation
      if (validationRules.email && value) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!emailRegex.test(value)) {
          return 'Ingresa un email válido'
        }
      }

      // Phone validation
      if (validationRules.phone && value) {
        const phoneRegex = /^[\+]?[0-9\s\-\(\)]{10,}$/
        if (!phoneRegex.test(value)) {
          return 'Ingresa un teléfono válido'
        }
      }

      // Length validations
      if (validationRules.minLength && value.length < validationRules.minLength) {
        return `Mínimo ${validationRules.minLength} caracteres`
      }

      if (validationRules.maxLength && value.length > validationRules.maxLength) {
        return `Máximo ${validationRules.maxLength} caracteres`
      }

      return ''
    }

    // Manejar blur
    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
      setHasBeenTouched(true)
      if (validateOnBlur && validationRules) {
        const error = validateInput(e.target.value)
        setValidationError(error)
      }
      props.onBlur?.(e)
    }

    // Manejar change
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (hasBeenTouched && validationRules) {
        const error = validateInput(e.target.value)
        setValidationError(error)
      }
      props.onChange?.(e)
    }

    const displayError = error || validationError
    const inputVariants = {
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
          {icon && (
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none z-10">
              <span className={cn(
                'text-gray-400 transition-colors duration-200 group-focus-within:text-green-500',
                animate && 'animate-bounce-in'
              )}>
                {icon}
              </span>
            </div>
          )}
          
          <input
            ref={ref}
            className={cn(
              // Base styles
              'block w-full rounded-xl py-3 px-4 text-slate-900 shadow-sm transition-all duration-300 ease-out',
              'placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-0',
              'hover:shadow-md focus:shadow-lg',
              
              // Icon padding
              icon ? 'pl-12' : 'pl-4',
              
              // Variants
              inputVariants[variant],
              
              // Error state
              displayError && 'border-red-300 focus:border-red-500 focus:ring-red-500/20',
              
              // Animations
              animate && 'animate-fade-in hover:scale-[1.02] focus:scale-[1.02]',
              
              // Custom focus styles
              'focus:border-green-500 focus:ring-2 focus:ring-green-500/20',
              
              className
            )}
            onBlur={handleBlur}
            onChange={handleChange}
            {...props}
          />
          
          {/* Floating border effect */}
          {animate && !displayError && (
            <div className="absolute inset-0 rounded-xl border-2 border-transparent bg-gradient-to-r from-green-500/0 via-green-500/20 to-emerald-500/0 opacity-0 group-focus-within:opacity-100 transition-opacity duration-300 pointer-events-none" />
          )}
        </div>
        
        {(displayError || helper) && (
          <div className={cn(
            'flex items-center space-x-1',
            animate && 'animate-slide-up'
          )}>
            <p className={cn(
              'text-sm transition-colors duration-200',
              displayError ? 'text-red-600' : 'text-slate-500'
            )}>
              {displayError || helper}
            </p>
            {displayError && (
              <div className="w-1 h-1 bg-red-500 rounded-full animate-pulse" />
            )}
          </div>
        )}
      </div>
    )
  }
)

Input.displayName = 'Input'
