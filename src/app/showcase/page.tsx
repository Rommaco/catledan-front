'use client'
import React, { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { StatsCard } from '@/components/ui/StatsCard'
import { Badge } from '@/components/ui/Badge'
import { Modal } from '@/components/ui/Modal'
import { Table } from '@/components/ui/Table'
import { EnhancedTable } from '@/components/ui/EnhancedTable'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { CustomSelect } from '@/components/ui/CustomSelect'
import { DatePicker } from '@/components/ui/DatePicker'
import { useToast } from '@/hooks/useToast'
import { ToastProvider } from '@/contexts/ToastContext'
import { 
  ChartBarIcon, 
  CpuChipIcon, 
  CurrencyDollarIcon,
  UserGroupIcon,
  BeakerIcon,
  SunIcon,
  HeartIcon,
  UserIcon,
  EnvelopeIcon,
  PhoneIcon,
  CalendarIcon,
  MagnifyingGlassIcon
} from '@heroicons/react/24/outline'

function ShowcaseContent() {
  const [isAnimating, setIsAnimating] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    category: '',
    phone: ''
  })
  const [selectedCategory, setSelectedCategory] = useState<string | number>('')
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const { toast } = useToast()

  // Sample data for table
  const tableData = [
    { id: 1, name: 'Vaca 001', category: 'Lactando', status: 'Activo', age: 4, weight: 450 },
    { id: 2, name: 'Toro 002', category: 'Reproductor', status: 'Activo', age: 6, weight: 650 },
    { id: 3, name: 'Ternero 003', category: 'Crecimiento', status: 'Activo', age: 1, weight: 120 },
    { id: 4, name: 'Vaca 004', category: 'Seco', status: 'Inactivo', age: 5, weight: 480 },
  ]

  const tableColumns = [
    {
      key: 'name',
      title: 'Nombre',
      dataIndex: 'name',
      render: (value: string) => (
        <div className="flex items-center">
          <UserIcon className="h-4 w-4 text-gray-400 mr-2" />
          <span className="font-medium">{value}</span>
        </div>
      )
    },
    {
      key: 'category',
      title: 'Categoría',
      dataIndex: 'category',
      render: (value: string) => (
        <Badge 
          variant={value === 'Lactando' ? 'leche' : value === 'Reproductor' ? 'ganado' : 'cultivo'}
          animate={isAnimating}
          size="sm"
        >
          {value}
        </Badge>
      )
    },
    {
      key: 'status',
      title: 'Estado',
      dataIndex: 'status',
      render: (value: string) => (
        <Badge 
          variant={value === 'Activo' ? 'success' : 'warning'}
          animate={isAnimating}
          size="sm"
        >
          {value}
        </Badge>
      )
    },
    {
      key: 'age',
      title: 'Edad',
      dataIndex: 'age',
      render: (value: number) => `${value} años`
    },
    {
      key: 'weight',
      title: 'Peso',
      dataIndex: 'weight',
      render: (value: number) => `${value} kg`,
      align: 'right' as const
    }
  ]

  const categoryOptions = [
    { value: 'ganado', label: 'Ganado', icon: <UserGroupIcon className="h-4 w-4" /> },
    { value: 'cultivo', label: 'Cultivo', icon: <SunIcon className="h-4 w-4" /> },
    { value: 'leche', label: 'Producción de Leche', icon: <BeakerIcon className="h-4 w-4" /> },
    { value: 'finanzas', label: 'Finanzas', icon: <CurrencyDollarIcon className="h-4 w-4" /> },
  ]

  const handleSubmit = () => {
    toast({
      type: 'success',
      title: 'Formulario enviado',
      message: 'Los datos se han guardado correctamente'
    })
    setIsModalOpen(false)
  }

  // Funciones para la tabla mejorada
  const handleRefresh = () => {
    toast({
      type: 'info',
      title: 'Actualizando datos',
      message: 'Refrescando la tabla...'
    })
  }

  const handleExportPDF = () => {
    toast({
      type: 'success',
      title: 'Exportando PDF',
      message: 'El archivo PDF se está generando...'
    })
  }

  const handleExportExcel = () => {
    toast({
      type: 'success',
      title: 'Exportando Excel',
      message: 'El archivo Excel se está generando...'
    })
  }

  const handleView = (record: { name: string }) => {
    toast({
      type: 'info',
      title: 'Ver detalles',
      message: `Viendo detalles de ${record.name}`
    })
  }

  const handleEdit = (record: { name: string }) => {
    toast({
      type: 'warning',
      title: 'Editar registro',
      message: `Editando ${record.name}`
    })
  }

  const handleDelete = (record: { name: string }) => {
    toast({
      type: 'error',
      title: 'Eliminar registro',
      message: `¿Estás seguro de eliminar ${record.name}?`
    })
  }

  const showToast = (type: 'success' | 'error' | 'warning' | 'info') => {
    toast({
      type,
      title: `Notificación ${type}`,
      message: `Esta es una notificación de tipo ${type}`
    })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
      {/* Header */}
      <div className="relative overflow-hidden bg-gradient-to-r from-green-600 to-green-500">
        <div className="absolute inset-0 bg-gradient-to-r from-green-600/90 to-green-500/90" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <h1 className="text-5xl font-bold text-white mb-6 animate-fade-in">
              🚀 Catledan SaaS
            </h1>
            <p className="text-xl text-green-100 mb-8 animate-slide-up">
              Librería de Componentes Premium con Animaciones Espectaculares
            </p>
            <div className="flex justify-center space-x-4 animate-bounce-in">
              <Button size="lg" glow={true} animate={true}>
                🎨 Ver Componentes
              </Button>
              <Button variant="ghost" size="lg" animate={true}>
                📖 Documentación
              </Button>
            </div>
          </div>
        </div>
        
        {/* Floating elements */}
        <div className="absolute top-10 left-10 w-20 h-20 bg-white/10 rounded-full animate-float" />
        <div className="absolute bottom-10 right-10 w-32 h-32 bg-white/5 rounded-full animate-pulse-slow" />
        <div className="absolute top-1/2 left-1/4 w-16 h-16 bg-green-300/20 rounded-full animate-bounce" />
      </div>

      {/* Stats Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
          <StatsCard
            title="Total de Ganado"
            value="1,247"
            change={{ value: "+12%", type: 'increase' }}
            icon={<UserGroupIcon className="w-6 h-6" />}
            color="ganado"
            animate={isAnimating}
          />
          <StatsCard
            title="Ingresos Mensuales"
            value="45,230"
            change={{ value: "+8%", type: 'increase' }}
            icon={<CurrencyDollarIcon className="w-6 h-6" />}
            color="success"
            animate={isAnimating}
          />
          <StatsCard
            title="Producción Leche"
            value="2,340L"
            change={{ value: "+5%", type: 'increase' }}
            icon={<BeakerIcon className="w-6 h-6" />}
            color="leche"
            animate={isAnimating}
          />
          <StatsCard
            title="Cultivos Activos"
            value="23"
            change={{ value: "+2", type: 'increase' }}
            icon={<ChartBarIcon className="w-6 h-6" />}
            color="cultivo"
            animate={isAnimating}
          />
          <StatsCard
            title="Salud del Ganado"
            value="98%"
            change={{ value: "+1%", type: 'increase' }}
            icon={<HeartIcon className="w-6 h-6" />}
            color="success"
            animate={isAnimating}
          />
          <StatsCard
            title="Eficiencia IA"
            value="94%"
            change={{ value: "+3%", type: 'increase' }}
            icon={<CpuChipIcon className="w-6 h-6" />}
            color="primary"
            animate={isAnimating}
          />
        </div>
      </div>

      {/* Components Showcase */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-slate-900 mb-4 animate-fade-in">
            🎭 Componentes Premium
          </h2>
          <p className="text-xl text-slate-600 animate-slide-up">
            Diseñados con animaciones fluidas y efectos visuales espectaculares
          </p>
        </div>

        {/* Buttons Showcase */}
        <Card variant="elevated" className="mb-12">
          <h3 className="text-2xl font-bold text-slate-900 mb-6">🎨 Botones</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <Button variant="primary" animate={true} glow={true}>Primario</Button>
            <Button variant="secondary" animate={true}>Secundario</Button>
            <Button variant="success" animate={true} glow={true}>Éxito</Button>
            <Button variant="warning" animate={true}>Alerta</Button>
            <Button variant="error" animate={true}>Error</Button>
            <Button variant="ghost" animate={true}>Fantasma</Button>
          </div>
        </Card>

        {/* Cards Showcase */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <Card variant="default" hover={true} animate={true}>
            <h4 className="font-bold text-slate-900 mb-2">Card Default</h4>
            <p className="text-slate-600">Diseño estándar con efectos hover</p>
          </Card>
          <Card variant="elevated" hover={true} animate={true}>
            <h4 className="font-bold text-slate-900 mb-2">Card Elevado</h4>
            <p className="text-slate-600">Con sombra y profundidad</p>
          </Card>
          <Card variant="outlined" hover={true} animate={true}>
            <h4 className="font-bold text-slate-900 mb-2">Card Outline</h4>
            <p className="text-slate-600">Con borde destacado</p>
          </Card>
          <Card variant="gradient" hover={true} animate={true}>
            <h4 className="font-bold text-slate-900 mb-2">Card Gradiente</h4>
            <p className="text-slate-600">Con gradiente animado</p>
          </Card>
        </div>

        {/* Badges Showcase */}
        <Card variant="elevated" className="mb-12">
          <h3 className="text-2xl font-bold text-slate-900 mb-6">🏷️ Badges (Etiquetas)</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
            <Badge variant="default" animate={isAnimating} showIcon={false} size="sm">Default</Badge>
            <Badge variant="success" animate={isAnimating} size="sm">Éxito</Badge>
            <Badge variant="warning" animate={isAnimating} size="sm">Alerta</Badge>
            <Badge variant="error" animate={isAnimating} size="sm">Error</Badge>
            <Badge variant="info" animate={isAnimating} size="sm">Info</Badge>
            <Badge variant="ganado" animate={isAnimating} size="sm">Ganado</Badge>
            <Badge variant="cultivo" animate={isAnimating} size="sm">Cultivo</Badge>
            <Badge variant="leche" animate={isAnimating} size="sm">Leche</Badge>
          </div>
        </Card>

        {/* Forms Showcase */}
        <Card variant="elevated" className="mb-12">
          <h3 className="text-2xl font-bold text-slate-900 mb-6">📝 Formularios</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <Input
                label="Nombre completo"
                placeholder="Ingresa tu nombre"
                icon={<UserIcon className="w-5 h-5" />}
                animate={isAnimating}
                variant="default"
                validationRules={{ required: true, minLength: 2 }}
                helper="Mínimo 2 caracteres"
              />
              <Input
                label="Email"
                type="email"
                placeholder="tu@email.com"
                icon={<EnvelopeIcon className="w-5 h-5" />}
                animate={isAnimating}
                variant="filled"
                validationRules={{ required: true, email: true }}
              />
              <Input
                label="Teléfono"
                placeholder="1234567890"
                icon={<PhoneIcon className="w-5 h-5" />}
                animate={isAnimating}
                variant="outlined"
                validationRules={{ required: true, phone: true }}
              />
            </div>
            <div className="space-y-4">
              <CustomSelect
                label="Categoría"
                placeholder="Selecciona una opción"
                options={categoryOptions}
                value={selectedCategory}
                onChange={setSelectedCategory}
                animate={isAnimating}
                variant="default"
              />
              <DatePicker
                label="Fecha de nacimiento"
                placeholder="Selecciona una fecha"
                value={selectedDate || undefined}
                onChange={(date) => setSelectedDate(date)}
                animate={isAnimating}
                variant="filled"
                maxDate={new Date()}
              />
              <Button
                variant="primary"
                size="lg"
                onClick={() => setIsModalOpen(true)}
                animate={isAnimating}
                glow={true}
              >
                🚀 Abrir Modal
              </Button>
              
              {/* Debug info */}
              <div className="mt-4 p-3 bg-gray-50 rounded-lg text-sm">
                <p><strong>Categoría seleccionada:</strong> {selectedCategory || 'Ninguna'}</p>
                <p><strong>Fecha seleccionada:</strong> {selectedDate ? selectedDate.toLocaleDateString('es-ES') : 'Ninguna'}</p>
              </div>
            </div>
          </div>
        </Card>

        {/* Enhanced Table Showcase */}
        <div className="mb-12">
          <EnhancedTable
            title="Tabla de Datos"
            columns={tableColumns}
            data={tableData}
            pagination={{
              current: 1,
              pageSize: 10,
              total: tableData.length,
              onChange: (page, pageSize) => console.log('Page:', page, 'Size:', pageSize)
            }}
            animate={isAnimating}
            showFilters={true}
            showExport={true}
            showRefresh={true}
            showActions={true}
            onRefresh={handleRefresh}
            onExportPDF={handleExportPDF}
            onExportExcel={handleExportExcel}
            onView={handleView}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        </div>

        {/* Notifications Showcase */}
        <Card variant="elevated" className="mb-12">
          <h3 className="text-2xl font-bold text-slate-900 mb-6">🔔 Notificaciones</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button
              variant="success"
              onClick={() => showToast('success')}
              animate={isAnimating}
            >
              ✅ Éxito
            </Button>
            <Button
              variant="error"
              onClick={() => showToast('error')}
              animate={isAnimating}
            >
              ❌ Error
            </Button>
            <Button
              variant="warning"
              onClick={() => showToast('warning')}
              animate={isAnimating}
            >
              ⚠️ Alerta
            </Button>
            <Button
              variant="secondary"
              onClick={() => showToast('info')}
              animate={isAnimating}
            >
              ℹ️ Info
            </Button>
          </div>
        </Card>

        {/* Interactive Demo */}
        <Card variant="gradient" className="text-center">
          <h3 className="text-2xl font-bold text-slate-900 mb-4">
            🎮 Demo Interactivo
          </h3>
          <p className="text-slate-600 mb-6">
            Toggle las animaciones para ver la diferencia
          </p>
          <Button 
            variant="primary" 
            size="lg"
            onClick={() => setIsAnimating(!isAnimating)}
            glow={true}
            animate={true}
          >
            {isAnimating ? '🛑 Desactivar Animaciones' : '✨ Activar Animaciones'}
          </Button>
        </Card>
      </div>

      {/* Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Formulario de Registro"
        size="lg"
        animate={isAnimating}
      >
        <div className="space-y-4">
          <Input
            label="Nombre completo"
            placeholder="Ingresa tu nombre"
            value={formData.name}
            onChange={(e) => setFormData({...formData, name: e.target.value})}
            animate={isAnimating}
          />
          <Input
            label="Email"
            type="email"
            placeholder="tu@email.com"
            value={formData.email}
            onChange={(e) => setFormData({...formData, email: e.target.value})}
            animate={isAnimating}
          />
          <Select
            label="Categoría"
            placeholder="Selecciona una opción"
            options={categoryOptions}
            value={formData.category}
            onChange={(value) => setFormData({...formData, category: value.toString()})}
            animate={isAnimating}
          />
          <div className="flex justify-end space-x-3 pt-4">
            <Button
              variant="secondary"
              onClick={() => setIsModalOpen(false)}
              animate={isAnimating}
            >
              Cancelar
            </Button>
            <Button
              variant="primary"
              onClick={handleSubmit}
              animate={isAnimating}
              glow={true}
            >
              Guardar
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}

export default function ShowcasePage() {
  return (
    <ToastProvider>
      <ShowcaseContent />
    </ToastProvider>
  )
}
