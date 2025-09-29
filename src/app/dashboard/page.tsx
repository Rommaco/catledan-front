'use client'
import React, { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { AnimatedCard } from '@/components/ui/AnimatedCard'
import { StatsCard } from '@/components/ui/StatsCard'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { CustomBarChart } from '@/components/charts/BarChart'
import { CustomLineChart } from '@/components/charts/LineChart'
import { CustomPieChart } from '@/components/charts/PieChart'
import { useDashboard } from '@/hooks/dashboard/useDashboard'
import { useToast } from '@/hooks/useToast'
import { 
  UserGroupIcon,
  CurrencyDollarIcon,
  BeakerIcon,
  ChartBarIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline'

function DashboardContent() {
  const { user } = useAuth()
  const { toast } = useToast()
  const { resumen, finanzas, ganado, produccion, cultivos, loadAllData } = useDashboard()
  
  const [isRefreshing, setIsRefreshing] = useState(false)

  // Debug: Log cuando el componente se monta
  useEffect(() => {
    console.log('🚀 DashboardContent montado')
    console.log('👤 Usuario:', user?.email)
  }, [user])

  const handleRefresh = async () => {
    setIsRefreshing(true)
    try {
      await loadAllData()
      toast({
        type: 'success',
        title: 'Datos actualizados',
        message: 'La información del dashboard se ha actualizado correctamente.'
      })
    } catch (error) {
      toast({
        type: 'error',
        title: 'Error al actualizar',
        message: 'No se pudieron actualizar los datos del dashboard.'
      })
    } finally {
      setIsRefreshing(false)
    }
  }

  // Función para obtener nombre del mes
  const getMonthName = (monthNumber: number) => {
    const months = [
      'Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun',
      'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'
    ]
    return months[monthNumber - 1] || `Mes ${monthNumber}`
  }

  // Preparar datos para las gráficas
  const finanzasChartData = finanzas.data.map(item => ({
    mes: getMonthName(item._id),
    ingresos: item.ingresos,
    gastos: item.gastos,
    balance: item.ingresos - item.gastos
  }))

  const produccionChartData = produccion.data.map(item => ({
    mes: getMonthName(item._id),
    litros: item.totalLitros
  }))

  const ganadoChartData = ganado.data.map(item => ({
    estado: item._id,
    cantidad: item.cantidad
  }))

  const cultivosChartData = cultivos.data.map(item => ({
    tipo: item._id,
    cantidad: item.cantidad,
    area: item.area
  }))

  const isLoading = resumen.loading || finanzas.loading || ganado.loading || produccion.loading || cultivos.loading
  const hasError = resumen.error || finanzas.error || ganado.error || produccion.error || cultivos.error

  // Debug: Mostrar estado actual solo si hay error
  if (hasError) {
    console.log('🔍 Error en dashboard:', hasError)
    console.log('📊 Estados individuales:', {
      resumen: { loading: resumen.loading, error: resumen.error, hasData: !!resumen.data },
      finanzas: { loading: finanzas.loading, error: finanzas.error, hasData: !!finanzas.data?.length },
      ganado: { loading: ganado.loading, error: ganado.error, hasData: !!ganado.data?.length },
      produccion: { loading: produccion.loading, error: produccion.error, hasData: !!produccion.data?.length },
      cultivos: { loading: cultivos.loading, error: cultivos.error, hasData: !!cultivos.data?.length }
    })
  }

  if (isLoading && !resumen.data) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-green-500 border-t-transparent mx-auto mb-4" />
            <p className="text-gray-600">Cargando datos del dashboard...</p>
            <p className="text-sm text-gray-500 mt-2">Loading: {isLoading.toString()}</p>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  // Solo mostrar error completo si no hay ningún dato
  const hasAnyData = resumen.data || finanzas.data?.length || ganado.data?.length || produccion.data?.length || cultivos.data?.length
  
  if (hasError && !hasAnyData && !isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <p className="text-red-600 mb-4">Error al cargar los datos del dashboard</p>
            <p className="text-sm text-gray-500 mb-4">Error: {hasError.toString()}</p>
            <Button onClick={handleRefresh} variant="primary" loading={isRefreshing}>
              <ArrowPathIcon className="w-4 h-4 mr-2" />
              Reintentar
            </Button>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6">
        {/* Header del Dashboard */}
        <div className="flex items-center justify-between animate-fade-in">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2 animate-slide-up">
              🚀 Dashboard Ganadero
            </h1>
            <p className="text-gray-600 animate-slide-up" style={{ animationDelay: '100ms' }}>
              Resumen completo de tu operación ganadera
            </p>
          </div>
          
          <Button
            variant="ghost"
            onClick={handleRefresh}
            loading={isRefreshing}
            icon={<ArrowPathIcon className="w-4 h-4" />}
            animate={true}
            className="animate-bounce-in"
            style={{ animationDelay: '200ms' }}
          >
            Actualizar
          </Button>
        </div>

        {/* Estadísticas principales */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="animate-fade-in" style={{ animationDelay: '100ms' }}>
            <StatsCard
              title="Total de Ganado"
              value={resumen.data?.totalGanado?.toString() || '0'}
              change="+12%"
              changeType="positive"
              icon={<UserGroupIcon className="w-6 h-6" />}
              animate={true}
            />
          </div>
          <div className="animate-fade-in" style={{ animationDelay: '200ms' }}>
            <StatsCard
              title="Ingresos Totales"
              value={`$${resumen.data?.totalIngresos?.toLocaleString() || '0'}`}
              change="+8%"
              changeType="positive"
              icon={<CurrencyDollarIcon className="w-6 h-6" />}
              animate={true}
            />
          </div>
          <div className="animate-fade-in" style={{ animationDelay: '300ms' }}>
            <StatsCard
              title="Gastos Totales"
              value={`$${resumen.data?.totalGastos?.toLocaleString() || '0'}`}
              change="-3%"
              changeType="negative"
              icon={<ArrowTrendingDownIcon className="w-6 h-6" />}
              animate={true}
            />
          </div>
          <div className="animate-fade-in" style={{ animationDelay: '400ms' }}>
            <StatsCard
              title="Reportes"
              value={resumen.data?.totalReportes?.toString() || '0'}
              change="+5%"
              changeType="positive"
              icon={<ChartBarIcon className="w-6 h-6" />}
              animate={true}
            />
          </div>
        </div>

        {/* Gráficas */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Finanzas Mensuales */}
          <AnimatedCard variant="elevated" delay={500} animationType="slide-left" className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Finanzas Mensuales
              </h3>
              {finanzas.error && (
                <span className="text-xs text-red-500 bg-red-50 px-2 py-1 rounded">
                  Error
                </span>
              )}
            </div>
            {finanzas.error ? (
              <div className="h-[300px] flex items-center justify-center text-red-500">
                <div className="text-center">
                  <p className="mb-2">Error al cargar finanzas</p>
                  <p className="text-xs text-gray-500">{finanzas.error}</p>
                </div>
              </div>
            ) : finanzas.data.length > 0 ? (
              <CustomLineChart
                data={finanzasChartData}
                xKey="mes"
                yKey="ingresos"
                title=""
                color="#22c55e"
                animate={true}
              />
            ) : (
              <div className="h-[300px] flex items-center justify-center text-gray-500">
                No hay datos de finanzas disponibles
              </div>
            )}
          </AnimatedCard>

          {/* Ganado por Estado */}
          <AnimatedCard variant="elevated" delay={600} animationType="slide-right" className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Distribución del Ganado
              </h3>
              {ganado.error && (
                <span className="text-xs text-red-500 bg-red-50 px-2 py-1 rounded">
                  Error
                </span>
              )}
            </div>
            {ganado.error ? (
              <div className="h-[300px] flex items-center justify-center text-red-500">
                <div className="text-center">
                  <p className="mb-2">Error al cargar ganado</p>
                  <p className="text-xs text-gray-500">{ganado.error}</p>
                </div>
              </div>
            ) : ganado.data.length > 0 ? (
              <CustomPieChart
                data={ganadoChartData}
                dataKey="cantidad"
                nameKey="estado"
                title=""
                animate={true}
              />
            ) : (
              <div className="h-[300px] flex items-center justify-center text-gray-500">
                No hay datos de ganado disponibles
              </div>
            )}
          </AnimatedCard>

          {/* Producción de Leche */}
          <AnimatedCard variant="elevated" delay={700} animationType="scale-up" className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Producción de Leche
              </h3>
              {produccion.error && (
                <span className="text-xs text-red-500 bg-red-50 px-2 py-1 rounded">
                  Error
                </span>
              )}
            </div>
            {produccion.error ? (
              <div className="h-[300px] flex items-center justify-center text-red-500">
                <div className="text-center">
                  <p className="mb-2">Error al cargar producción</p>
                  <p className="text-xs text-gray-500">{produccion.error}</p>
                </div>
              </div>
            ) : produccion.data.length > 0 ? (
              <CustomBarChart
                data={produccionChartData}
                xKey="mes"
                yKey="litros"
                title=""
                color="#3b82f6"
                animate={true}
              />
            ) : (
              <div className="h-[300px] flex items-center justify-center text-gray-500">
                No hay datos de producción disponibles
              </div>
            )}
          </AnimatedCard>

          {/* Cultivos */}
          <AnimatedCard variant="elevated" delay={800} animationType="bounce-in" className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Tipos de Cultivos
              </h3>
              {cultivos.error && (
                <span className="text-xs text-red-500 bg-red-50 px-2 py-1 rounded">
                  Error
                </span>
              )}
            </div>
            {cultivos.error ? (
              <div className="h-[300px] flex items-center justify-center text-red-500">
                <div className="text-center">
                  <p className="mb-2">Error al cargar cultivos</p>
                  <p className="text-xs text-gray-500">{cultivos.error}</p>
                </div>
              </div>
            ) : cultivos.data.length > 0 ? (
              <CustomBarChart
                data={cultivosChartData}
                xKey="tipo"
                yKey="cantidad"
                title=""
                color="#f59e0b"
                animate={true}
              />
            ) : (
              <div className="h-[300px] flex items-center justify-center text-gray-500">
                No hay datos de cultivos disponibles
              </div>
            )}
          </AnimatedCard>
        </div>

        {/* Información del usuario */}

      </div>
    </DashboardLayout>
  )
}

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <DashboardContent />
    </ProtectedRoute>
  )
}
