'use client'
import React, { useState, useMemo, useEffect } from 'react'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { CustomSelect } from '@/components/ui/CustomSelect'
import { EnhancedTable } from '@/components/ui/EnhancedTable'
import { Badge } from '@/components/ui/Badge'
import { StatsCard } from '@/components/ui/StatsCard'
import { GanadoModal } from '@/components/ganado/GanadoModal'
import { ModalVacuna } from '@/components/ganado/ModalVacuna'
import { ModalTratamiento } from '@/components/ganado/ModalTratamiento'
import { ModalMovimiento } from '@/components/ganado/ModalMovimiento'
import { ConfirmModal } from '@/components/ui/ConfirmModal'
import { useGanado } from '@/hooks/ganado/useGanado'
import { useToast } from '@/hooks/useToast'
import { Ganado, CreateGanadoData, UpdateGanadoData } from '@/types/ganado'
import { 
  PlusIcon,
  UserGroupIcon,
  TagIcon,
  BeakerIcon,
  CalendarDaysIcon,
  ScaleIcon,
  QrCodeIcon,
  ShieldCheckIcon,
  ArrowPathIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline'
import { ganadoService } from '@/lib/ganado/ganadoService'

const LABELS: Record<string, string> = {
  id: 'ID',
  _id: 'ID',
  fecha: 'Fecha',
  tipo: 'Tipo',
  nombre: 'Nombre',
  numeroIdentificacion: 'Nº identificación',
  lote: 'Lote',
  observaciones: 'Observaciones',
  producto: 'Producto',
  dosis: 'Dosis',
  origen: 'Origen',
  destino: 'Destino',
  raza: 'Raza',
  categoria: 'Categoría',
  estado: 'Estado',
  ganado: 'Datos del animal',
  createdAt: 'Fecha de registro',
  updatedAt: 'Última actualización',
}

function formatCellValue(value: unknown): string {
  if (value == null) return '—'
  if (typeof value === 'string') {
    if (value.length > 80 && value.startsWith('data:')) return '[Imagen]'
    if (/^\d{4}-\d{2}-\d{2}/.test(value)) {
      try {
        const d = new Date(value)
        if (!Number.isNaN(d.getTime())) return d.toLocaleDateString('es-MX', { dateStyle: 'medium' })
      } catch (_) {}
    }
    return value
  }
  if (typeof value === 'number') return String(value)
  if (typeof value === 'boolean') return value ? 'Sí' : 'No'
  if (Array.isArray(value)) return value.length ? `${value.length} elemento(s)` : '—'
  if (typeof value === 'object') return Object.keys(value).length ? '[Ver detalles]' : '—'
  return String(value)
}

function objectToRows(
  obj: Record<string, unknown>,
  skipKeys: Set<string> = new Set(['qr']),
  prefix = ''
): { label: string; value: string }[] {
  const rows: { label: string; value: string }[] = []
  for (const key of Object.keys(obj)) {
    if (skipKeys.has(key)) continue
    const value = obj[key]
    if (value == null) continue
    const label = LABELS[key] || key.replace(/([A-Z])/g, ' $1').replace(/^./, (s) => s.toUpperCase()).trim()
    const fullLabel = prefix ? `${prefix} › ${label}` : label
    if (typeof value === 'object' && !Array.isArray(value) && value !== null && !(value instanceof Date)) {
      const nested = value as Record<string, unknown>
      if (key === 'ganado' || (typeof nested.nombre === 'string' || typeof nested.numeroIdentificacion === 'string')) {
        rows.push(...objectToRows(nested, new Set(), fullLabel))
      } else {
        rows.push({ label: fullLabel, value: formatCellValue(value) })
      }
    } else {
      rows.push({ label: fullLabel, value: formatCellValue(value) })
    }
  }
  return rows
}

function ResultDataTable({ data }: { data: unknown }) {
  if (data == null || typeof data !== 'object' || Array.isArray(data)) return null
  const obj = data as Record<string, unknown>
  const rows = objectToRows(obj)
  if (rows.length === 0) return null
  return (
    <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
      <table className="min-w-full divide-y divide-gray-200 text-sm">
        <tbody className="divide-y divide-gray-100">
          {rows.map((row, i) => (
            <tr key={i} className="bg-white hover:bg-gray-50/50">
              <td className="py-2.5 pl-4 pr-3 font-medium text-gray-600 whitespace-nowrap w-1/3">{row.label}</td>
              <td className="py-2.5 pl-3 pr-4 text-gray-900">{row.value}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

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
    fetchGanado,
    fetchByIdOrSearch
  } = useGanado()

  const [searchIdOrCode, setSearchIdOrCode] = useState('')
  const [searchGeneral, setSearchGeneral] = useState('')

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create')
  const [selectedGanado, setSelectedGanado] = useState<Ganado | null>(null)
  const [modalLoading, setModalLoading] = useState(false)
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false)
  const [ganadoToDelete, setGanadoToDelete] = useState<Ganado | null>(null)
  const [deleteLoading, setDeleteLoading] = useState(false)

  type TabId = 'inventario' | 'sanidad' | 'trazabilidad' | 'movimientos'
  const [activeTab, setActiveTab] = useState<TabId>('inventario')
  const [selectedGanadoId, setSelectedGanadoId] = useState<string>('')
  const [tabLoading, setTabLoading] = useState(false)
  const [tabResult, setTabResult] = useState<unknown>(null)
  const [showTechnicalDetails, setShowTechnicalDetails] = useState(false)
  const [isVacunaModalOpen, setIsVacunaModalOpen] = useState(false)
  const [isTratamientoModalOpen, setIsTratamientoModalOpen] = useState(false)
  const [isMovimientoModalOpen, setIsMovimientoModalOpen] = useState(false)
  const [expedienteData, setExpedienteData] = useState<{ vacunas: Array<{ id: string; fecha: string; tipo: string; descripcion?: string; detalle?: Record<string, unknown> }>; tratamientos: Array<{ id: string; fecha: string; tipo: string; descripcion?: string; detalle?: Record<string, unknown> }> } | null>(null)
  const [expedienteLoading, setExpedienteLoading] = useState(false)
  const [movimientosData, setMovimientosData] = useState<Array<{ id: string; fecha: string; tipo: string; descripcion?: string; detalle?: Record<string, unknown> }>>([])
  const [movimientosLoading, setMovimientosLoading] = useState(false)

  const safeData = Array.isArray(data) ? data : []

  useEffect(() => {
    if (!selectedGanadoId || activeTab !== 'sanidad') {
      setExpedienteData(null)
      return
    }
    let cancelled = false
    setExpedienteLoading(true)
    ganadoService.getExpediente(selectedGanadoId).then((res: unknown) => {
      if (cancelled) return
      const d = res as { vacunas?: unknown[]; tratamientos?: unknown[] }
      setExpedienteData({
        vacunas: Array.isArray(d.vacunas) ? d.vacunas as Array<{ id: string; fecha: string; tipo: string; descripcion?: string; detalle?: Record<string, unknown> }> : [],
        tratamientos: Array.isArray(d.tratamientos) ? d.tratamientos as Array<{ id: string; fecha: string; tipo: string; descripcion?: string; detalle?: Record<string, unknown> }> : [],
      })
    }).catch(() => {
      if (!cancelled) setExpedienteData(null)
    }).finally(() => {
      if (!cancelled) setExpedienteLoading(false)
    })
    return () => { cancelled = true }
  }, [selectedGanadoId, activeTab])

  useEffect(() => {
    if (!selectedGanadoId || activeTab !== 'movimientos') {
      setMovimientosData([])
      return
    }
    let cancelled = false
    setMovimientosLoading(true)
    ganadoService.getTrazabilidad(selectedGanadoId).then((res: unknown) => {
      if (cancelled) return
      const d = res as { movimientos?: unknown[] }
      setMovimientosData(Array.isArray(d.movimientos) ? d.movimientos as Array<{ id: string; fecha: string; tipo: string; descripcion?: string; detalle?: Record<string, unknown> }> : [])
    }).catch(() => {
      if (!cancelled) setMovimientosData([])
    }).finally(() => {
      if (!cancelled) setMovimientosLoading(false)
    })
    return () => { cancelled = true }
  }, [selectedGanadoId, activeTab])

  const loadExpediente = () => {
    if (!selectedGanadoId) return
    setExpedienteLoading(true)
    ganadoService.getExpediente(selectedGanadoId).then((res: unknown) => {
      const d = res as { vacunas?: unknown[]; tratamientos?: unknown[] }
      setExpedienteData({
        vacunas: Array.isArray(d.vacunas) ? d.vacunas as Array<{ id: string; fecha: string; tipo: string; descripcion?: string; detalle?: Record<string, unknown> }> : [],
        tratamientos: Array.isArray(d.tratamientos) ? d.tratamientos as Array<{ id: string; fecha: string; tipo: string; descripcion?: string; detalle?: Record<string, unknown> }> : [],
      })
    }).catch(() => setExpedienteData(null)).finally(() => setExpedienteLoading(false))
  }

  const loadMovimientos = () => {
    if (!selectedGanadoId) return
    setMovimientosLoading(true)
    ganadoService.getTrazabilidad(selectedGanadoId).then((res: unknown) => {
      const d = res as { movimientos?: unknown[] }
      setMovimientosData(Array.isArray(d.movimientos) ? d.movimientos as Array<{ id: string; fecha: string; tipo: string; descripcion?: string; detalle?: Record<string, unknown> }> : [])
    }).catch(() => setMovimientosData([])).finally(() => setMovimientosLoading(false))
  }

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
      const id = (ganadoToDelete as Ganado & { id?: string }).id ?? ganadoToDelete._id
      await deleteGanado(id)
      toast({
        type: 'success',
        title: 'Ganado eliminado',
        message: `${ganadoToDelete.nombre} ha sido eliminado correctamente.`
      })
      handleRefresh()
      setIsConfirmModalOpen(false)
      setGanadoToDelete(null)
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'No se pudo eliminar el ganado.'
      const is404 = msg.includes('404')
      toast({
        type: 'error',
        title: 'Error al eliminar',
        message: is404 ? 'Ganado no encontrado o ya fue eliminado. Actualizando lista.' : msg
      })
      if (is404) handleRefresh()
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
        await updateGanado((selectedGanado as Ganado & { id?: string }).id ?? selectedGanado!._id, formData as UpdateGanadoData)
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
            variant="ganado"
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
      render: (value: unknown) => {
        const sexo = value as string
        return (
          <Badge 
            variant={sexo === 'hembra' ? 'success' : 'warning'}
            size="sm"
          >
            {sexo.charAt(0).toUpperCase() + sexo.slice(1)}
          </Badge>
        )
      }
    },
    {
      key: 'estadoReproductivo',
      title: 'Estado Reproductivo',
      dataIndex: 'estadoReproductivo',
      width: 140,
      render: (value: unknown, record: Ganado) => {
        const estado = value as string
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
            variant={estado === 'preñada' ? 'success' : estado === 'lactando' ? 'info' : 'default'}
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
            variant={estado === 'Activo' ? 'success' : estado === 'Inactivo' ? 'warning' : estado === 'Vendido' ? 'info' : 'error'}
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

  const tabs: { id: TabId; label: string; icon: React.ReactNode }[] = [
    { id: 'inventario', label: 'Inventario', icon: <UserGroupIcon className="w-4 h-4" /> },
    { id: 'sanidad', label: 'Sanidad', icon: <ShieldCheckIcon className="w-4 h-4" /> },
    { id: 'trazabilidad', label: 'Trazabilidad', icon: <QrCodeIcon className="w-4 h-4" /> },
    { id: 'movimientos', label: 'Movimientos', icon: <ArrowPathIcon className="w-4 h-4" /> },
  ]

  const handleTabAction = async (action: () => Promise<unknown>) => {
    setTabLoading(true)
    setTabResult(null)
    setShowTechnicalDetails(false)
    try {
      const result = await action()
      setTabResult(result)
      toast({ type: 'success', title: 'Listo', message: 'Operación realizada.' })
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Error en la operación'
      toast({ type: 'error', title: 'Error', message: msg })
    } finally {
      setTabLoading(false)
    }
  }

  const handleBlockchainClick = async () => {
    if (!selectedGanadoId) return
    setTabLoading(true)
    setTabResult(null)
    try {
      const result = await ganadoService.getTrazabilidadBlockchain(selectedGanadoId)
      setTabResult(result)
      toast({ type: 'success', title: 'Listo', message: 'Trazabilidad blockchain obtenida.' })
    } catch {
      toast({ type: 'info', title: 'Próximamente', message: 'Trazabilidad blockchain disponible próximamente.' })
    } finally {
      setTabLoading(false)
    }
  }

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
      <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between animate-fade-in">
          <div className="min-w-0">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1 sm:mb-2 animate-slide-up">
              🐄 Gestión de Ganado
            </h1>
            <p className="text-sm sm:text-base text-gray-600 animate-slide-up" style={{ animationDelay: '100ms' }}>
              Administra tu inventario ganadero
            </p>
          </div>
          {activeTab === 'inventario' && (
            <Button
              onClick={handleCreateGanado}
              variant="primary"
              icon={<PlusIcon className="w-4 h-4" />}
              className="animate-bounce-in w-full sm:w-auto shrink-0"
              style={{ animationDelay: '200ms' }}
            >
              Agregar Ganado
            </Button>
          )}
        </div>

        {/* Pestañas */}
        <nav className="border-b border-gray-200">
          <div className="flex gap-1 overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${activeTab === tab.id ? 'border-green-600 text-green-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>
        </nav>

        {activeTab === 'inventario' && (
          <>
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

        {/* Búsqueda: solo por ID y general */}
        <div className="flex flex-wrap items-center gap-4 p-4 bg-white rounded-xl border border-gray-200 shadow-sm">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-medium text-gray-700">Por ID o número:</span>
            <input
              type="text"
              value={searchIdOrCode}
              onChange={(e) => setSearchIdOrCode(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && fetchByIdOrSearch(searchIdOrCode)}
              placeholder="HOL-001 o ID"
              className="w-44 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-sm"
            />
            <Button variant="primary" size="sm" onClick={() => fetchByIdOrSearch(searchIdOrCode)} disabled={loading}>
              Buscar
            </Button>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-medium text-gray-700">Búsqueda general:</span>
            <input
              type="text"
              value={searchGeneral}
              onChange={(e) => setSearchGeneral(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && fetchGanado({ search: searchGeneral.trim(), page: 1, limit: pageSize })}
              placeholder="Nombre, raza, observaciones..."
              className="w-52 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-sm"
            />
            <Button
              variant="secondary"
              size="sm"
              onClick={() => {
                setCurrentPage(1)
                fetchGanado({ search: searchGeneral.trim() || undefined, page: 1, limit: pageSize })
              }}
              disabled={loading}
            >
              Buscar
            </Button>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setSearchIdOrCode('')
              setSearchGeneral('')
              setCurrentPage(1)
              fetchGanado({ page: 1, limit: pageSize })
            }}
          >
            Ver todos
          </Button>
        </div>

        {/* Tabla (sin filtros integrados) */}
        <div className="animate-fade-in" style={{ animationDelay: '800ms' }}>
          <EnhancedTable
            columns={columns}
            data={data || []}
            loading={loading}
            exportFilename="ganado"
            exportTitle="Reporte de Ganado"
            onRefresh={handleRefresh}
            onEdit={handleEditGanado}
            onDelete={handleDeleteGanado}
            showFilters={false}
            pagination={{
              current: currentPage,
              pageSize: pageSize,
              total: total,
              onChange: (page, newPageSize) => {
                setCurrentPage(page)
                if (newPageSize !== pageSize) setPageSize(newPageSize)
              }
            }}
            customFilters={[]}
          />
        </div>
          </>
        )}

        {activeTab === 'sanidad' && (
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-gray-100">
              <h2 className="text-xl font-semibold text-gray-900">Sanidad</h2>
              <p className="text-gray-500 text-sm mt-1">Registra vacunas y tratamientos y consulta el historial del animal.</p>
            </div>
            <div className="p-6">
              <div className="flex flex-wrap items-end gap-4 mb-6">
                <div className="min-w-[220px]">
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Seleccionar animal</label>
                  <select
                    value={selectedGanadoId}
                    onChange={(e) => setSelectedGanadoId(e.target.value)}
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-gray-900 bg-white text-sm"
                  >
                    <option value="">— Elegir animal —</option>
                    {safeData.map((g) => {
                      const id = (g as Ganado & { id?: string }).id ?? g._id
                      return (
                        <option key={id} value={id}>
                          {g.nombre} ({g.numeroIdentificacion})
                        </option>
                      )
                    })}
                  </select>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant="primary"
                    size="sm"
                    disabled={!selectedGanadoId}
                    onClick={() => selectedGanadoId && setIsVacunaModalOpen(true)}
                  >
                    Registrar vacuna
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    disabled={!selectedGanadoId}
                    onClick={() => selectedGanadoId && setIsTratamientoModalOpen(true)}
                  >
                    Registrar tratamiento
                  </Button>
                </div>
              </div>
              {!selectedGanadoId ? (
                <p className="text-sm text-gray-500">Selecciona un animal para ver su historial y registrar vacunas o tratamientos.</p>
              ) : expedienteLoading ? (
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-green-500 border-t-transparent" />
                  Cargando historial…
                </div>
              ) : (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-sm font-semibold text-gray-800 mb-2">Historial de vacunas</h3>
                    <div className="overflow-hidden rounded-lg border border-gray-200">
                      <table className="min-w-full divide-y divide-gray-200 text-sm">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-4 py-2.5 text-left font-medium text-gray-700">Fecha</th>
                            <th className="px-4 py-2.5 text-left font-medium text-gray-700">Tipo</th>
                            <th className="px-4 py-2.5 text-left font-medium text-gray-700">Lote / Detalle</th>
                            <th className="px-4 py-2.5 text-left font-medium text-gray-700">Observaciones</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 bg-white">
                          {expedienteData?.vacunas?.length ? expedienteData.vacunas.map((v) => (
                            <tr key={v.id}>
                              <td className="px-4 py-2.5 text-gray-900">{v.fecha ? new Date(v.fecha).toLocaleDateString('es-MX', { dateStyle: 'medium' }) : '—'}</td>
                              <td className="px-4 py-2.5 text-gray-900">{v.tipo || '—'}</td>
                              <td className="px-4 py-2.5 text-gray-600">{v.detalle?.lote ? String(v.detalle.lote) : v.descripcion || '—'}</td>
                              <td className="px-4 py-2.5 text-gray-600">{v.detalle?.observaciones ? String(v.detalle.observaciones) : '—'}</td>
                            </tr>
                          )) : (
                            <tr><td colSpan={4} className="px-4 py-4 text-center text-gray-500">Sin registros de vacunas.</td></tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-gray-800 mb-2">Historial de tratamientos</h3>
                    <div className="overflow-hidden rounded-lg border border-gray-200">
                      <table className="min-w-full divide-y divide-gray-200 text-sm">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-4 py-2.5 text-left font-medium text-gray-700">Fecha</th>
                            <th className="px-4 py-2.5 text-left font-medium text-gray-700">Tipo</th>
                            <th className="px-4 py-2.5 text-left font-medium text-gray-700">Producto / Dosis</th>
                            <th className="px-4 py-2.5 text-left font-medium text-gray-700">Observaciones</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 bg-white">
                          {expedienteData?.tratamientos?.length ? expedienteData.tratamientos.map((t) => (
                            <tr key={t.id}>
                              <td className="px-4 py-2.5 text-gray-900">{t.fecha ? new Date(t.fecha).toLocaleDateString('es-MX', { dateStyle: 'medium' }) : '—'}</td>
                              <td className="px-4 py-2.5 text-gray-900">{t.tipo || '—'}</td>
                              <td className="px-4 py-2.5 text-gray-600">{t.descripcion || (t.detalle?.producto ? `${t.detalle.producto}${t.detalle.dosis ? ` — ${t.detalle.dosis}` : ''}` : '—')}</td>
                              <td className="px-4 py-2.5 text-gray-600">{t.detalle?.observaciones ? String(t.detalle.observaciones) : '—'}</td>
                            </tr>
                          )) : (
                            <tr><td colSpan={4} className="px-4 py-4 text-center text-gray-500">Sin registros de tratamientos.</td></tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        <ModalVacuna
          isOpen={isVacunaModalOpen}
          onClose={() => setIsVacunaModalOpen(false)}
          ganadoId={selectedGanadoId}
          onSuccess={() => { loadExpediente(); toast({ type: 'success', title: 'Vacuna registrada', message: 'El registro se guardó correctamente.' }) }}
        />
        <ModalTratamiento
          isOpen={isTratamientoModalOpen}
          onClose={() => setIsTratamientoModalOpen(false)}
          ganadoId={selectedGanadoId}
          onSuccess={() => { loadExpediente(); toast({ type: 'success', title: 'Tratamiento registrado', message: 'El registro se guardó correctamente.' }) }}
        />

        {activeTab === 'trazabilidad' && (
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-gray-100">
              <h2 className="text-xl font-semibold text-gray-900">Trazabilidad y QR</h2>
              <p className="text-gray-500 text-sm mt-1">Consulta el código QR y la trazabilidad del animal.</p>
            </div>
            <div className="p-6">
              <div className="flex flex-wrap items-end gap-4 mb-6">
                <div className="min-w-[220px]">
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Seleccionar animal</label>
                  <select
                    value={selectedGanadoId}
                    onChange={(e) => setSelectedGanadoId(e.target.value)}
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-gray-900 bg-white text-sm"
                  >
                    <option value="">— Elegir animal —</option>
                    {safeData.map((g) => {
                      const id = (g as Ganado & { id?: string }).id ?? g._id
                      return (
                        <option key={id} value={id}>
                          {g.nombre} ({g.numeroIdentificacion})
                        </option>
                      )
                    })}
                  </select>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant="primary"
                    size="sm"
                    disabled={!selectedGanadoId || tabLoading}
                    onClick={() => selectedGanadoId && handleTabAction(() => ganadoService.getQr(selectedGanadoId))}
                  >
                    Ver QR
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    disabled={!selectedGanadoId || tabLoading}
                    title={!selectedGanadoId ? 'Selecciona un animal' : undefined}
                    onClick={() => selectedGanadoId && handleTabAction(() => ganadoService.getTrazabilidad(selectedGanadoId))}
                  >
                    Ver trazabilidad
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    disabled={!selectedGanadoId || tabLoading}
                    title={!selectedGanadoId ? 'Selecciona un animal' : 'Trazabilidad blockchain'}
                    onClick={handleBlockchainClick}
                  >
                    Trazabilidad blockchain
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    disabled={tabLoading}
                    title="Escanear código QR (disponible próximamente)"
                    onClick={() => handleTabAction(() => ganadoService.getScan())}
                  >
                    Escanear
                  </Button>
                </div>
              </div>
              {tabLoading && (
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-green-500 border-t-transparent" />
                  Cargando…
                </div>
              )}
              {!tabLoading && tabResult != null && (
                <div className="space-y-6">
                  {(tabResult as { qr?: string }).qr && (
                    <div className="flex flex-col sm:flex-row sm:items-start gap-6">
                      <div className="flex flex-col items-center p-6 rounded-xl bg-gray-50/80 border border-gray-100">
                        <p className="text-sm font-medium text-gray-600 mb-3">
                          {(tabResult as { ganado?: { nombre?: string } }).ganado?.nombre
                            ? `Código QR — ${(tabResult as { ganado: { nombre: string } }).ganado.nombre}`
                            : 'Código QR del animal'}
                        </p>
                        <img
                          src={(tabResult as { qr: string }).qr}
                          alt="Código QR del animal"
                          className="w-44 h-44 object-contain bg-white rounded-lg border border-gray-200 shadow-sm"
                        />
                        <a
                          href={(tabResult as { qr: string }).qr}
                          download="qr-ganado.png"
                          className="mt-4 inline-flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-lg shadow-sm transition-colors"
                        >
                          <QrCodeIcon className="w-4 h-4" />
                          Descargar QR
                        </a>
                      </div>
                    </div>
                  )}
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-2">Datos del registro</p>
                    <ResultDataTable data={tabResult} />
                  </div>
                  <div>
                    <button
                      type="button"
                      onClick={() => setShowTechnicalDetails((v) => !v)}
                      className="flex items-center gap-2 text-xs text-gray-500 hover:text-gray-700"
                    >
                      {showTechnicalDetails ? <ChevronUpIcon className="h-4 w-4" /> : <ChevronDownIcon className="h-4 w-4" />}
                      {showTechnicalDetails ? 'Ocultar detalles' : 'Ver detalles técnicos (JSON)'}
                    </button>
                    {showTechnicalDetails && (
                      <pre className="mt-2 p-4 bg-gray-50 rounded-lg text-xs overflow-auto max-h-48 text-gray-700 border border-gray-100 font-mono">{JSON.stringify(tabResult, null, 2)}</pre>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'movimientos' && (
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-gray-100">
              <h2 className="text-xl font-semibold text-gray-900">Movimientos</h2>
              <p className="text-gray-500 text-sm mt-1">Registra ingresos, ventas, traslados y consulta el historial del animal.</p>
            </div>
            <div className="p-6">
              <div className="flex flex-wrap items-end gap-4 mb-6">
                <div className="min-w-[220px]">
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Seleccionar animal</label>
                  <select
                    value={selectedGanadoId}
                    onChange={(e) => setSelectedGanadoId(e.target.value)}
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-gray-900 bg-white text-sm"
                  >
                    <option value="">— Elegir animal —</option>
                    {safeData.map((g) => {
                      const id = (g as Ganado & { id?: string }).id ?? g._id
                      return (
                        <option key={id} value={id}>
                          {g.nombre} ({g.numeroIdentificacion})
                        </option>
                      )
                    })}
                  </select>
                </div>
                <Button
                  variant="primary"
                  size="sm"
                  disabled={!selectedGanadoId}
                  onClick={() => selectedGanadoId && setIsMovimientoModalOpen(true)}
                >
                  Crear movimiento
                </Button>
              </div>
              {!selectedGanadoId ? (
                <p className="text-sm text-gray-500">Selecciona un animal para ver su historial de movimientos y crear nuevos.</p>
              ) : movimientosLoading ? (
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-green-500 border-t-transparent" />
                  Cargando historial…
                </div>
              ) : (
                <div>
                  <h3 className="text-sm font-semibold text-gray-800 mb-2">Historial de movimientos</h3>
                  <div className="overflow-hidden rounded-lg border border-gray-200">
                    <table className="min-w-full divide-y divide-gray-200 text-sm">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-2.5 text-left font-medium text-gray-700">Fecha</th>
                          <th className="px-4 py-2.5 text-left font-medium text-gray-700">Tipo</th>
                          <th className="px-4 py-2.5 text-left font-medium text-gray-700">Origen</th>
                          <th className="px-4 py-2.5 text-left font-medium text-gray-700">Destino</th>
                          <th className="px-4 py-2.5 text-left font-medium text-gray-700">Observaciones</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100 bg-white">
                        {movimientosData.length ? movimientosData.map((m) => (
                          <tr key={m.id}>
                            <td className="px-4 py-2.5 text-gray-900">{m.fecha ? new Date(m.fecha).toLocaleDateString('es-MX', { dateStyle: 'medium' }) : '—'}</td>
                            <td className="px-4 py-2.5 text-gray-900 capitalize">{m.tipo?.replace(/_/g, ' ') || '—'}</td>
                            <td className="px-4 py-2.5 text-gray-600">{m.detalle?.origen ? String(m.detalle.origen) : '—'}</td>
                            <td className="px-4 py-2.5 text-gray-600">{m.detalle?.destino ? String(m.detalle.destino) : '—'}</td>
                            <td className="px-4 py-2.5 text-gray-600">{m.detalle?.observaciones ? String(m.detalle.observaciones) : m.descripcion || '—'}</td>
                          </tr>
                        )) : (
                          <tr><td colSpan={5} className="px-4 py-4 text-center text-gray-500">Sin registros de movimientos.</td></tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        <ModalMovimiento
          isOpen={isMovimientoModalOpen}
          onClose={() => setIsMovimientoModalOpen(false)}
          ganadoId={selectedGanadoId}
          onSuccess={() => { loadMovimientos(); toast({ type: 'success', title: 'Movimiento creado', message: 'El registro se guardó correctamente.' }) }}
        />

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
