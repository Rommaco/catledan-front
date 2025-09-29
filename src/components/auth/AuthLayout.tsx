'use client'
import React from 'react'
import { cn } from '@/lib/utils'

interface AuthLayoutProps {
  children: React.ReactNode
  title?: string
  subtitle?: string
  animate?: boolean
}

export const AuthLayout: React.FC<AuthLayoutProps> = ({
  children,
  title = "Bienvenido",
  subtitle = "Accede a tu cuenta",
  animate = true
}) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 flex">
      {/* Panel izquierdo con información de la marca */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        {/* Fondo con gradiente animado */}
        <div className="absolute inset-0 bg-gradient-to-br from-green-600 via-emerald-600 to-teal-600" />
        
        {/* Patrones decorativos */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-32 h-32 bg-white rounded-full animate-float" />
          <div className="absolute top-32 right-20 w-24 h-24 bg-white rounded-full animate-float" style={{ animationDelay: '1s' }} />
          <div className="absolute bottom-20 left-20 w-40 h-40 bg-white rounded-full animate-float" style={{ animationDelay: '2s' }} />
          <div className="absolute bottom-32 right-10 w-28 h-28 bg-white rounded-full animate-float" style={{ animationDelay: '3s' }} />
        </div>

        {/* Contenido del panel izquierdo */}
        <div className="relative z-10 flex flex-col justify-center items-center text-white p-12">
          <div className={cn(
            'max-w-md text-center space-y-6',
            animate && 'animate-fade-in'
          )}>
            <div className="space-y-4">
              <h1 className="text-4xl font-bold bg-gradient-to-r from-white to-green-100 bg-clip-text text-transparent">
                Catledan SaaS
              </h1>
              <p className="text-xl text-green-100 leading-relaxed">
                La plataforma integral para la gestión de tu ganadería
              </p>
            </div>

            <div className="space-y-6 pt-8">
              <div className="flex items-center space-x-4 text-green-100">
                <div className="w-8 h-8 bg-green-400 rounded-full flex items-center justify-center">
                  <span className="text-green-800 font-bold">1</span>
                </div>
                <span>Gestiona tu ganado de forma eficiente</span>
              </div>
              
              <div className="flex items-center space-x-4 text-green-100">
                <div className="w-8 h-8 bg-green-400 rounded-full flex items-center justify-center">
                  <span className="text-green-800 font-bold">2</span>
                </div>
                <span>Controla la producción de leche</span>
              </div>
              
              <div className="flex items-center space-x-4 text-green-100">
                <div className="w-8 h-8 bg-green-400 rounded-full flex items-center justify-center">
                  <span className="text-green-800 font-bold">3</span>
                </div>
                <span>Administra tus finanzas</span>
              </div>
            </div>

            <div className="pt-8">
              <p className="text-sm text-green-200">
                Únete a cientos de ganaderos que ya optimizan su producción
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Panel derecho con formulario */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-md space-y-8">
          {/* Header móvil */}
          <div className={cn(
            'lg:hidden text-center space-y-2',
            animate && 'animate-slide-down'
          )}>
            <h1 className="text-3xl font-bold text-green-600">Catledan SaaS</h1>
            <p className="text-gray-600">Gestión integral de ganadería</p>
          </div>

          {/* Formulario */}
          <div className={cn(
            'bg-white rounded-2xl shadow-xl p-8 border border-gray-100',
            animate && 'animate-slide-up'
          )}>
            <div className="text-center space-y-2 mb-8">
              <h2 className="text-2xl font-bold text-slate-900">{title}</h2>
              <p className="text-gray-600">{subtitle}</p>
            </div>
            
            {children}
          </div>

          {/* Footer */}
          <div className={cn(
            'text-center text-sm text-gray-500',
            animate && 'animate-fade-in'
          )}>
            <p>© 2024 Catledan SaaS. Todos los derechos reservados.</p>
          </div>
        </div>
      </div>
    </div>
  )
}

AuthLayout.displayName = 'AuthLayout'
