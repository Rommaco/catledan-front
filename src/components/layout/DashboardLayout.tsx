'use client'
import React, { useState } from 'react'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/Button'
import { 
  Bars3Icon,
  XMarkIcon,
  HomeIcon,
  UserGroupIcon,
  CurrencyDollarIcon,
  DocumentTextIcon,
  Cog6ToothIcon,
  ArrowRightOnRectangleIcon,
  BeakerIcon,
  SunIcon,
  UsersIcon,
  BellAlertIcon,
  MapIcon,
  CubeIcon,
  ShoppingCartIcon,
  ScaleIcon,
  ShieldCheckIcon,
  HeartIcon,
  ChevronDownIcon,
  ChevronRightIcon,
} from '@heroicons/react/24/outline'
import { cn } from '@/lib/utils'
import { ClimaWidget } from '@/components/clima/ClimaWidget'
import { AssistantWidget } from '@/components/assistant/AssistantWidget'

interface DashboardLayoutProps {
  children: React.ReactNode
}

const menuItemsTop = [
  { key: '/dashboard', icon: HomeIcon, label: 'Dashboard' },
  { key: '/alertas', icon: BellAlertIcon, label: 'Alertas' },
  { key: '/ganado', icon: UserGroupIcon, label: 'Ganado' },
]

const dropdowns = [
  {
    id: 'hato',
    label: 'Hato',
    icon: BeakerIcon,
    items: [
      { key: '/sanidad', icon: ShieldCheckIcon, label: 'Sanidad' },
      { key: '/reproduccion', icon: HeartIcon, label: 'Reproducción' },
      { key: '/produccion-leche', icon: BeakerIcon, label: 'Producción Leche' },
    ],
  },
  {
    id: 'campo',
    label: 'Campo',
    icon: MapIcon,
    items: [
      { key: '/cultivos', icon: SunIcon, label: 'Cultivos' },
      { key: '/parcelas', icon: MapIcon, label: 'Parcelas' },
    ],
  },
  {
    id: 'administracion',
    label: 'Administración',
    icon: DocumentTextIcon,
    items: [
      { key: '/reportes', icon: DocumentTextIcon, label: 'Reportes' },
      { key: '/finanzas', icon: CurrencyDollarIcon, label: 'Finanzas' },
    ],
  },
  {
    id: 'sistema',
    label: 'Sistema',
    icon: Cog6ToothIcon,
    items: [
      { key: '/team', icon: UsersIcon, label: 'Team' },
      { key: '/configuracion', icon: Cog6ToothIcon, label: 'Configuración' },
    ],
  },
]

const menuItemsSingle = [
  { key: '/insumos', icon: CubeIcon, label: 'Insumos' },
  { key: '/ventas', icon: ShoppingCartIcon, label: 'Ventas' },
  { key: '/reglas', icon: ScaleIcon, label: 'Reglas' },
]

function getPageLabel(pathname: string): string {
  for (const d of dropdowns) {
    const found = d.items.find((i) => pathname === i.key)
    if (found) return found.label
  }
  const top = menuItemsTop.find((i) => pathname === i.key)
  if (top) return top.label
  const single = menuItemsSingle.find((i) => pathname === i.key)
  if (single) return single.label
  return 'Dashboard'
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [openDropdowns, setOpenDropdowns] = useState<Record<string, boolean>>({})
  const router = useRouter()
  const pathname = usePathname()
  const { user, logout } = useAuth()

  const toggleDropdown = (id: string) => setOpenDropdowns((prev) => ({ ...prev, [id]: !prev[id] }))
  const isInDropdown = (d: typeof dropdowns[0]) => d.items.some((i) => pathname === i.key)
  const isDropdownOpen = (d: typeof dropdowns[0]) => openDropdowns[d.id] || isInDropdown(d)

  const handleLogout = () => {
    logout()
    router.push('/auth/login')
  }

  const closeSidebar = () => setSidebarOpen(false)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar para desktop */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-52 lg:flex-col">
        <div className="flex min-h-0 flex-1 flex-col bg-white shadow-lg border-r border-gray-200">
          {/* Logo */}
          <div className="flex h-12 flex-shrink-0 items-center px-4 border-b border-gray-200">
            <h1 className="text-base font-bold text-green-600">Catledan SaaS</h1>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-0.5 px-3 py-4 overflow-y-auto">
            {menuItemsTop.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.key
              return (
                <Link
                  key={item.key}
                  href={item.key}
                  onClick={closeSidebar}
                  className={cn(
                    'group flex w-full items-center px-3 py-1.5 text-xs font-medium rounded-lg',
                    isActive ? 'bg-green-100 text-green-700' : 'text-gray-700 hover:bg-gray-100',
                  )}
                >
                  <Icon className={cn('mr-2.5 h-4 w-4 flex-shrink-0', isActive ? 'text-green-600' : 'text-gray-400')} />
                  {item.label}
                </Link>
              )
            })}
            {/* Dropdowns */}
            {dropdowns.map((dropdown) => (
              <div key={dropdown.id} className="pt-1">
                <button
                  type="button"
                  onClick={() => toggleDropdown(dropdown.id)}
                  className={cn(
                    'flex w-full items-center justify-between px-3 py-1.5 text-xs font-medium rounded-lg',
                    isInDropdown(dropdown) ? 'bg-green-100 text-green-700' : 'text-gray-700 hover:bg-gray-100',
                  )}
                >
                  <span className="flex items-center">
                    <dropdown.icon className={cn('mr-2.5 h-4 w-4', isInDropdown(dropdown) ? 'text-green-600' : 'text-gray-400')} />
                    {dropdown.label}
                  </span>
                  {isDropdownOpen(dropdown) ? <ChevronDownIcon className="h-3.5 w-3.5" /> : <ChevronRightIcon className="h-3.5 w-3.5" />}
                </button>
                {isDropdownOpen(dropdown) && (
                  <div className="ml-4 mt-0.5 space-y-0.5 border-l border-gray-200 pl-2">
                    {dropdown.items.map((item) => {
                      const Icon = item.icon
                      const isActive = pathname === item.key
                      return (
                        <Link
                          key={item.key}
                          href={item.key}
                          onClick={closeSidebar}
                          className={cn(
                            'flex items-center px-2 py-1 text-xs rounded',
                            isActive ? 'text-green-600 font-medium' : 'text-gray-600 hover:text-gray-900',
                          )}
                        >
                          <Icon className="mr-2 h-3.5 w-3.5 flex-shrink-0" />
                          {item.label}
                        </Link>
                      )
                    })}
                  </div>
                )}
              </div>
            ))}
            {menuItemsSingle.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.key
              return (
                <Link
                  key={item.key}
                  href={item.key}
                  onClick={closeSidebar}
                  className={cn(
                    'group flex w-full items-center px-3 py-1.5 text-xs font-medium rounded-lg',
                    isActive ? 'bg-green-100 text-green-700' : 'text-gray-700 hover:bg-gray-100',
                  )}
                >
                  <Icon className={cn('mr-2.5 h-4 w-4 flex-shrink-0', isActive ? 'text-green-600' : 'text-gray-400')} />
                  {item.label}
                </Link>
              )
            })}
          </nav>

          {/* User info */}
          <div className="flex-shrink-0 border-t border-gray-200 p-3">
            <div className="flex items-center space-x-2">
              <div className="h-7 w-7 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                <UserGroupIcon className="h-4 w-4 text-green-600" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-medium text-gray-900 truncate">{user?.fullName}</p>
                <p className="text-[10px] text-gray-500 truncate">{user?.businessName}</p>
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
            <nav className="flex-1 space-y-0.5 px-3 py-4 overflow-y-auto">
              {menuItemsTop.map((item) => (
                <Link key={item.key} href={item.key} onClick={closeSidebar}
                  className={cn('flex items-center px-3 py-1.5 text-xs font-medium rounded-lg',
                    pathname === item.key ? 'bg-green-100 text-green-700' : 'text-gray-700 hover:bg-gray-100')}>
                  <item.icon className={cn('mr-2.5 h-4 w-4', pathname === item.key ? 'text-green-600' : 'text-gray-400')} />
                  {item.label}
                </Link>
              ))}
              {dropdowns.map((dropdown) => (
                <div key={dropdown.id} className="pt-1">
                  <button type="button" onClick={() => toggleDropdown(dropdown.id)}
                    className={cn('flex w-full items-center justify-between px-3 py-1.5 text-xs font-medium rounded-lg',
                      isInDropdown(dropdown) ? 'bg-green-100 text-green-700' : 'text-gray-700 hover:bg-gray-100')}>
                    <span className="flex items-center">
                      <dropdown.icon className={cn('mr-2.5 h-4 w-4', isInDropdown(dropdown) ? 'text-green-600' : 'text-gray-400')} />
                      {dropdown.label}
                    </span>
                    {isDropdownOpen(dropdown) ? <ChevronDownIcon className="h-3.5 w-3.5" /> : <ChevronRightIcon className="h-3.5 w-3.5" />}
                  </button>
                  {isDropdownOpen(dropdown) && (
                    <div className="ml-4 mt-0.5 space-y-0.5 border-l border-gray-200 pl-2">
                      {dropdown.items.map((item) => (
                        <Link key={item.key} href={item.key} onClick={closeSidebar}
                          className={cn('flex items-center px-2 py-1 text-xs rounded',
                            pathname === item.key ? 'text-green-600 font-medium' : 'text-gray-600 hover:text-gray-900')}>
                          <item.icon className="mr-2 h-3.5 w-3.5" />
                          {item.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ))}
              {menuItemsSingle.map((item) => (
                <Link key={item.key} href={item.key} onClick={closeSidebar}
                  className={cn('flex items-center px-3 py-1.5 text-xs font-medium rounded-lg',
                    pathname === item.key ? 'bg-green-100 text-green-700' : 'text-gray-700 hover:bg-gray-100')}>
                  <item.icon className={cn('mr-2.5 h-4 w-4', pathname === item.key ? 'text-green-600' : 'text-gray-400')} />
                  {item.label}
                </Link>
              ))}
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
      <div className="lg:ml-52">
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
                  {getPageLabel(pathname)}
                </h2>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <ClimaWidget />
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

        {/* Asistente IA (Bedrock) - flotante inferior derecha */}
        <AssistantWidget />
      </div>
    </div>
  )
}

DashboardLayout.displayName = 'DashboardLayout'
