'use client'
import React, { useState, useMemo, useCallback, useEffect } from 'react'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { EnhancedTable } from '@/components/ui/EnhancedTable'
import { Badge } from '@/components/ui/Badge'
import { StatsCard } from '@/components/ui/StatsCard'
import { CultivoModal } from '@/components/cultivo/CultivoModal'
import { ConfirmModal } from '@/components/ui/ConfirmModal'
import { useCultivo, useCultivoStats } from '@/hooks/cultivo/useCultivo'
import { useToast } from '@/hooks/useToast'
import { Cultivo, CreateCultivoData, UpdateCultivoData } from '@/types/cultivo'
import {
  PlusIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  CalendarDaysIcon,
  SunIcon,
  ChartBarIcon,
  BeakerIcon,
  PencilIcon,
  TrashIcon
} from '@heroicons/react/24/outline'
import { Input } from '@/components/ui/Input'
import { CustomSelect } from '@/components/ui/CustomSelect'
import { DatePicker } from '@/components/ui/DatePicker'
import { Button } from '@/components/ui/Button'
import { format } from 'date-fns'

const tiposCultivo = [
  { value: '', label: 'Todos los tipos' },
  { value: 'maiz', label: 'Maíz' },
  { value: 'trigo', label: 'Trigo' },
  { value: 'soja', label: 'Soja' },
  { value: 'arroz', label: 'Arroz' },
  { value: 'tomate', label: 'Tomate' },
  { value: 'papa', label: 'Papa' },
  { value: 'cebolla', label: 'Cebolla' },
  { value: 'zanahoria', label: 'Zanahoria' },
  { value: 'lechuga', label: 'Lechuga' },
  { value: 'otro', label: 'Otro' },
]

const estadosCultivo = [
  { value: '', label: 'Todos los estados' },
  { value: 'sembrado', label: 'Sembrado' },
  { value: 'en crecimiento', label: 'En Crecimiento' },
  { value: 'maduro', label: 'Maduro' },
  { value: 'cosechado', label: 'Cosechado' },
]

function CultivosContent() {
  const { toast } = useToast()
  const {
    loading,
    data,
    total,
    currentPage,
    pageSize,
    setCurrentPage,
    setPageSize,
    fetchCultivos,
    addCultivo,
    updateCultivo,
    deleteCultivo,
  } = useCultivo()

  const { stats, loadingStats, fetchStats } = useCultivoStats()

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create')
  const [selectedCultivo, setSelectedCultivo] = useState<Cultivo | null>(null)
  const [modalLoading, setModalLoading] = useState(false)

  // Estados para modal de confirmación
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false)
  const [cultivoToDelete, setCultivoToDelete] = useState<Cultivo | null>(null)
  const [deleteLoading, setDeleteLoading] = useState(false)

  // Filtros
  const [searchText, setSearchText] = useState('')
  const [filterTipo, setFilterTipo] = useState('')
  const [filterEstado, setFilterEstado] = useState('')
  const [filterStartDate, setFilterStartDate] = useState<Date | null>(null)
  const [filterEndDate, setFilterEndDate] = useState<Date | null>(null)

  const handleRefresh = useCallback(() => {
    fetchCultivos({
      search: searchText,
      tipo: filterTipo || undefined,
      estado: filterEstado || undefined,
      startDate: filterStartDate ? format(filterStartDate, 'yyyy-MM-dd') : undefined,
      endDate: filterEndDate ? format(filterEndDate, 'yyyy-MM-dd') : undefined,
    })
    fetchStats()
  }, [fetchCultivos, fetchStats, searchText, filterTipo, filterEstado, filterStartDate, filterEndDate])

  useEffect(() => {
    handleRefresh()
  }, [handleRefresh, currentPage, pageSize])

  const filteredData = useMemo(() => {
    if (!data || !Array.isArray(data)) {
      return []
    }

    return data.filter((cultivo) => {
      const matchesSearch =
        cultivo.nombre.toLowerCase().includes(searchText.toLowerCase()) ||
        cultivo.tipo.toLowerCase().includes(searchText.toLowerCase()) ||
        (cultivo.variedad && cultivo.variedad.toLowerCase().includes(searchText.toLowerCase()))

      const matchesTipo = !filterTipo || cultivo.tipo === filterTipo
      const matchesEstado = !filterEstado || cultivo.estado === filterEstado

      const cultivoDate = new Date(cultivo.fechaSiembra)
      const matchesStartDate = filterStartDate ? cultivoDate >= filterStartDate : true
      const matchesEndDate = filterEndDate ? cultivoDate <= filterEndDate : true

      return matchesSearch && matchesTipo && matchesEstado && matchesStartDate && matchesEndDate
    })
  }, [data, searchText, filterTipo, filterEstado, filterStartDate, filterEndDate])

  const handleCreateCultivo = () => {
    setSelectedCultivo(null)
    setModalMode('create')
    setIsModalOpen(true)
  }

  const handleEditCultivo = (cultivo: Cultivo) => {
    setSelectedCultivo(cultivo)
    setModalMode('edit')
    setIsModalOpen(true)
  }

  const handleDeleteCultivo = (cultivo: Cultivo) => {
    setCultivoToDelete(cultivo)
    setIsConfirmModalOpen(true)
  }

  const confirmDelete = async () => {
    if (!cultivoToDelete) return

    try {
      setDeleteLoading(true)
      await deleteCultivo(cultivoToDelete._id)
      toast({
        type: 'success',
        title: 'Eliminado',
        message: 'Cultivo eliminado correctamente.',
      })
      handleRefresh()
      setIsConfirmModalOpen(false)
      setCultivoToDelete(null)
    } catch (error) {
      console.error('Error al eliminar:', error)
      toast({
        type: 'error',
        title: 'Error',
        message: 'Hubo un error al eliminar el cultivo.',
      })
    } finally {
      setDeleteLoading(false)
    }
  }

  const handleModalSave = async (dataToSave: CreateCultivoData | UpdateCultivoData) => {
    setModalLoading(true)
    try {
      if (modalMode === 'create') {
        await addCultivo(dataToSave as CreateCultivoData)
      } else if (modalMode === 'edit' && selectedCultivo) {
        await updateCultivo(selectedCultivo._id, dataToSave as UpdateCultivoData)
      }
      setIsModalOpen(false)
      handleRefresh()
    } catch (error) {
      console.error('Error al guardar:', error)
    } finally {
      setModalLoading(false)
    }
  }

  const getEstadoColor = (estado: string) => {
    const colors = {
      'sembrado': 'blue',
      'en crecimiento': 'green',
      'maduro': 'yellow',
      'cosechado': 'gray',
    }
    return colors[estado as keyof typeof colors] || 'default'
  }

  const getTipoColor = (tipo: string) => {
    const colors = {
      'maiz': 'green',
      'trigo': 'yellow',
      'soja': 'blue',
      'arroz': 'purple',
      'tomate': 'red',
      'papa': 'brown',
      'cebolla': 'gray',
      'zanahoria': 'orange',
      'lechuga': 'lime',
      'otro': 'default',
    }
    return colors[tipo as keyof typeof colors] || 'default'
  }

  const columns = useMemo(() => [
    {
      key: 'nombre',
      title: 'Nombre',
      dataIndex: 'nombre',
      render: (nombre: string) => (
        <span className="font-medium text-gray-900">{nombre}</span>
      )
    },
    {
      key: 'tipo',
      title: 'Tipo',
      dataIndex: 'tipo',
      render: (tipo: string) => (
        <Badge 
          variant={getTipoColor(tipo) as any}
          size="sm"
        >
          {tipo.charAt(0).toUpperCase() + tipo.slice(1)}
        </Badge>
      )
    },
    {
      key: 'area',
      title: 'Área (ha)',
      dataIndex: 'area',
      render: (area: number) => (
        <span className="text-sm text-gray-600">{area.toFixed(2)}</span>
      )
    },
    {
      key: 'estado',
      title: 'Estado',
      dataIndex: 'estado',
      render: (estado: string) => (
        <Badge 
          variant={getEstadoColor(estado) as any}
          size="sm"
        >
          {estado.charAt(0).toUpperCase() + estado.slice(1)}
        </Badge>
      )
    },
    {
      key: 'fechaSiembra',
      title: 'Fecha Siembra',
      dataIndex: 'fechaSiembra',
      render: (fecha: string) => format(new Date(fecha), 'dd/MM/yyyy')
    },
    {
      key: 'fechaCosecha',
      title: 'Fecha Cosecha',
      dataIndex: 'fechaCosecha',
      render: (fecha: string) => fecha ? format(new Date(fecha), 'dd/MM/yyyy') : 'N/A'
    },
  ], [])

  if (loading && data.length === 0) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Cargando cultivos...</p>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between animate-fade-in">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2 animate-slide-up">
              🌱 Gestión de Cultivos
            </h1>
            <p className="text-gray-600 animate-fade-in" style={{ animationDelay: '100ms' }}>
              Administra tus cultivos y cosechas
            </p>
          </div>
          <Button
            onClick={handleCreateCultivo}
            variant="primary"
            size="lg"
            className="flex items-center space-x-2 animate-bounce-in"
            style={{ animationDelay: '200ms' }}
          >
            <PlusIcon className="h-5 w-5" />
            <span>Agregar Cultivo</span>
          </Button>
        </div>

        {/* Estadísticas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="animate-fade-in" style={{ animationDelay: '300ms' }}>
            <StatsCard
              title="Total Cultivos"
              value={loadingStats ? '...' : stats.total.toString()}
              icon={<SunIcon className="w-6 h-6" />}
              animate={true}
            />
          </div>
          
          <div className="animate-fade-in" style={{ animationDelay: '400ms' }}>
            <StatsCard
              title="Área Total"
              value={loadingStats ? '...' : `${stats.totalArea.toFixed(2)} ha`}
              icon={<ChartBarIcon className="w-6 h-6" />}
              animate={true}
            />
          </div>
          
          <div className="animate-fade-in" style={{ animationDelay: '500ms' }}>
            <StatsCard
              title="En Crecimiento"
              value={loadingStats ? '...' : (stats.porEstado['en crecimiento'] || 0).toString()}
              icon={<BeakerIcon className="w-6 h-6" />}
              animate={true}
            />
          </div>
          
          <div className="animate-fade-in" style={{ animationDelay: '600ms' }}>
            <StatsCard
              title="Cosechados"
              value={loadingStats ? '...' : (stats.porEstado['cosechado'] || 0).toString()}
              icon={<CalendarDaysIcon className="w-6 h-6" />}
              animate={true}
            />
          </div>
        </div>

        {/* Filtros */}
        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200 animate-fade-in" style={{ animationDelay: '700ms' }}>
          <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <FunnelIcon className="h-5 w-5" />
            Filtros
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <Input
              label="Buscar"
              placeholder="Nombre, tipo o variedad..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              icon={<MagnifyingGlassIcon className="h-4 w-4" />}
            />
            
            <CustomSelect
              label="Tipo"
              value={filterTipo}
              onChange={setFilterTipo}
              options={tiposCultivo}
              placeholder="Todos los tipos"
              icon={<ChartBarIcon className="h-4 w-4" />}
            />
            
            <CustomSelect
              label="Estado"
              value={filterEstado}
              onChange={setFilterEstado}
              options={estadosCultivo}
              placeholder="Todos los estados"
              icon={<BeakerIcon className="h-4 w-4" />}
            />
            
            <DatePicker
              label="Fecha Desde"
              value={filterStartDate}
              onChange={setFilterStartDate}
              icon={<CalendarDaysIcon className="h-4 w-4" />}
            />
            
            <DatePicker
              label="Fecha Hasta"
              value={filterEndDate}
              onChange={setFilterEndDate}
              icon={<CalendarDaysIcon className="h-4 w-4" />}
            />
          </div>
          
          <div className="flex justify-end mt-4">
            <Button
              onClick={handleRefresh}
              variant="secondary"
              className="flex items-center space-x-2"
              disabled={loading}
            >
              <FunnelIcon className="h-5 w-5" />
              <span>Aplicar Filtros</span>
            </Button>
          </div>
        </div>

        {/* Tabla */}
        <div className="animate-fade-in" style={{ animationDelay: '800ms' }}>
          <EnhancedTable
            columns={columns}
            data={filteredData}
            loading={loading}
            exportFilename="cultivos"
            exportTitle="Reporte de Cultivos"
            onRefresh={handleRefresh}
            onEdit={handleEditCultivo}
            onDelete={handleDeleteCultivo}
            pagination={{
              current: currentPage,
              pageSize: pageSize,
              total: total,
              onChange: setCurrentPage,
              onPageSizeChange: setPageSize,
            }}
          />
        </div>

        {/* Modal de Cultivo */}
        <CultivoModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSave={handleModalSave}
          cultivo={selectedCultivo}
          mode={modalMode}
          loading={modalLoading}
        />

        {/* Modal de Confirmación */}
        <ConfirmModal
          isOpen={isConfirmModalOpen}
          onClose={() => {
            setIsConfirmModalOpen(false)
            setCultivoToDelete(null)
          }}
          onConfirm={confirmDelete}
          title="Eliminar Cultivo"
          message={`¿Estás seguro de que quieres eliminar el cultivo "${cultivoToDelete?.nombre}"? Esta acción no se puede deshacer.`}
          confirmText="Eliminar"
          cancelText="Cancelar"
          loading={deleteLoading}
          variant="danger"
        />
      </div>
    </DashboardLayout>
  )
}

export default function CultivosPage() {
  return (
    <ProtectedRoute>
      <CultivosContent />
    </ProtectedRoute>
  )
}
