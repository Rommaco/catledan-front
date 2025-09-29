'use client'
import React, { useState, useRef, useEffect } from 'react'
import { cn } from '@/lib/utils'
import { ChevronDownIcon, CheckIcon } from '@heroicons/react/24/outline'

interface SelectOption {
  value: string | number
  label: string
  disabled?: boolean
  icon?: React.ReactNode
}

interface CustomSelectProps {
  label?: string
  placeholder?: string
  options: SelectOption[]
  value?: string | number
  onChange?: (value: string | number) => void
  error?: string
  helper?: string
  animate?: boolean
  variant?: 'default' | 'filled' | 'outlined'
  disabled?: boolean
  className?: string
}

export const CustomSelect: React.FC<CustomSelectProps> = ({
  label,
  placeholder = 'Selecciona una opción',
  options,
  value,
  onChange,
  error,
  helper,
  animate = true,
  variant = 'default',
  disabled = false,
  className,
}) => {
  const [isOpen, setIsOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const selectRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const selectedOption = options.find(option => option.value === value)

  const selectVariants = {
    default: 'bg-white border border-gray-200 focus:border-green-500 focus:ring-green-500/20',
    filled: 'bg-gray-50 border border-gray-200 focus:bg-white focus:border-green-500 focus:ring-green-500/20',
    outlined: 'bg-transparent border-2 border-gray-300 focus:border-green-500 focus:ring-green-500/20',
  }

  // Filtrar opciones basado en búsqueda
  const filteredOptions = options.filter(option =>
    option.label.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // Cerrar dropdown al hacer click fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (selectRef.current && !selectRef.current.contains(event.target as Node)) {
        setIsOpen(false)
        setSearchTerm('')
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Focus en input cuando se abre
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isOpen])

  const handleOptionSelect = (option: SelectOption) => {
    if (option.disabled) return
    
    onChange?.(option.value)
    setIsOpen(false)
    setSearchTerm('')
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setIsOpen(false)
      setSearchTerm('')
    }
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
      
      <div className="relative group" ref={selectRef}>
        {/* Trigger Button */}
        <button
          type="button"
          onClick={() => !disabled && setIsOpen(!isOpen)}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          className={cn(
            // Base styles
            'block w-full rounded-xl py-3 px-4 text-left shadow-sm transition-all duration-300 ease-out',
            'focus:outline-none focus:ring-2 focus:ring-offset-0',
            'hover:shadow-md focus:shadow-lg',
            'flex items-center justify-between',
            
            // Variants
            selectVariants[variant],
            
            // Error state
            error && 'border-red-300 focus:border-red-500 focus:ring-red-500/20',
            
            // Disabled state
            disabled && 'opacity-50 cursor-not-allowed',
            
            // Animations
            animate && 'animate-fade-in hover:scale-[1.02] focus:scale-[1.02]',
            
            // Custom focus styles
            'focus:border-green-500 focus:ring-2 focus:ring-green-500/20',
            
            className
          )}
        >
          <span className={cn(
            selectedOption ? 'text-slate-900' : 'text-gray-400'
          )}>
            {selectedOption ? (
              <div className="flex items-center gap-2">
                {selectedOption.icon && (
                  <span className="flex-shrink-0">
                    {selectedOption.icon}
                  </span>
                )}
                {selectedOption.label}
              </div>
            ) : (
              placeholder
            )}
          </span>
          
          <ChevronDownIcon className={cn(
            'h-5 w-5 text-gray-400 transition-transform duration-200',
            isOpen && 'rotate-180',
            animate && 'animate-bounce-in'
          )} />
        </button>
        
        {/* Floating border effect */}
        {animate && !error && !disabled && (
          <div className="absolute inset-0 rounded-xl border-2 border-transparent bg-gradient-to-r from-green-500/0 via-green-500/20 to-emerald-500/0 opacity-0 group-focus-within:opacity-100 transition-opacity duration-300 pointer-events-none" />
        )}
        
        {/* Dropdown */}
        {isOpen && (
          <div className={cn(
            'absolute z-50 mt-2 w-full bg-white border border-gray-300 rounded-xl shadow-xl',
            'max-h-60 overflow-hidden animate-slide-down backdrop-blur-sm'
          )}>
            {/* Search Input */}
            {options.length > 5 && (
              <div className="p-3 border-b border-gray-200 bg-gray-50">
                <input
                  ref={inputRef}
                  type="text"
                  placeholder="Buscar..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 bg-white"
                />
              </div>
            )}
            
            {/* Options List */}
            <div className="max-h-48 overflow-y-auto bg-white">
              {filteredOptions.length === 0 ? (
                <div className="px-4 py-3 text-sm text-gray-600 text-center bg-gray-50">
                  No se encontraron opciones
                </div>
              ) : (
                filteredOptions.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => handleOptionSelect(option)}
                    disabled={option.disabled}
                    className={cn(
                      'w-full px-4 py-3 text-left text-sm transition-colors duration-150',
                      'flex items-center justify-between border-b border-gray-100 last:border-b-0',
                      'hover:bg-green-50 focus:bg-green-50 focus:outline-none',
                      'text-slate-900',
                      option.disabled && 'opacity-50 cursor-not-allowed text-gray-400',
                      option.value === value && 'bg-green-100 text-green-800 font-medium'
                    )}
                  >
                    <div className="flex items-center gap-3">
                      {option.icon && (
                        <span className={cn(
                          'flex-shrink-0',
                          option.disabled ? 'text-gray-400' : 'text-gray-600'
                        )}>
                          {option.icon}
                        </span>
                      )}
                      <span className={cn(
                        option.disabled ? 'text-gray-400' : 'text-slate-900'
                      )}>
                        {option.label}
                      </span>
                    </div>
                    
                    {option.value === value && (
                      <CheckIcon className="h-4 w-4 text-green-600" />
                    )}
                  </button>
                ))
              )}
            </div>
          </div>
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

CustomSelect.displayName = 'CustomSelect'
