'use client'
import React, { useState, useRef, useEffect } from 'react'
import { cn } from '@/lib/utils'
import { CalendarIcon, ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline'

interface DatePickerProps {
  label?: string
  placeholder?: string
  value?: Date
  onChange?: (date: Date | null) => void
  error?: string
  helper?: string
  animate?: boolean
  variant?: 'default' | 'filled' | 'outlined'
  disabled?: boolean
  minDate?: Date
  maxDate?: Date
  className?: string
}

export const DatePicker: React.FC<DatePickerProps> = ({
  label,
  placeholder = 'Selecciona una fecha',
  value,
  onChange,
  error,
  helper,
  animate = true,
  variant = 'default',
  disabled = false,
  minDate,
  maxDate,
  className,
}) => {
  const [isOpen, setIsOpen] = useState(false)
  const [currentMonth, setCurrentMonth] = useState<Date>(() => {
    if (value && value instanceof Date) {
      return value
    }
    return new Date()
  })
  const [selectedDate, setSelectedDate] = useState<Date | null>(() => {
    if (value && value instanceof Date && !isNaN(value.getTime())) {
      return value
    }
    return null
  })
  const [showAbove, setShowAbove] = useState(false)
  const datePickerRef = useRef<HTMLDivElement>(null)

  // Actualizar currentMonth cuando value cambie
  useEffect(() => {
    if (value && value instanceof Date && !isNaN(value.getTime())) {
      setCurrentMonth(value)
      setSelectedDate(value)
    } else if (value === null || value === undefined) {
      setSelectedDate(null)
    }
  }, [value])

  const inputVariants = {
    default: 'bg-white border border-gray-200 focus:border-green-500 focus:ring-green-500/20',
    filled: 'bg-gray-50 border border-gray-200 focus:bg-white focus:border-green-500 focus:ring-green-500/20',
    outlined: 'bg-transparent border-2 border-gray-300 focus:border-green-500 focus:ring-green-500/20',
  }

  const monthNames = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ]

  const dayNames = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']

  // Cerrar dropdown al hacer click fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (datePickerRef.current && !datePickerRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Detectar posición del calendario
  useEffect(() => {
    if (isOpen && datePickerRef.current) {
      const rect = datePickerRef.current.getBoundingClientRect()
      const viewportHeight = window.innerHeight
      const spaceBelow = viewportHeight - rect.bottom
      const spaceAbove = rect.top
      
      // Si hay menos de 400px abajo y más de 400px arriba, mostrar arriba
      setShowAbove(spaceBelow < 400 && spaceAbove > 400)
    }
  }, [isOpen])

  // Generar días del mes
  const generateDays = () => {
    // Validar que currentMonth sea un objeto Date válido
    if (!currentMonth || !(currentMonth instanceof Date) || isNaN(currentMonth.getTime())) {
      const now = new Date()
      setCurrentMonth(now)
      return []
    }
    
    const year = currentMonth.getFullYear()
    const month = currentMonth.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startingDayOfWeek = firstDay.getDay()

    const days = []

    // Días del mes anterior
    for (let i = 0; i < startingDayOfWeek; i++) {
      const day = new Date(year, month, -startingDayOfWeek + i + 1)
      days.push({ day: day.getDate(), date: day, isCurrentMonth: false })
    }

    // Días del mes actual
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day)
      days.push({ day, date, isCurrentMonth: true })
    }

    // Días del mes siguiente para completar la cuadrícula
    const remainingDays = 42 - days.length
    for (let day = 1; day <= remainingDays; day++) {
      const date = new Date(year, month + 1, day)
      days.push({ day, date, isCurrentMonth: false })
    }

    return days
  }

  const isDateDisabled = (date: Date) => {
    if (minDate && date < minDate) return true
    if (maxDate && date > maxDate) return true
    return false
  }

  const isDateSelected = (date: Date) => {
    return selectedDate && 
           date.getDate() === selectedDate.getDate() &&
           date.getMonth() === selectedDate.getMonth() &&
           date.getFullYear() === selectedDate.getFullYear()
  }

  const handleDateSelect = (date: Date) => {
    if (isDateDisabled(date)) return
    
    setSelectedDate(date)
    onChange?.(date)
    setIsOpen(false)
  }

  const navigateMonth = (direction: 'prev' | 'next') => {
    // Validar que currentMonth sea válido antes de navegar
    if (!currentMonth || !(currentMonth instanceof Date) || isNaN(currentMonth.getTime())) {
      setCurrentMonth(new Date())
      return
    }
    
    const newMonth = new Date(currentMonth)
    if (direction === 'prev') {
      newMonth.setMonth(newMonth.getMonth() - 1)
    } else {
      newMonth.setMonth(newMonth.getMonth() + 1)
    }
    setCurrentMonth(newMonth)
  }

  const formatDate = (date: Date | null) => {
    if (!date) return ''
    
    // Validar que sea un objeto Date válido
    if (!(date instanceof Date) || isNaN(date.getTime())) {
      return ''
    }
    
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
  }

  const days = generateDays()

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
      
      <div className="relative group" ref={datePickerRef}>
        {/* Trigger Button */}
        <button
          type="button"
          onClick={() => !disabled && setIsOpen(!isOpen)}
          disabled={disabled}
          className={cn(
            // Base styles
            'block w-full rounded-xl py-3 px-4 text-left shadow-sm transition-all duration-300 ease-out',
            'focus:outline-none focus:ring-2 focus:ring-offset-0',
            'hover:shadow-md focus:shadow-lg',
            'flex items-center justify-between',
            
            // Variants
            inputVariants[variant],
            
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
            selectedDate ? 'text-slate-900' : 'text-gray-400'
          )}>
            {selectedDate ? formatDate(selectedDate) : placeholder}
          </span>
          
          <CalendarIcon className={cn(
            'h-5 w-5 text-gray-400 transition-transform duration-200',
            isOpen && 'rotate-180',
            animate && 'animate-bounce-in'
          )} />
        </button>
        
        {/* Floating border effect */}
        {animate && !error && !disabled && (
          <div className="absolute inset-0 rounded-xl border-2 border-transparent bg-gradient-to-r from-green-500/0 via-green-500/20 to-emerald-500/0 opacity-0 group-focus-within:opacity-100 transition-opacity duration-300 pointer-events-none" />
        )}
        
        {/* Calendar Dropdown */}
        {isOpen && (
          <div className={cn(
            'absolute z-50 w-full bg-white border border-gray-300 rounded-xl shadow-xl p-4',
            'animate-slide-down backdrop-blur-sm min-h-[350px] max-h-[90vh] overflow-y-auto',
            showAbove ? 'bottom-full mb-2' : 'mt-2'
          )}>
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <button
                onClick={() => navigateMonth('prev')}
                className="p-2 hover:bg-green-50 rounded-lg transition-colors duration-150 hover:scale-105"
              >
                <ChevronLeftIcon className="h-5 w-5 text-gray-600 hover:text-green-600" />
              </button>
              
              <h3 className="text-lg font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                {currentMonth && currentMonth instanceof Date && !isNaN(currentMonth.getTime()) 
                  ? `${monthNames[currentMonth.getMonth()]} ${currentMonth.getFullYear()}`
                  : `${monthNames[new Date().getMonth()]} ${new Date().getFullYear()}`
                }
              </h3>
              
              <button
                onClick={() => navigateMonth('next')}
                className="p-2 hover:bg-green-50 rounded-lg transition-colors duration-150 hover:scale-105"
              >
                <ChevronRightIcon className="h-5 w-5 text-gray-600 hover:text-green-600" />
              </button>
            </div>
            
            {/* Day Names */}
            <div className="grid grid-cols-7 gap-1 mb-3">
              {dayNames.map(day => (
                <div key={day} className="p-2 text-center text-xs font-bold text-gray-600 bg-gray-50 rounded-lg">
                  {day}
                </div>
              ))}
            </div>
            
            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-1 mb-6">
              {days.map(({ day, date, isCurrentMonth }, index) => {
                const isSelected = isDateSelected(date)
                const isDisabled = isDateDisabled(date)
                const isToday = date.toDateString() === new Date().toDateString()
                
                return (
                  <button
                    key={index}
                    onClick={() => handleDateSelect(date)}
                    disabled={isDisabled}
                    className={cn(
                      'p-3 text-sm rounded-lg transition-all duration-200 font-medium',
                      'hover:scale-105 focus:outline-none focus:ring-2 focus:ring-green-500/20',
                      !isCurrentMonth && 'text-gray-300 hover:bg-gray-50',
                      isCurrentMonth && 'text-slate-900 hover:bg-green-50',
                      isToday && 'bg-blue-100 text-blue-700 font-bold ring-2 ring-blue-200',
                      isSelected && 'bg-gradient-to-br from-green-500 to-emerald-500 text-white font-bold shadow-lg hover:from-green-600 hover:to-emerald-600',
                      isDisabled && 'opacity-50 cursor-not-allowed hover:bg-transparent hover:scale-100'
                    )}
                  >
                    {day}
                  </button>
                )
              })}
            </div>
            
            {/* Today Button */}
            <div className="pt-4 border-t border-gray-200">
              <button
                onClick={() => handleDateSelect(new Date())}
                className="w-full px-4 py-3 text-sm font-medium text-green-600 hover:bg-green-50 rounded-lg transition-all duration-150 hover:scale-[1.02] border border-green-200 hover:border-green-300"
              >
                📅 Seleccionar Hoy
              </button>
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

DatePicker.displayName = 'DatePicker'
