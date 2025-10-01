'use client'
import React, { useState, useEffect, useCallback } from 'react'
import { Modal } from '@/components/ui/Modal'
import { Input } from '@/components/ui/Input'
import { CustomSelect } from '@/components/ui/CustomSelect'
import { DatePicker } from '@/components/ui/DatePicker'
import { Button } from '@/components/ui/Button'
import {
  Cultivo,
  CreateCultivoData,
  UpdateCultivoData,
  CultivoFormData,
} from '@/types/cultivo'
import { 
  SunIcon, 
  CalendarDaysIcon, 
  DocumentTextIcon,
  ChartBarIcon,
  BeakerIcon
} from '@heroicons/react/24/outline'
import { useToast } from '@/hooks/useToast'

interface CultivoModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (data: CreateCultivoData | UpdateCultivoData) => Promise<void>
  cultivo?: Cultivo | null
  mode: 'create' | 'edit'
  loading?: boolean
}

const tiposCultivo = [
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
  { value: 'sembrado', label: 'Sembrado' },
  { value: 'en crecimiento', label: 'En Crecimiento' },
  { value: 'maduro', label: 'Maduro' },
  { value: 'cosechado', label: 'Cosechado' },
]

export const CultivoModal: React.FC<CultivoModalProps> = ({
  isOpen,
  onClose,
  onSave,
  cultivo,
  mode,
  loading = false,
}) => {
  const { toast } = useToast()
  const [formData, setFormData] = useState<CultivoFormData>({
    nombre: '',
    tipo: '',
    area: 0,
    fechaSiembra: new Date(),
    fechaCosecha: null,
    variedad: '',
    densidadSiembra: 0,
    rendimientoEsperado: 0,
    rendimientoReal: 0,
    estado: 'sembrado',
    observaciones: '',
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  // Resetear formulario cuando se abre/cierra el modal
  useEffect(() => {
    if (isOpen) {
      if (mode === 'edit' && cultivo) {
        setFormData({
          nombre: cultivo.nombre,
          tipo: cultivo.tipo,
          area: cultivo.area,
          fechaSiembra: new Date(cultivo.fechaSiembra),
          fechaCosecha: cultivo.fechaCosecha ? new Date(cultivo.fechaCosecha) : null,
          variedad: cultivo.variedad || undefined,
          densidadSiembra: cultivo.densidadSiembra || 0,
          rendimientoEsperado: cultivo.rendimientoEsperado || 0,
          rendimientoReal: cultivo.rendimientoReal || 0,
          estado: cultivo.estado,
          observaciones: cultivo.observaciones || undefined,
        })
      } else {
        // Resetear para crear nuevo
        setFormData({
          nombre: '',
          tipo: '',
          area: 0,
          fechaSiembra: new Date(),
          fechaCosecha: null,
          variedad: '',
          densidadSiembra: 0,
          rendimientoEsperado: 0,
          rendimientoReal: 0,
          estado: 'sembrado',
          observaciones: '',
        })
      }
      setErrors({})
    }
  }, [isOpen, mode, cultivo])

  const handleInputChange = useCallback(
    (field: keyof CultivoFormData, value: any) => {
      setFormData((prev) => ({
        ...prev,
        [field]: value,
      }))

      // Limpiar error del campo cuando el usuario empiece a escribir
      if (errors[field]) {
        setErrors((prev) => {
          const newErrors = { ...prev }
          delete newErrors[field]
          return newErrors
        })
      }
    },
    [errors],
  )

  const validateForm = useCallback(() => {
    const newErrors: Record<string, string> = {}

    if (!formData.nombre.trim()) {
      newErrors.nombre = 'El nombre es requerido'
    }
    if (!formData.tipo) {
      newErrors.tipo = 'El tipo de cultivo es requerido'
    }
    if (formData.area <= 0) {
      newErrors.area = 'El área debe ser mayor a 0'
    }
    if (!formData.fechaSiembra) {
      newErrors.fechaSiembra = 'La fecha de siembra es requerida'
    }
    if (!formData.estado) {
      newErrors.estado = 'El estado es requerido'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }, [formData])

  const convertFormDataToCreateData = (data: CultivoFormData): CreateCultivoData => {
    return {
      ...data,
      fechaSiembra: data.fechaSiembra.toISOString().split('T')[0],
      fechaCosecha: data.fechaCosecha?.toISOString().split('T')[0],
    }
  }

  const convertFormDataToUpdateData = (data: CultivoFormData): UpdateCultivoData => {
    return {
      ...data,
      fechaSiembra: data.fechaSiembra.toISOString().split('T')[0],
      fechaCosecha: data.fechaCosecha?.toISOString().split('T')[0],
    }
  }

  const handleSubmit = async () => {
    if (!validateForm()) {
      toast({
        type: 'error',
        title: 'Error de validación',
        message: 'Por favor, corrige los errores en el formulario.',
      })
      return
    }

    try {
      const dataToSave =
        mode === 'create'
          ? convertFormDataToCreateData(formData)
          : convertFormDataToUpdateData(formData)
      await onSave(dataToSave)
      onClose()
    } catch (error) {
      console.error('Error al guardar cultivo:', error)
      toast({
        type: 'error',
        title: 'Error',
        message: 'Hubo un error al guardar el cultivo.',
      })
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={mode === 'create' ? 'Agregar Cultivo' : 'Editar Cultivo'}
    >
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Nombre del Cultivo"
            value={formData.nombre}
            onChange={(e) => handleInputChange('nombre', e.target.value)}
            error={errors.nombre}
          />

          <CustomSelect
            label="Tipo de Cultivo"
            value={formData.tipo}
            onChange={(value) => handleInputChange('tipo', value)}
            options={tiposCultivo}
            placeholder="Selecciona el tipo"
            error={errors.tipo}
          />

          <Input
            label="Área (hectáreas)"
            type="number"
            value={formData.area.toString()}
            onChange={(e) => handleInputChange('area', parseFloat(e.target.value) || 0)}
            error={errors.area}
            min={0.1}
            step={0.1}
          />

          <DatePicker
            label="Fecha de Siembra"
            value={formData.fechaSiembra}
            onChange={(date) => handleInputChange('fechaSiembra', date)}
            error={errors.fechaSiembra}
          />

          <DatePicker
            label="Fecha de Cosecha (Opcional)"
            value={formData.fechaCosecha || undefined}
            onChange={(date) => handleInputChange('fechaCosecha', date)}
            error={errors.fechaCosecha}
          />

          <CustomSelect
            label="Estado del Cultivo"
            value={formData.estado}
            onChange={(value) => handleInputChange('estado', value)}
            options={estadosCultivo}
            placeholder="Selecciona el estado"
            error={errors.estado}
          />
        </div>

        {/* Botones */}
        <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
          <Button
            variant="secondary"
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
            {mode === 'create' ? 'Agregar' : 'Guardar Cambios'}
          </Button>
        </div>
      </div>
    </Modal>
  )
}
