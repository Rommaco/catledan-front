'use client'
import React, { useEffect, useState, useRef } from 'react'
import { Card } from './Card'
import { cn } from '@/lib/utils'

interface AnimatedCardProps {
  children: React.ReactNode
  delay?: number
  className?: string
  variant?: 'default' | 'elevated' | 'outlined' | 'gradient'
  animate?: boolean
  animationType?: 'fade-up' | 'fade-in' | 'slide-left' | 'slide-right' | 'scale-up' | 'bounce-in'
}

export const AnimatedCard: React.FC<AnimatedCardProps> = ({
  children,
  delay = 0,
  className,
  variant = 'default',
  animate = true,
  animationType = 'fade-up',
  ...props
}) => {
  const [isVisible, setIsVisible] = useState(false)
  const [isExiting, setIsExiting] = useState(false)
  const cardRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (animate) {
      const timer = setTimeout(() => {
        setIsVisible(true)
      }, delay)

      return () => clearTimeout(timer)
    } else {
      setIsVisible(true)
    }
  }, [animate, delay])

  // Función para obtener las clases de animación según el tipo
  const getAnimationClasses = () => {
    if (!animate) return 'opacity-100 translate-y-0 scale-100'
    
    if (isExiting) {
      return 'opacity-0 translate-y-4 scale-95'
    }

    switch (animationType) {
      case 'fade-in':
        return isVisible 
          ? 'opacity-100' 
          : 'opacity-0'
      case 'fade-up':
        return isVisible 
          ? 'opacity-100 translate-y-0 scale-100' 
          : 'opacity-0 translate-y-8 scale-95'
      case 'slide-left':
        return isVisible 
          ? 'opacity-100 translate-x-0 scale-100' 
          : 'opacity-0 translate-x-8 scale-95'
      case 'slide-right':
        return isVisible 
          ? 'opacity-100 translate-x-0 scale-100' 
          : 'opacity-0 -translate-x-8 scale-95'
      case 'scale-up':
        return isVisible 
          ? 'opacity-100 scale-100' 
          : 'opacity-0 scale-75'
      case 'bounce-in':
        return isVisible 
          ? 'opacity-100 translate-y-0 scale-100' 
          : 'opacity-0 translate-y-8 scale-90'
      default:
        return isVisible 
          ? 'opacity-100 translate-y-0 scale-100' 
          : 'opacity-0 translate-y-8 scale-95'
    }
  }

  return (
    <div
      ref={cardRef}
      className={cn(
        'transition-all duration-700 ease-out transform',
        getAnimationClasses(),
        className
      )}
      style={{
        transitionDelay: `${delay}ms`,
      }}
    >
      <Card 
        variant={variant} 
        className={cn(
          'hover:shadow-xl transition-shadow duration-300',
          animationType === 'bounce-in' && isVisible && 'animate-bounce-in'
        )}
        {...props}
      >
        {children}
      </Card>
    </div>
  )
}

AnimatedCard.displayName = 'AnimatedCard'
