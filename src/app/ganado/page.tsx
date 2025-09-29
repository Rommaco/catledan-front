'use client'
import React, { useState, useMemo } from 'react'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { CustomSelect } from '@/components/ui/CustomSelect'
import { EnhancedTable } from '@/components/ui/EnhancedTable'
import { Badge } from '@/components/ui/Badge'
import { StatsCard } from '@/components/ui/StatsCard'
import { GanadoModal } from '@/components/ganado/GanadoModal'
import { ConfirmModal } from '@/components/ui/ConfirmModal'
import { useGanado } from '@/hooks/ganado/useGanado'
import { useToast } from '@/hooks/useToast'
import { Ganado, CreateGanadoData, UpdateGanadoData } from '@/types/ganado'
import { 
  PlusIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  UserGroupIcon,
  TagIcon,
  BeakerIcon,
  CalendarDaysIcon,
  ScaleIcon
} from '@heroicons/react/24/outline'

function GanadoContent() {
  const { toast } = useToast()
  const { 
    loading, 
    error, 
    data, 
    total,
    currentPage,
    pageSize,
    createGanado,
    updateGanado,
    deleteGanado,
    refresh,
    setCurrentPage,
    setPageSize,
    fetchGanado
  } = useGanado()


  // Estados del modal
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create')
  const [selectedGanado, setSelectedGanado] = useState<Ganado | null>(null)
  const [modalLoading, setModalLoading] = useState(false)

  // Estados para modal de confirmación
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false)
  const [ganadoToDelete, setGanadoToDelete] = useState<Ganado | null>(null)
  const [deleteLoading, setDeleteLoading] = useState(false)

  // Estados de filtros
  const [searchText, setSearchText] = useState('')
  const [filterCategoria, setFilterCategoria] = useState('')
  const [filterEstado, setFilterEstado] = useState('')
  const [filterSexo, setFilterSexo] = useState('')
  const [filterReproductivo, setFilterReproductivo] = useState('')

  // Aplicar filtros
  const filteredData = useMemo(() => {
    if (!data || !Array.isArray(data)) {
      return []
    }
    
    return data.filter(ganado => {
      const matchesSearch = 
        ganado.nombre.toLowerCase().includes(searchText.toLowerCase()) ||
        ganado.numeroIdentificacion.toLowerCase().includes(searchText.toLowerCase()) ||
        ganado.raza.toLowerCase().includes(searchText.toLowerCase())
      
      const matchesCategoria = !filterCategoria || ganado.categoria === filterCategoria
      const matchesEstado = !filterEstado || ganado.estado === filterEstado
      const matchesSexo = !filterSexo || ganado.sexo === filterSexo
      const matchesReproductivo = !filterReproductivo || ganado.estadoReproductivo === filterReproductivo

      return matchesSearch && matchesCategoria && matchesEstado && matchesSexo && matchesReproductivo
    })
  }, [data, searchText, filterCategoria, filterEstado, filterSexo, filterReproductivo])

  // Datos seguros para las estadísticas
  const safeData = data || []

  const handleCreateGanado = () => {
    setSelectedGanado(null)
    setModalMode('create')
    setIsModalOpen(true)
  }

  const handleEditGanado = (ganado: Ganado) => {
    setSelectedGanado(ganado)
    setModalMode('edit')
    setIsModalOpen(true)
  }

  const handleDeleteGanado = (ganado: Ganado) => {
    setGanadoToDelete(ganado)
    setIsConfirmModalOpen(true)
  }

  const confirmDelete = async () => {
    if (!ganadoToDelete) return

    try {
      setDeleteLoading(true)
      await deleteGanado(ganadoToDelete._id)
      toast({
        type: 'success',
        title: 'Ganado eliminado',
        message: `${ganadoToDelete.nombre} ha sido eliminado correctamente.`
      })
      handleRefresh()
      setIsConfirmModalOpen(false)
      setGanadoToDelete(null)
    } catch (error) {
      toast({
        type: 'error',
        title: 'Error al eliminar',
        message: 'No se pudo eliminar el ganado. Inténtalo de nuevo.'
      })
    } finally {
      setDeleteLoading(false)
    }
  }

  const handleModalSave = async (formData: CreateGanadoData | UpdateGanadoData) => {
    setModalLoading(true)
    try {
      if (modalMode === 'create') {
        await createGanado(formData as CreateGanadoData)
        toast({
          type: 'success',
          title: 'Ganado agregado',
          message: 'El ganado ha sido agregado correctamente.'
        })
      } else {
        await updateGanado(selectedGanado!._id, formData as UpdateGanadoData)
        toast({
          type: 'success',
          title: 'Ganado actualizado',
          message: 'El ganado ha sido actualizado correctamente.'
        })
      }
    } catch (error) {
      toast({
        type: 'error',
        title: 'Error al guardar',
        message: 'No se pudo guardar el ganado. Inténtalo de nuevo.'
      })
      throw error // Re-lanzar para que el modal no se cierre
    } finally {
      setModalLoading(false)
    }
  }

  const handleRefresh = () => {
    refresh()
    toast({
      type: 'info',
      title: 'Datos actualizados',
      message: 'La información del ganado se ha actualizado.'
    })
  }

  const handleExport = (format: 'pdf' | 'excel') => {
    toast({
      type: 'info',
      title: 'Exportando...',
      message: `Exportando datos en formato ${format.toUpperCase()}...`
    })
    // Aquí implementarías la lógica de exportación
  }

  // Configuración de columnas para la tabla
  const columns = [
    {
      key: 'numeroIdentificacion',
      title: 'ID',
      dataIndex: 'numeroIdentificacion',
      width: 100,
      render: (text: string) => (
        <span className="font-mono text-sm text-gray-600">{text}</span>
      )
    },
    {
      key: 'nombre',
      title: 'Nombre',
      dataIndex: 'nombre',
      width: 150,
      render: (text: string, record: Ganado) => (
        <div className="flex items-center">
          <UserGroupIcon className="h-4 w-4 text-green-600 mr-2" />
          <span className="font-medium">{text}</span>
        </div>
      )
    },
    {
      key: 'categoria',
      title: 'Categoría',
      dataIndex: 'categoria',
      width: 120,
      render: (categoria: string) => {
        const colors = {
          vaca: 'green',
          toro: 'purple',
          ternero: 'blue',
          vaquilla: 'orange',
          novillo: 'red'
        }
        return (
          <Badge 
            variant={colors[categoria as keyof typeof colors] as any || 'default'}
            size="sm"
          >
            {categoria.charAt(0).toUpperCase() + categoria.slice(1)}
          </Badge>
        )
      }
    },
    {
      key: 'sexo',
      title: 'Sexo',
      dataIndex: 'sexo',
      width: 80,
      render: (sexo: string) => (
        <Badge 
          variant={sexo === 'hembra' ? 'success' : 'warning'}
          size="sm"
        >
          {sexo.charAt(0).toUpperCase() + sexo.slice(1)}
        </Badge>
      )
    },
    {
      key: 'estadoReproductivo',
      title: 'Estado Reproductivo',
      dataIndex: 'estadoReproductivo',
      width: 140,
      render: (estado: string, record: Ganado) => {
        if (record.sexo === 'macho') {
          return <span className="text-gray-400 italic">N/A</span>
        }
        
        const colors = {
          vacia: 'error',
          preñada: 'success',
          lactando: 'primary',
          seca: 'warning'
        }
        
        return (
          <Badge 
            variant={colors[estado as keyof typeof colors] as any || 'default'}
            size="sm"
          >
            {estado ? estado.charAt(0).toUpperCase() + estado.slice(1) : '-'}
          </Badge>
        )
      }
    },
    {
      key: 'peso',
      title: 'Peso (kg)',
      dataIndex: 'peso',
      width: 100,
      render: (peso: number) => (
        <div className="flex items-center">
          <ScaleIcon className="h-4 w-4 text-gray-400 mr-1" />
          <span>{peso}</span>
        </div>
      )
    },
    {
      key: 'edad',
      title: 'Edad',
      dataIndex: 'edad',
      width: 80,
      render: (edad: number) => (
        <div className="flex items-center">
          <CalendarDaysIcon className="h-4 w-4 text-gray-400 mr-1" />
          <span>{edad}a</span>
        </div>
      )
    },
    {
      key: 'estado',
      title: 'Estado',
      dataIndex: 'estado',
      width: 100,
      render: (estado: string) => {
        const colors = {
          'Activo': 'success',
          'Inactivo': 'warning',
          'Vendido': 'info',
          'Fallecido': 'error'
        }
        return (
          <Badge 
            variant={colors[estado as keyof typeof colors] as any || 'default'}
            size="sm"
          >
            {estado}
          </Badge>
        )
      }
    },
    {
      key: 'fechaIngreso',
      title: 'Fecha Ingreso',
      dataIndex: 'fechaIngreso',
      width: 120,
      render: (fecha: string) => (
        <span className="text-sm text-gray-600">
          {new Date(fecha).toLocaleDateString()}
        </span>
      )
    }
  ]

  // Opciones para los filtros
  const categoriaOptions = [
    { value: 'vaca', label: 'Vaca', icon: <TagIcon className="h-4 w-4" /> },
    { value: 'toro', label: 'Toro', icon: <TagIcon className="h-4 w-4" /> },
    { value: 'ternero', label: 'Ternero', icon: <TagIcon className="h-4 w-4" /> },
    { value: 'vaquilla', label: 'Vaquilla', icon: <TagIcon className="h-4 w-4" /> },
    { value: 'novillo', label: 'Novillo', icon: <TagIcon className="h-4 w-4" /> }
  ]

  const estadoOptions = [
    { value: 'Activo', label: 'Activo', icon: <TagIcon className="h-4 w-4" /> },
    { value: 'Inactivo', label: 'Inactivo', icon: <TagIcon className="h-4 w-4" /> },
    { value: 'Vendido', label: 'Vendido', icon: <TagIcon className="h-4 w-4" /> },
    { value: 'Fallecido', label: 'Fallecido', icon: <TagIcon className="h-4 w-4" /> }
  ]

  const sexoOptions = [
    { value: 'hembra', label: 'Hembra', icon: <UserGroupIcon className="h-4 w-4" /> },
    { value: 'macho', label: 'Macho', icon: <UserGroupIcon className="h-4 w-4" /> }
  ]

  const estadoReproductivoOptions = [
    { value: 'vacia', label: 'Vacía', icon: <BeakerIcon className="h-4 w-4" /> },
    { value: 'preñada', label: 'Preñada', icon: <BeakerIcon className="h-4 w-4" /> },
    { value: 'lactando', label: 'Lactando', icon: <BeakerIcon className="h-4 w-4" /> },
    { value: 'seca', label: 'Seca', icon: <BeakerIcon className="h-4 w-4" /> }
  ]

  if (error) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <p className="text-red-600 mb-4">Error al cargar el ganado</p>
            <p className="text-sm text-gray-500 mb-4">Error: {error}</p>
            <Button onClick={handleRefresh} variant="primary">
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
        {/* Header */}
        <div className="flex items-center justify-between animate-fade-in">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2 animate-slide-up">
              🐄 Gestión de Ganado
            </h1>
            <p className="text-gray-600 animate-slide-up" style={{ animationDelay: '100ms' }}>
              Administra tu inventario ganadero
            </p>
          </div>
          
          <Button
            onClick={handleCreateGanado}
            variant="primary"
            icon={<PlusIcon className="w-4 h-4" />}
            className="animate-bounce-in"
            style={{ animationDelay: '200ms' }}
          >
            Agregar Ganado
          </Button>
        </div>

        {/* Estadísticas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="animate-fade-in" style={{ animationDelay: '300ms' }}>
            <StatsCard
              title="Total Ganado"
              value={safeData.length.toString()}
              icon={<UserGroupIcon className="w-6 h-6" />}
              animate={true}
            />
          </div>
          
          <div className="animate-fade-in" style={{ animationDelay: '400ms' }}>
            <StatsCard
              title="Vacas"
              value={safeData.filter(g => g.categoria === 'vaca').length.toString()}
              icon={<TagIcon className="w-6 h-6" />}
              animate={true}
            />
          </div>
          
          <div className="animate-fade-in" style={{ animationDelay: '500ms' }}>
            <StatsCard
              title="Toros"
              value={safeData.filter(g => g.categoria === 'toro').length.toString()}
              icon={<TagIcon className="w-6 h-6" />}
              animate={true}
            />
          </div>
          
          <div className="animate-fade-in" style={{ animationDelay: '600ms' }}>
            <StatsCard
              title="Terneros"
              value={safeData.filter(g => g.categoria === 'ternero').length.toString()}
              icon={<TagIcon className="w-6 h-6" />}
              animate={true}
            />
          </div>
        </div>

        {/* Filtros */}
        <div className="bg-white p-4 rounded-lg border border-gray-200 animate-fade-in" style={{ animationDelay: '700ms' }}>
          <div className="flex items-center mb-4">
            <FunnelIcon className="h-5 w-5 text-gray-600 mr-2" />
            <h3 className="text-lg font-semibold text-gray-900">Filtros</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
            <Input
              label="Buscar"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              placeholder="Nombre, ID o raza..."
              icon={<MagnifyingGlassIcon className="h-4 w-4" />}
            />
            
            <CustomSelect
              label="Categoría"
              value={filterCategoria}
              onChange={setFilterCategoria}
              options={categoriaOptions}
              placeholder="Todas las categorías"
            />
            
            <CustomSelect
              label="Estado"
              value={filterEstado}
              onChange={setFilterEstado}
              options={estadoOptions}
              placeholder="Todos los estados"
            />
            
            <CustomSelect
              label="Sexo"
              value={filterSexo}
              onChange={setFilterSexo}
              options={sexoOptions}
              placeholder="Todos los sexos"
            />
            
            <CustomSelect
              label="Estado Reproductivo"
              value={filterReproductivo}
              onChange={setFilterReproductivo}
              options={estadoReproductivoOptions}
              placeholder="Todos los estados"
            />
            
            <div className="flex items-end">
              <Button
                variant="ghost"
                onClick={() => {
                  setSearchText('')
                  setFilterCategoria('')
                  setFilterEstado('')
                  setFilterSexo('')
                  setFilterReproductivo('')
                }}
                className="w-full"
              >
                Limpiar Filtros
              </Button>
            </div>
          </div>
        </div>

        {/* Tabla */}
        <div className="animate-fade-in" style={{ animationDelay: '800ms' }}>
          <EnhancedTable
            columns={columns}
            data={filteredData}
            loading={loading}
            exportFilename="ganado"
            exportTitle="Reporte de Ganado"
            onRefresh={handleRefresh}
            onEdit={handleEditGanado}
            onDelete={handleDeleteGanado}
            pagination={{
              current: currentPage,
              pageSize: pageSize,
              total: filteredData.length,
              onChange: setCurrentPage,
              onPageSizeChange: setPageSize
            }}
          />
        </div>

        {/* Modal de Ganado */}
        <GanadoModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSave={handleModalSave}
          ganado={selectedGanado}
          mode={modalMode}
          loading={modalLoading}
        />

        {/* Modal de Confirmación */}
        <ConfirmModal
          isOpen={isConfirmModalOpen}
          onClose={() => {
            setIsConfirmModalOpen(false)
            setGanadoToDelete(null)
          }}
          onConfirm={confirmDelete}
          title="Eliminar Ganado"
          message={`¿Estás seguro de que quieres eliminar ${ganadoToDelete?.nombre}? Esta acción no se puede deshacer.`}
          confirmText="Eliminar"
          cancelText="Cancelar"
          loading={deleteLoading}
          variant="danger"
        />
      </div>
    </DashboardLayout>
  )
}

export default function GanadoPage() {
  return (
    <ProtectedRoute>
      <GanadoContent />
    </ProtectedRoute>
  )
}
