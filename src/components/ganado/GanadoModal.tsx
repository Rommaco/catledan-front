'use client'
import React, { useEffect, useState } from 'react'
import { Modal } from '@/components/ui/Modal'
import { Input } from '@/components/ui/Input'
import { CustomSelect } from '@/components/ui/CustomSelect'
import { DatePicker } from '@/components/ui/DatePicker'
import { Button } from '@/components/ui/Button'
import { Ganado, CreateGanadoData, UpdateGanadoData, GanadoFormData } from '@/types/ganado'
import { 
  UserIcon,
  TagIcon,
  ScaleIcon,
  CalendarDaysIcon,
  IdentificationIcon,
  BeakerIcon,
  ClockIcon,
  DocumentTextIcon
} from '@heroicons/react/24/outline'

interface GanadoModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (data: CreateGanadoData | UpdateGanadoData) => Promise<void>
  ganado?: Ganado | null
  mode: 'create' | 'edit'
  loading?: boolean
}

export const GanadoModal: React.FC<GanadoModalProps> = ({
  isOpen,
  onClose,
  onSave,
  ganado,
  mode,
  loading = false
}) => {
  const [formData, setFormData] = useState<GanadoFormData>({
    nombre: '',
    raza: '',
    peso: 0,
    edad: 0,
    estado: 'Activo',
    fechaIngreso: new Date(),
    numeroIdentificacion: '',
    sexo: 'hembra',
    categoria: 'vaca',
    estadoReproductivo: 'vacia',
    observaciones: ''
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  // Función para convertir GanadoFormData a CreateGanadoData
  const convertFormDataToCreateData = (data: GanadoFormData): CreateGanadoData => {
    return {
      ...data,
      fechaIngreso: data.fechaIngreso.toISOString().split('T')[0],
      fechaUltimoCelo: data.fechaUltimoCelo?.toISOString().split('T')[0],
      fechaUltimaMonta: data.fechaUltimaMonta?.toISOString().split('T')[0],
      fechaInseminacion: data.fechaInseminacion?.toISOString().split('T')[0],
      fechaEsperadaParto: data.fechaEsperadaParto?.toISOString().split('T')[0],
      proximaVacuna: data.proximaVacuna?.toISOString().split('T')[0]
    }
  }

  // Resetear formulario cuando se abre/cierra el modal
  useEffect(() => {
    if (isOpen) {
      if (mode === 'edit' && ganado) {
        setFormData({
          nombre: ganado.nombre,
          raza: ganado.raza,
          peso: ganado.peso,
          edad: ganado.edad,
          estado: ganado.estado,
          fechaIngreso: new Date(ganado.fechaIngreso),
          numeroIdentificacion: ganado.numeroIdentificacion,
          sexo: ganado.sexo,
          categoria: ganado.categoria,
          estadoReproductivo: ganado.estadoReproductivo || 'vacia',
          fechaUltimoCelo: ganado.fechaUltimoCelo ? new Date(ganado.fechaUltimoCelo) : null,
          fechaUltimaMonta: ganado.fechaUltimaMonta ? new Date(ganado.fechaUltimaMonta) : null,
          fechaInseminacion: ganado.fechaInseminacion ? new Date(ganado.fechaInseminacion) : null,
          toroPadre: ganado.toroPadre || undefined,
          fechaEsperadaParto: ganado.fechaEsperadaParto ? new Date(ganado.fechaEsperadaParto) : null,
          tiempoSeca: ganado.tiempoSeca || 0,
          diasLactancia: ganado.diasLactancia || 0,
          numeroPartos: ganado.numeroPartos || 0,
          ultimaProduccionLeche: ganado.ultimaProduccionLeche || 0,
          proximaVacuna: ganado.proximaVacuna ? new Date(ganado.proximaVacuna) : null,
          observaciones: ganado.observaciones || undefined
        })
      } else {
        // Resetear para crear nuevo
        setFormData({
          nombre: '',
          raza: '',
          peso: 0,
          edad: 0,
          estado: 'Activo',
          fechaIngreso: new Date(),
          numeroIdentificacion: '',
          sexo: 'hembra',
          categoria: 'vaca',
          estadoReproductivo: 'vacia',
          observaciones: ''
        })
      }
      setErrors({})
    }
  }, [isOpen, mode, ganado])

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    
    // Limpiar error cuando el usuario empiece a escribir
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.nombre.trim()) newErrors.nombre = 'El nombre es requerido'
    if (!formData.raza.trim()) newErrors.raza = 'La raza es requerida'
    if (!formData.numeroIdentificacion.trim()) newErrors.numeroIdentificacion = 'El número de identificación es requerido'
    if (formData.peso <= 0) newErrors.peso = 'El peso debe ser mayor a 0'
    if (formData.edad < 0) newErrors.edad = 'La edad no puede ser negativa'
    if (!formData.fechaIngreso) newErrors.fechaIngreso = 'La fecha de ingreso es requerida'

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async () => {
    if (!validateForm()) return

    try {
      const dataToSave = convertFormDataToCreateData(formData)
      await onSave(dataToSave)
      onClose()
    } catch (error) {
      console.error('Error al guardar ganado:', error)
    }
  }

  const sexoOptions = [
    { value: 'hembra', label: 'Hembra', icon: <UserIcon className="h-4 w-4" /> },
    { value: 'macho', label: 'Macho', icon: <UserIcon className="h-4 w-4" /> }
  ]

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

  const estadoReproductivoOptions = [
    { value: 'vacia', label: 'Vacía', icon: <BeakerIcon className="h-4 w-4" /> },
    { value: 'preñada', label: 'Preñada', icon: <BeakerIcon className="h-4 w-4" /> },
    { value: 'lactando', label: 'Lactando', icon: <BeakerIcon className="h-4 w-4" /> },
    { value: 'seca', label: 'Seca', icon: <BeakerIcon className="h-4 w-4" /> }
  ]

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={mode === 'create' ? 'Agregar Ganado' : 'Editar Ganado'}
      size="lg"
    >
      <div className="space-y-6">
        {/* Información Básica */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            <IdentificationIcon className="h-5 w-5 mr-2 text-green-600" />
            Información Básica
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Nombre"
              value={formData.nombre}
              onChange={(e) => handleInputChange('nombre', e.target.value)}
              placeholder="Ej: Rosita"
              error={errors.nombre}
            />
            
            <Input
              label="Raza"
              value={formData.raza}
              onChange={(e) => handleInputChange('raza', e.target.value)}
              placeholder="Ej: Holstein"
              error={errors.raza}
            />
            
            <Input
              label="Número de Identificación"
              value={formData.numeroIdentificacion}
              onChange={(e) => handleInputChange('numeroIdentificacion', e.target.value)}
              placeholder="Ej: VACA001"
              error={errors.numeroIdentificacion}
            />
            
            <CustomSelect
              label="Sexo"
              value={formData.sexo}
              onChange={(value) => handleInputChange('sexo', value)}
              options={sexoOptions}
              placeholder="Seleccionar sexo"
            />
            
            <CustomSelect
              label="Categoría"
              value={formData.categoria}
              onChange={(value) => handleInputChange('categoria', value)}
              options={categoriaOptions}
              placeholder="Seleccionar categoría"
            />
            
            <CustomSelect
              label="Estado"
              value={formData.estado}
              onChange={(value) => handleInputChange('estado', value)}
              options={estadoOptions}
              placeholder="Seleccionar estado"
            />
            
            <Input
              label="Peso (kg)"
              type="number"
              value={formData.peso}
              onChange={(e) => handleInputChange('peso', parseFloat(e.target.value) || 0)}
              placeholder="Ej: 650"
              error={errors.peso}
            />
            
            <Input
              label="Edad (años)"
              type="number"
              value={formData.edad}
              onChange={(e) => handleInputChange('edad', parseInt(e.target.value) || 0)}
              placeholder="Ej: 4"
              error={errors.edad}
            />
            
            <DatePicker
              label="Fecha de Ingreso"
              value={formData.fechaIngreso}
              onChange={(date) => handleInputChange('fechaIngreso', date)}
              error={errors.fechaIngreso}
            />
          </div>
        </div>

        {/* Información Reproductiva */}
        {formData.sexo === 'hembra' && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <BeakerIcon className="h-5 w-5 mr-2 text-green-600" />
              Información Reproductiva
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <CustomSelect
                label="Estado Reproductivo"
                value={formData.estadoReproductivo}
                onChange={(value) => handleInputChange('estadoReproductivo', value)}
                options={estadoReproductivoOptions}
                placeholder="Seleccionar estado"
              />
              
              <DatePicker
                label="Último Celo"
                value={formData.fechaUltimoCelo || undefined}
                onChange={(date) => handleInputChange('fechaUltimoCelo', date)}
              />
              
              <DatePicker
                label="Última Monta"
                value={formData.fechaUltimaMonta || undefined}
                onChange={(date) => handleInputChange('fechaUltimaMonta', date)}
              />
              
              <DatePicker
                label="Fecha de Inseminación"
                value={formData.fechaInseminacion || undefined}
                onChange={(date) => handleInputChange('fechaInseminacion', date)}
              />
              
              <Input
                label="Toro Padre"
                value={formData.toroPadre || undefined}
                onChange={(e) => handleInputChange('toroPadre', e.target.value)}
                placeholder="Ej: TORO001"
              />
              
              <DatePicker
                label="Fecha Esperada de Parto"
                value={formData.fechaEsperadaParto || undefined}
                onChange={(date) => handleInputChange('fechaEsperadaParto', date)}
              />
              
              <Input
                label="Tiempo Seca (días)"
                type="number"
                value={formData.tiempoSeca || 0}
                onChange={(e) => handleInputChange('tiempoSeca', parseInt(e.target.value) || 0)}
                placeholder="Ej: 45"
              />
              
              <Input
                label="Días de Lactancia"
                type="number"
                value={formData.diasLactancia || 0}
                onChange={(e) => handleInputChange('diasLactancia', parseInt(e.target.value) || 0)}
                placeholder="Ej: 120"
              />
              
              <Input
                label="Número de Partos"
                type="number"
                value={formData.numeroPartos || 0}
                onChange={(e) => handleInputChange('numeroPartos', parseInt(e.target.value) || 0)}
                placeholder="Ej: 3"
              />
              
              <Input
                label="Última Producción de Leche (L/día)"
                type="number"
                step="0.1"
                value={formData.ultimaProduccionLeche || 0}
                onChange={(e) => handleInputChange('ultimaProduccionLeche', parseFloat(e.target.value) || 0)}
                placeholder="Ej: 25"
              />
              
              <DatePicker
                label="Próxima Vacuna"
                value={formData.proximaVacuna || undefined}
                onChange={(date) => handleInputChange('proximaVacuna', date)}
              />
            </div>
          </div>
        )}

        {/* Observaciones */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            <DocumentTextIcon className="h-5 w-5 mr-2 text-green-600" />
            Observaciones
          </h3>
          
          <textarea
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 resize-none"
            rows={3}
            value={formData.observaciones || undefined}
            onChange={(e) => handleInputChange('observaciones', e.target.value)}
            placeholder="Observaciones adicionales sobre el animal..."
          />
        </div>

        {/* Botones */}
        <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
          <Button
            variant="ghost"
            onClick={onClose}
            disabled={loading}
          >
            Cancelar
          </Button>
          <Button
            variant="primary"
            onClick={handleSubmit}
            loading={loading}
          >
            {mode === 'create' ? 'Agregar Ganado' : 'Guardar Cambios'}
          </Button>
        </div>
      </div>
    </Modal>
  )
}

GanadoModal.displayName = 'GanadoModal'
