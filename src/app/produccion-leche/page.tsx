'use client'

import React, { useState, useEffect, useMemo } from 'react'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { EnhancedTable } from '@/components/ui/EnhancedTable'
import { Badge } from '@/components/ui/Badge'
import { StatsCard } from '@/components/ui/StatsCard'
import { ProduccionLecheModal } from '@/components/produccionLeche/ProduccionLecheModal'
import { ConfirmModal } from '@/components/ui/ConfirmModal'
import { useProduccionLeche, useProduccionLecheStats } from '@/hooks/produccionLeche/useProduccionLeche'
import { useToast } from '@/hooks/useToast'
import { ProduccionLeche, CreateProduccionLecheData, UpdateProduccionLecheData } from '@/types/produccionLeche'
import { 
  PlusIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  CalendarDaysIcon,
  BeakerIcon,
  ChartBarIcon,
  ArrowTrendingUpIcon
} from '@heroicons/react/24/outline'

function ProduccionLecheContent() {
  const { toast } = useToast()
  const { 
    loading, 
    error, 
    data, 
    total,
    fetchProduccionLeche,
    addProduccionLeche,
    updateProduccionLeche,
    deleteProduccionLeche
  } = useProduccionLeche()

  const { stats, fetchStats } = useProduccionLecheStats()

  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [searchText, setSearchText] = useState('')
  const [startDate, setStartDate] = useState<Date | null>(null)
  const [endDate, setEndDate] = useState<Date | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedProduccion, setSelectedProduccion] = useState<ProduccionLeche | null>(null)
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create')
  const [modalLoading, setModalLoading] = useState(false)

  // Estados para modal de confirmación
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false)
  const [produccionToDelete, setProduccionToDelete] = useState<ProduccionLeche | null>(null)
  const [deleteLoading, setDeleteLoading] = useState(false)

  // Cargar datos al montar el componente
  useEffect(() => {
    fetchProduccionLeche({
      page: currentPage,
      limit: pageSize,
      startDate: startDate?.toISOString().split('T')[0],
      endDate: endDate?.toISOString().split('T')[0]
    })
    fetchStats()
  }, [currentPage, pageSize, startDate, endDate])

  // Aplicar filtros
  const filteredData = useMemo(() => {
    if (!data || !Array.isArray(data)) {
      return []
    }
    
    return data.filter(produccion => {
      const matchesSearch = 
        produccion.observaciones?.toLowerCase().includes(searchText.toLowerCase()) ||
        produccion.cantidad.toString().includes(searchText.toLowerCase())
      
      return matchesSearch
    })
  }, [data, searchText])

  // Datos seguros para las estadísticas
  const safeData = data || []

  const handleCreateProduccion = () => {
    setSelectedProduccion(null)
    setModalMode('create')
    setIsModalOpen(true)
  }

  const handleEditProduccion = (produccion: ProduccionLeche) => {
    setSelectedProduccion(produccion)
    setModalMode('edit')
    setIsModalOpen(true)
  }

  const handleDeleteProduccion = (produccion: ProduccionLeche) => {
    setProduccionToDelete(produccion)
    setIsConfirmModalOpen(true)
  }

  const confirmDelete = async () => {
    if (!produccionToDelete) return

    try {
      setDeleteLoading(true)
      await deleteProduccionLeche(produccionToDelete._id)
      toast({
        type: 'success',
        title: 'Éxito',
        message: 'Registro de producción eliminado exitosamente'
      })
      handleRefresh()
      setIsConfirmModalOpen(false)
      setProduccionToDelete(null)
    } catch (error) {
      toast({
        type: 'error',
        title: 'Error',
        message: 'Error al eliminar el registro de producción'
      })
    } finally {
      setDeleteLoading(false)
    }
  }

  const handleModalSave = async (data: CreateProduccionLecheData | UpdateProduccionLecheData) => {
    setModalLoading(true)
    try {
      if (modalMode === 'create') {
        await addProduccionLeche(data as CreateProduccionLecheData)
        toast({
          type: 'success',
          title: 'Éxito',
          message: 'Producción de leche registrada exitosamente'
        })
      } else {
        if (selectedProduccion) {
          await updateProduccionLeche(selectedProduccion._id, data)
          toast({
            type: 'success',
            title: 'Éxito',
            message: 'Producción de leche actualizada exitosamente'
          })
        }
      }
    } catch (error) {
      toast({
        type: 'error',
        title: 'Error',
        message: modalMode === 'create' 
          ? 'Error al registrar la producción de leche'
          : 'Error al actualizar la producción de leche'
      })
    } finally {
      setModalLoading(false)
    }
  }

  const handleRefresh = () => {
    setCurrentPage(1)
    fetchProduccionLeche({
      page: 1,
      limit: pageSize,
      startDate: startDate?.toISOString().split('T')[0],
      endDate: endDate?.toISOString().split('T')[0]
    })
    fetchStats()
  }

  const columns = [
    {
      key: 'fecha',
      title: 'Fecha',
      dataIndex: 'fecha',
      render: (fecha: string) => (
        <span className="text-sm font-medium text-gray-900">
          {new Date(fecha).toLocaleDateString('es-ES')}
        </span>
      )
    },
    {
      key: 'cantidad',
      title: 'Cantidad (L)',
      dataIndex: 'cantidad',
      render: (cantidad: number) => (
        <div className="flex items-center space-x-2">
          <BeakerIcon className="h-4 w-4 text-blue-500" />
          <span className="font-semibold text-blue-600">
            {cantidad.toFixed(1)} L
          </span>
        </div>
      )
    },
    {
      key: 'observaciones',
      title: 'Observaciones',
      dataIndex: 'observaciones',
      render: (observaciones: string) => (
        <span className="text-sm text-gray-600">
          {observaciones || 'Sin observaciones'}
        </span>
      )
    },
    {
      key: 'createdAt',
      title: 'Registrado',
      dataIndex: 'createdAt',
      render: (createdAt: string) => (
        <span className="text-sm text-gray-500">
          {new Date(createdAt).toLocaleDateString('es-ES')}
        </span>
      )
    },
  ]

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="p-6">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <h3 className="text-red-800 font-medium">Error al cargar los datos</h3>
            <p className="text-red-600 text-sm mt-1">{error}</p>
            <button
              onClick={handleRefresh}
              className="mt-3 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
            >
              Reintentar
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <BeakerIcon className="h-8 w-8 text-blue-600" />
              Producción de Leche
            </h1>
            <p className="text-gray-600 mt-2">
              Registra y gestiona la producción diaria de leche
            </p>
          </div>
          
          <div className="mt-4 sm:mt-0">
            <button
              onClick={handleCreateProduccion}
              className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-6 py-3 rounded-lg font-medium transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center gap-2"
            >
              <PlusIcon className="h-5 w-5" />
              Agregar Producción
            </button>
          </div>
        </div>

        {/* Estadísticas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="animate-fade-in" style={{ animationDelay: '300ms' }}>
            <StatsCard
              title="Total Registros"
              value={safeData.length.toString()}
              icon={<ChartBarIcon className="w-6 h-6" />}
              animate={true}
            />
          </div>
          
          <div className="animate-fade-in" style={{ animationDelay: '400ms' }}>
            <StatsCard
              title="Total Litros"
              value={safeData.reduce((sum, p) => sum + p.cantidad, 0).toFixed(1)}
              icon={<BeakerIcon className="w-6 h-6" />}
              animate={true}
            />
          </div>
          
          <div className="animate-fade-in" style={{ animationDelay: '500ms' }}>
            <StatsCard
              title="Promedio Diario"
              value={safeData.length > 0 
                ? (safeData.reduce((sum, p) => sum + p.cantidad, 0) / safeData.length).toFixed(1)
                : '0.0'
              }
              icon={<ArrowTrendingUpIcon className="w-6 h-6" />}
              animate={true}
            />
          </div>
          
          <div className="animate-fade-in" style={{ animationDelay: '600ms' }}>
            <StatsCard
              title="Último Registro"
              value={safeData.length > 0 
                ? new Date(safeData[safeData.length - 1].fecha).toLocaleDateString('es-ES')
                : 'N/A'
              }
              icon={<CalendarDaysIcon className="w-6 h-6" />}
              animate={true}
            />
          </div>
        </div>

        {/* Filtros */}
        <div className="bg-white p-4 rounded-lg border border-gray-200 animate-fade-in" style={{ animationDelay: '700ms' }}>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Buscar por observaciones o cantidad..."
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
            </div>
            
            <div className="flex gap-2">
              <input
                type="date"
                value={startDate?.toISOString().split('T')[0] || ''}
                onChange={(e) => setStartDate(e.target.value ? new Date(e.target.value) : null)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="Fecha inicio"
              />
              <input
                type="date"
                value={endDate?.toISOString().split('T')[0] || ''}
                onChange={(e) => setEndDate(e.target.value ? new Date(e.target.value) : null)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="Fecha fin"
              />
            </div>
          </div>
        </div>

        {/* Tabla */}
        <div className="animate-fade-in" style={{ animationDelay: '800ms' }}>
          <EnhancedTable
            columns={columns}
            data={filteredData}
            loading={loading}
            exportFilename="produccion-leche"
            exportTitle="Reporte de Producción de Leche"
            onRefresh={handleRefresh}
            onEdit={handleEditProduccion}
            onDelete={handleDeleteProduccion}
            pagination={{
              current: currentPage,
              pageSize: pageSize,
              total: filteredData.length,
              onChange: setCurrentPage,
              onPageSizeChange: setPageSize
            }}
          />
        </div>

        {/* Modal de Producción de Leche */}
        <ProduccionLecheModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSave={handleModalSave}
          produccion={selectedProduccion}
          mode={modalMode}
          loading={modalLoading}
        />

        {/* Modal de Confirmación */}
        <ConfirmModal
          isOpen={isConfirmModalOpen}
          onClose={() => {
            setIsConfirmModalOpen(false)
            setProduccionToDelete(null)
          }}
          onConfirm={confirmDelete}
          title="Eliminar Registro"
          message="¿Estás seguro de que quieres eliminar este registro de producción de leche? Esta acción no se puede deshacer."
          confirmText="Eliminar"
          cancelText="Cancelar"
          loading={deleteLoading}
          variant="danger"
        />
      </div>
    </div>
  )
}

export default function ProduccionLechePage() {
  return (
    <ProtectedRoute>
      <DashboardLayout>
        <ProduccionLecheContent />
      </DashboardLayout>
    </ProtectedRoute>
  )
}
