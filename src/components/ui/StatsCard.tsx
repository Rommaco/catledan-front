'use client'
import React from 'react'
import { Card } from './Card'
import { cn } from '@/lib/utils'

interface StatsCardProps {
  title: string
  value: string | number
  change?: {
    value: string
    type: 'increase' | 'decrease' | 'neutral'
  }
  icon?: React.ReactNode
  color?: 'primary' | 'success' | 'warning' | 'error' | 'ganado' | 'cultivo' | 'leche' | 'blue' | 'green' | 'red' | 'purple'
  animate?: boolean
  loading?: boolean
}

export const StatsCard: React.FC<StatsCardProps> = ({
  title,
  value,
  change,
  icon,
  color = 'primary',
  animate = true,
  loading = false
}) => {
  const colorClasses = {
    primary: 'from-green-500 to-green-600',
    success: 'from-emerald-500 to-emerald-600',
    warning: 'from-amber-500 to-amber-600',
    error: 'from-red-500 to-red-600',
    ganado: 'from-orange-500 to-orange-600',
    cultivo: 'from-lime-500 to-lime-600',
    leche: 'from-yellow-500 to-yellow-600',
    blue: 'from-blue-500 to-blue-600',
    green: 'from-green-500 to-green-600',
    red: 'from-red-500 to-red-600',
    purple: 'from-purple-500 to-purple-600',
  }

  const changeColors = {
    increase: 'text-emerald-600 bg-emerald-50',
    decrease: 'text-red-600 bg-red-50',
    neutral: 'text-gray-600 bg-gray-50',
  }

  return (
    <Card 
      variant="elevated" 
      hover={true} 
      glow={true} 
      animate={animate}
      className="group"
    >
      <div className="flex items-center justify-between mb-4">
        <div className={cn(
          'p-3 rounded-xl bg-gradient-to-br transition-all duration-300',
          colorClasses[color],
          animate && 'group-hover:scale-110 group-hover:rotate-3'
        )}>
          <div className="text-white text-xl animate-float">
            {icon}
          </div>
        </div>
        
        {change && (
          <div className={cn(
            'px-2 py-1 rounded-full text-xs font-medium transition-all duration-300',
            changeColors[change.type],
            animate && 'animate-bounce-in'
          )}>
            {change.value}
          </div>
        )}
      </div>
      
      <div className="space-y-2">
        <h3 className="text-sm font-medium text-slate-600 animate-slide-up">
          {title}
        </h3>
        {loading ? (
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-20"></div>
          </div>
        ) : (
          <p className={cn(
            'text-3xl font-bold text-slate-900 transition-all duration-300',
            animate && 'group-hover:text-green-600'
          )}>
            {typeof value === 'number' ? value.toLocaleString() : value}
          </p>
        )}
      </div>
      
      {/* Animated background pattern */}
      {animate && (
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0 bg-gradient-to-br from-green-500 to-emerald-500 animate-gradient-x" />
        </div>
      )}
    </Card>
  )
}
