'use client'
import React, { useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/Button'
import { 
  Bars3Icon,
  XMarkIcon,
  HomeIcon,
  UserGroupIcon,
  CurrencyDollarIcon,
  ChartBarIcon,
  DocumentTextIcon,
  Cog6ToothIcon,
  ArrowRightOnRectangleIcon,
  BeakerIcon,
  SunIcon,
  UsersIcon
} from '@heroicons/react/24/outline'
import { cn } from '@/lib/utils'

interface DashboardLayoutProps {
  children: React.ReactNode
}

const menuItems = [
  {
    key: '/dashboard',
    icon: HomeIcon,
    label: 'Dashboard',
  },
  {
    key: '/ganado',
    icon: UserGroupIcon,
    label: 'Ganado',
  },
  {
    key: '/produccion-leche',
    icon: BeakerIcon,
    label: 'Producción de Leche',
  },
  {
    key: '/cultivos',
    icon: SunIcon,
    label: 'Cultivos',
  },
  {
    key: '/reportes',
    icon: DocumentTextIcon,
    label: 'Reportes',
  },
  {
    key: '/finanzas',
    icon: CurrencyDollarIcon,
    label: 'Finanzas',
  },
  {
    key: '/team',
    icon: UsersIcon,
    label: 'Team',
  },
  {
    key: '/configuracion',
    icon: Cog6ToothIcon,
    label: 'Configuración',
  },
]

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const router = useRouter()
  const pathname = usePathname()
  const { user, logout } = useAuth()

  const handleLogout = () => {
    logout()
    router.push('/auth/login')
  }

  const handleNavigation = (path: string) => {
    router.push(path)
    setSidebarOpen(false) // Cerrar sidebar en móvil
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar para desktop */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
        <div className="flex min-h-0 flex-1 flex-col bg-white shadow-lg border-r border-gray-200">
          {/* Logo */}
          <div className="flex h-16 flex-shrink-0 items-center px-6 border-b border-gray-200">
            <h1 className="text-xl font-bold text-green-600">Catledan SaaS</h1>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-1 px-4 py-6">
            {menuItems.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.key
              
              return (
                <button
                  key={item.key}
                  onClick={() => handleNavigation(item.key)}
                  className={cn(
                    'group flex w-full items-center px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200',
                    isActive
                      ? 'bg-green-100 text-green-700 border-r-2 border-green-500'
                      : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900',
                    'hover:scale-[1.02]'
                  )}
                >
                  <Icon className={cn(
                    'mr-3 h-5 w-5 flex-shrink-0 transition-colors duration-200',
                    isActive ? 'text-green-600' : 'text-gray-400 group-hover:text-gray-600'
                  )} />
                  {item.label}
                </button>
              )
            })}
          </nav>

          {/* User info */}
          <div className="flex-shrink-0 border-t border-gray-200 p-4">
            <div className="flex items-center space-x-3">
              <div className="flex-shrink-0">
                <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
                  <UserGroupIcon className="h-5 w-5 text-green-600" />
                </div>
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {user?.fullName}
                </p>
                <p className="text-xs text-gray-500 truncate">
                  {user?.businessName}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Sidebar móvil */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setSidebarOpen(false)} />
          <div className="fixed inset-y-0 left-0 flex w-64 flex-col bg-white shadow-xl">
            {/* Header móvil */}
            <div className="flex h-16 items-center justify-between px-6 border-b border-gray-200">
              <h1 className="text-xl font-bold text-green-600">Catledan SaaS</h1>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSidebarOpen(false)}
                className="p-2"
              >
                <XMarkIcon className="h-5 w-5" />
              </Button>
            </div>

            {/* Navigation móvil */}
            <nav className="flex-1 space-y-1 px-4 py-6">
              {menuItems.map((item) => {
                const Icon = item.icon
                const isActive = pathname === item.key
                
                return (
                  <button
                    key={item.key}
                    onClick={() => handleNavigation(item.key)}
                    className={cn(
                      'group flex w-full items-center px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200',
                      isActive
                        ? 'bg-green-100 text-green-700'
                        : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                    )}
                  >
                    <Icon className={cn(
                      'mr-3 h-5 w-5 flex-shrink-0',
                      isActive ? 'text-green-600' : 'text-gray-400'
                    )} />
                    {item.label}
                  </button>
                )
              })}
            </nav>

            {/* User info móvil */}
            <div className="flex-shrink-0 border-t border-gray-200 p-4">
              <div className="flex items-center space-x-3">
                <div className="flex-shrink-0">
                  <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
                    <UserGroupIcon className="h-5 w-5 text-green-600" />
                  </div>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {user?.fullName}
                  </p>
                  <p className="text-xs text-gray-500 truncate">
                    {user?.businessName}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main content */}
      <div className="lg:ml-64">
        {/* Header */}
        <header className="sticky top-0 z-30 bg-white shadow-sm border-b border-gray-200">
          <div className="flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
            <div className="flex items-center">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2"
              >
                <Bars3Icon className="h-5 w-5" />
              </Button>
              
              <div className="ml-4 lg:ml-0">
                <h2 className="text-lg font-semibold text-gray-900">
                  {menuItems.find(item => item.key === pathname)?.label || 'Dashboard'}
                </h2>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="hidden sm:block text-right">
                <p className="text-sm font-medium text-gray-900">{user?.fullName}</p>
                <p className="text-xs text-gray-500">{user?.email}</p>
              </div>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                icon={<ArrowRightOnRectangleIcon className="w-4 h-4" />}
                animate={true}
              >
                <span className="hidden sm:inline">Cerrar Sesión</span>
              </Button>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1">
          {children}
        </main>
      </div>
    </div>
  )
}

DashboardLayout.displayName = 'DashboardLayout'
