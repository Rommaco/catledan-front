'use client'
import React, { useState, useEffect, useMemo } from 'react'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { EnhancedTable } from '@/components/ui/EnhancedTable'
import { Badge } from '@/components/ui/Badge'
import { StatsCard } from '@/components/ui/StatsCard'
import { Button } from '@/components/ui/Button'
import { FinanzaModal } from '@/components/finanza/FinanzaModal'
import { ConfirmModal } from '@/components/ui/ConfirmModal'
import { useFinanza, useFinanzaStats } from '@/hooks/finanza/useFinanza'
import { useToast } from '@/hooks/useToast'
import { 
  Finanza, 
  CreateFinanzaData, 
  UpdateFinanzaData, 
  TIPOS_FINANZA, 
  ESTADOS_FINANZA,
  CATEGORIAS_INGRESOS,
  CATEGORIAS_GASTOS,
  getTipoColor, 
  getTipoLabel,
  getEstadoColor,
  getEstadoLabel
} from '@/types/finanza'
import { format } from 'date-fns'
import {
  PlusIcon,
  CurrencyDollarIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  ChartBarIcon,
} from '@heroicons/react/24/outline'

function FinanzasContent() {
  const {
    data,
    total,
    loading,
    error,
    currentPage,
    pageSize,
    setCurrentPage,
    setPageSize,
    fetchFinanzas,
    addFinanza,
    updateFinanza,
    deleteFinanza,
  } = useFinanza()

  const { stats, loadingStats } = useFinanzaStats()

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create')
  const [selectedFinanza, setSelectedFinanza] = useState<Finanza | null>(null)
  const [modalLoading, setModalLoading] = useState(false)

  // Estados para modal de confirmación
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false)
  const [finanzaToDelete, setFinanzaToDelete] = useState<Finanza | null>(null)
  const [deleteLoading, setDeleteLoading] = useState(false)

  // Cargar datos al montar el componente
  useEffect(() => {
    fetchFinanzas({
      page: currentPage,
      limit: pageSize
    })
  }, [currentPage, pageSize, fetchFinanzas])

  const handleRefresh = () => {
    fetchFinanzas({
      page: currentPage,
      limit: pageSize
    })
  }

  const handleCreateFinanza = () => {
    setSelectedFinanza(null)
    setModalMode('create')
    setIsModalOpen(true)
  }

  const handleEditFinanza = (finanza: Finanza) => {
    setSelectedFinanza(finanza)
    setModalMode('edit')
    setIsModalOpen(true)
  }

  const handleDeleteFinanza = (finanza: Finanza) => {
    setFinanzaToDelete(finanza)
    setIsConfirmModalOpen(true)
  }

  const confirmDelete = async () => {
    if (!finanzaToDelete) return

    try {
      setDeleteLoading(true)
      await deleteFinanza(finanzaToDelete._id)
      handleRefresh()
      setIsConfirmModalOpen(false)
      setFinanzaToDelete(null)
    } catch (error) {
      console.error('Error al eliminar finanza:', error)
    } finally {
      setDeleteLoading(false)
    }
  }

  const handleModalSave = async (dataToSave: CreateFinanzaData | UpdateFinanzaData) => {
    setModalLoading(true)
    try {
      if (modalMode === 'create') {
        await addFinanza(dataToSave as CreateFinanzaData)
      } else {
        await updateFinanza(selectedFinanza!._id, dataToSave as UpdateFinanzaData)
      }
      handleRefresh()
    } catch (error) {
      console.error('Error al guardar finanza:', error)
    } finally {
      setModalLoading(false)
    }
  }

  const columns = useMemo(() => [
    {
      key: 'descripcion',
      title: 'Descripción',
      dataIndex: 'descripcion',
      render: (descripcion: string) => (
        <span className="font-medium text-gray-900">{descripcion}</span>
      )
    },
    {
      key: 'tipo',
      title: 'Tipo',
      dataIndex: 'tipo',
      render: (tipo: string) => (
        <Badge
          variant={tipo === 'ingreso' ? 'success' : 'error'}
          size="sm"
        >
          {getTipoLabel(tipo)}
        </Badge>
      )
    },
    {
      key: 'categoria',
      title: 'Categoría',
      dataIndex: 'categoria',
      render: (categoria: string) => (
        <span className="text-sm text-gray-600">{categoria}</span>
      )
    },
    {
      key: 'monto',
      title: 'Monto',
      dataIndex: 'monto',
      render: (monto: number, record: Finanza) => (
        <span className={`font-medium ${record.tipo === 'ingreso' ? 'text-green-600' : 'text-red-600'}`}>
          ${monto.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
        </span>
      )
    },
    {
      key: 'estado',
      title: 'Estado',
      dataIndex: 'estado',
      render: (estado: string) => (
        <Badge
          variant={estado === 'completado' ? 'success' : estado === 'pendiente' ? 'warning' : 'error'}
          size="sm"
        >
          {getEstadoLabel(estado)}
        </Badge>
      )
    },
    {
      key: 'fecha',
      title: 'Fecha',
      dataIndex: 'fecha',
      render: (fecha: string) => format(new Date(fecha), 'dd/MM/yyyy')
    },
    {
      key: 'createdBy',
      title: 'Creado por',
      dataIndex: 'createdBy',
      render: (createdBy: { fullName?: string; email?: string } | null | undefined) => (
        <span className="text-sm text-gray-600">
          {createdBy?.fullName || createdBy?.email || 'N/A'}
        </span>
      )
    }
  ], [])

  const tipoOptions = TIPOS_FINANZA.map(tipo => ({
    value: tipo.value,
    label: tipo.label,
  }))

  const estadoOptions = ESTADOS_FINANZA.map(estado => ({
    value: estado.value,
    label: estado.label,
  }))

  const categoriaOptions = [
    ...CATEGORIAS_INGRESOS.map(cat => ({ value: cat, label: cat })),
    ...CATEGORIAS_GASTOS.map(cat => ({ value: cat, label: cat }))
  ]

  if (error && !data?.length) {
    return (
      <DashboardLayout>
        <div className="p-6">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <h3 className="text-lg font-medium text-red-800 mb-2">Error al cargar finanzas</h3>
            <p className="text-red-600">{error}</p>
            <button
              onClick={handleRefresh}
              className="mt-3 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Reintentar
            </button>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Finanzas</h1>
            <p className="text-gray-600">Gestiona ingresos, gastos y transacciones financieras</p>
          </div>
          <Button
            onClick={handleCreateFinanza}
            variant="primary"
            size="lg"
            className="mt-4 sm:mt-0 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
          >
            <PlusIcon className="w-5 h-5 mr-2" />
            Nueva Transacción
          </Button>
        </div>

        {/* Estadísticas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatsCard
            title="Balance Total"
            value={`$${stats.balance.toLocaleString('es-MX', { minimumFractionDigits: 2 })}`}
            icon={<CurrencyDollarIcon className="w-6 h-6" />}
            color={stats.balance >= 0 ? 'green' : 'red'}
            loading={loadingStats}
          />
          <StatsCard
            title="Total Ingresos"
            value={`$${stats.totalIngresos.toLocaleString('es-MX', { minimumFractionDigits: 2 })}`}
            icon={<ArrowTrendingUpIcon className="w-6 h-6" />}
            color="green"
            loading={loadingStats}
          />
          <StatsCard
            title="Total Gastos"
            value={`$${stats.totalGastos.toLocaleString('es-MX', { minimumFractionDigits: 2 })}`}
            icon={<ArrowTrendingDownIcon className="w-6 h-6" />}
            color="red"
            loading={loadingStats}
          />
          <StatsCard
            title="Transacciones"
            value={stats.transaccionesCompletadas}
            icon={<ChartBarIcon className="w-6 h-6" />}
            color="blue"
            loading={loadingStats}
          />
        </div>


        {/* Tabla */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <EnhancedTable
            data={data || []}
            columns={columns}
            loading={loading}
            onRefresh={handleRefresh}
            onEdit={handleEditFinanza}
            onDelete={handleDeleteFinanza}
            exportFilename="finanzas"
            exportTitle="Reporte de Finanzas"
            pagination={{
              current: currentPage,
              pageSize: pageSize,
              total: data?.length || 0,
              onChange: setCurrentPage
            }}
            customFilters={[
              {
                key: 'tipo',
                label: 'Tipo',
                type: 'select',
                options: [
                  { value: '', label: 'Todos los tipos' },
                  { value: 'ingreso', label: 'Ingreso' },
                  { value: 'gasto', label: 'Gasto' }
                ]
              },
              {
                key: 'categoria',
                label: 'Categoría',
                type: 'select',
                options: [
                  { value: '', label: 'Todas las categorías' },
                  { value: 'alimentacion', label: 'Alimentación' },
                  { value: 'veterinario', label: 'Veterinario' },
                  { value: 'equipos', label: 'Equipos' },
                  { value: 'mano_obra', label: 'Mano de Obra' },
                  { value: 'ventas', label: 'Ventas' },
                  { value: 'subsidios', label: 'Subsidios' },
                  { value: 'otros', label: 'Otros' }
                ]
              },
              {
                key: 'estado',
                label: 'Estado',
                type: 'select',
                options: [
                  { value: '', label: 'Todos los estados' },
                  { value: 'pendiente', label: 'Pendiente' },
                  { value: 'completado', label: 'Completado' },
                  { value: 'cancelado', label: 'Cancelado' }
                ]
              }
            ]}
          />
        </div>

        {/* Modal de Finanza */}
        <FinanzaModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSave={handleModalSave}
          finanza={selectedFinanza}
          mode={modalMode}
          loading={modalLoading}
        />

        {/* Modal de Confirmación */}
        <ConfirmModal
          isOpen={isConfirmModalOpen}
          onClose={() => {
            setIsConfirmModalOpen(false)
            setFinanzaToDelete(null)
          }}
          onConfirm={confirmDelete}
          title="Eliminar Transacción"
          message={`¿Estás seguro de que quieres eliminar la transacción "${finanzaToDelete?.descripcion}"? Esta acción no se puede deshacer.`}
          confirmText="Eliminar"
          cancelText="Cancelar"
          loading={deleteLoading}
          variant="danger"
        />

        {/* Botón flotante para móviles */}
        <div className="fixed bottom-6 right-6 z-50 sm:hidden">
          <Button
            onClick={handleCreateFinanza}
            variant="primary"
            size="lg"
            className="rounded-full shadow-2xl hover:shadow-3xl transform hover:scale-110 transition-all duration-200 animate-bounce-in"
          >
            <PlusIcon className="w-6 h-6" />
          </Button>
        </div>
      </div>
    </DashboardLayout>
  )
}

export default function FinanzasPage() {
  return (
    <ProtectedRoute>
      <FinanzasContent />
    </ProtectedRoute>
  )
}
