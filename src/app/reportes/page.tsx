'use client'
import React, { useState, useEffect, useMemo } from 'react'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { EnhancedTable } from '@/components/ui/EnhancedTable'
import { Badge } from '@/components/ui/Badge'
import { StatsCard } from '@/components/ui/StatsCard'
import { Button } from '@/components/ui/Button'
import { ReporteModal } from '@/components/reporte/ReporteModal'
import { ConfirmModal } from '@/components/ui/ConfirmModal'
import { useReporte, useReporteStats } from '@/hooks/reporte/useReporte'
import { useToast } from '@/hooks/useToast'
import { Reporte, CreateReporteData, UpdateReporteData, TIPOS_REPORTE, getTipoColor, getTipoLabel } from '@/types/reporte'
import { format } from 'date-fns'
import {
  PlusIcon,
  DocumentTextIcon,
  ChartBarIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
} from '@heroicons/react/24/outline'

function ReportesContent() {
  const {
    data,
    total,
    loading,
    error,
    currentPage,
    pageSize,
    setCurrentPage,
    setPageSize,
    fetchReportes,
    addReporte,
    updateReporte,
    deleteReporte,
  } = useReporte()

  const { stats, loadingStats } = useReporteStats()

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create')
  const [selectedReporte, setSelectedReporte] = useState<Reporte | null>(null)
  const [modalLoading, setModalLoading] = useState(false)

  // Estados para modal de confirmación
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false)
  const [reporteToDelete, setReporteToDelete] = useState<Reporte | null>(null)
  const [deleteLoading, setDeleteLoading] = useState(false)

  // Cargar datos al montar el componente
  useEffect(() => {
    fetchReportes({
      page: currentPage,
      limit: pageSize
    })
  }, [currentPage, pageSize, fetchReportes])

  const handleRefresh = () => {
    fetchReportes({
      page: currentPage,
      limit: pageSize
    })
  }

  const handleCreateReporte = () => {
    setSelectedReporte(null)
    setModalMode('create')
    setIsModalOpen(true)
  }

  const handleEditReporte = (reporte: Reporte) => {
    setSelectedReporte(reporte)
    setModalMode('edit')
    setIsModalOpen(true)
  }

  const handleDeleteReporte = (reporte: Reporte) => {
    setReporteToDelete(reporte)
    setIsConfirmModalOpen(true)
  }

  const confirmDelete = async () => {
    if (!reporteToDelete) return

    try {
      setDeleteLoading(true)
      await deleteReporte(reporteToDelete._id)
      handleRefresh()
      setIsConfirmModalOpen(false)
      setReporteToDelete(null)
    } catch (error) {
      console.error('Error al eliminar reporte:', error)
    } finally {
      setDeleteLoading(false)
    }
  }

  const handleModalSave = async (dataToSave: CreateReporteData | UpdateReporteData) => {
    setModalLoading(true)
    try {
      if (modalMode === 'create') {
        await addReporte(dataToSave as CreateReporteData)
      } else {
        await updateReporte(selectedReporte!._id, dataToSave as UpdateReporteData)
      }
      handleRefresh()
    } catch (error) {
      console.error('Error al guardar reporte:', error)
    } finally {
      setModalLoading(false)
    }
  }

  const columns = useMemo(() => [
    {
      key: 'titulo',
      title: 'Título',
      dataIndex: 'titulo',
      render: (titulo: string) => (
        <span className="font-medium text-gray-900">{titulo}</span>
      )
    },
    {
      key: 'tipo',
      title: 'Tipo',
      dataIndex: 'tipo',
      render: (tipo: string) => (
        <Badge
          variant="info"
          size="sm"
        >
          {getTipoLabel(tipo)}
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
      key: 'descripcion',
      title: 'Descripción',
      dataIndex: 'descripcion',
      render: (descripcion: string) => (
        <span className="text-sm text-gray-600 max-w-xs truncate">
          {descripcion}
        </span>
      )
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

  const tipoOptions = TIPOS_REPORTE.map(tipo => ({
    value: tipo.value,
    label: tipo.label,
  }))

  if (error && !data?.length) {
    return (
      <DashboardLayout>
        <div className="p-6">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <h3 className="text-lg font-medium text-red-800 mb-2">Error al cargar reportes</h3>
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
            <h1 className="text-2xl font-bold text-gray-900">Reportes</h1>
            <p className="text-gray-600">Gestiona y visualiza todos los reportes del sistema</p>
          </div>
          <Button
            onClick={handleCreateReporte}
            variant="primary"
            size="lg"
            className="mt-4 sm:mt-0 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
          >
            <PlusIcon className="w-5 h-5 mr-2" />
            Nuevo Reporte
          </Button>
        </div>

        {/* Estadísticas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatsCard
            title="Total Reportes"
            value={stats.totalReportes}
            icon={<DocumentTextIcon className="w-6 h-6" />}
            color="blue"
            loading={loadingStats}
          />
          <StatsCard
            title="Reportes de Producción"
            value={stats.reportesPorTipo.produccion || 0}
            icon={<ChartBarIcon className="w-6 h-6" />}
            color="green"
            loading={loadingStats}
          />
          <StatsCard
            title="Reportes de Salud"
            value={stats.reportesPorTipo.salud || 0}
            icon={<ChartBarIcon className="w-6 h-6" />}
            color="red"
            loading={loadingStats}
          />
          <StatsCard
            title="Reportes Financieros"
            value={stats.reportesPorTipo.financiero || 0}
            icon={<ChartBarIcon className="w-6 h-6" />}
            color="purple"
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
            onEdit={handleEditReporte}
            onDelete={handleDeleteReporte}
            exportFilename="reportes"
            exportTitle="Reporte de Reportes"
            pagination={{
              current: currentPage,
              pageSize: pageSize,
              total: data?.length || 0,
              onChange: setCurrentPage
            }}
            customFilters={[
              {
                key: 'tipo',
                label: 'Tipo de Reporte',
                type: 'select',
                options: [
                  { value: '', label: 'Todos los tipos' },
                  { value: 'produccion', label: 'Producción' },
                  { value: 'financiero', label: 'Financiero' },
                  { value: 'inventario', label: 'Inventario' },
                  { value: 'sanitario', label: 'Sanitario' },
                  { value: 'reproductivo', label: 'Reproductivo' },
                  { value: 'nutricional', label: 'Nutricional' }
                ]
              }
            ]}
          />
        </div>

        {/* Modal de Reporte */}
        <ReporteModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSave={handleModalSave}
          reporte={selectedReporte}
          mode={modalMode}
          loading={modalLoading}
        />

        {/* Modal de Confirmación */}
        <ConfirmModal
          isOpen={isConfirmModalOpen}
          onClose={() => {
            setIsConfirmModalOpen(false)
            setReporteToDelete(null)
          }}
          onConfirm={confirmDelete}
          title="Eliminar Reporte"
          message={`¿Estás seguro de que quieres eliminar el reporte "${reporteToDelete?.titulo}"? Esta acción no se puede deshacer.`}
          confirmText="Eliminar"
          cancelText="Cancelar"
          loading={deleteLoading}
          variant="danger"
        />

        {/* Botón flotante para móviles */}
        <div className="fixed bottom-6 right-6 z-50 sm:hidden">
          <Button
            onClick={handleCreateReporte}
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

export default function ReportesPage() {
  return (
    <ProtectedRoute>
      <ReportesContent />
    </ProtectedRoute>
  )
}
