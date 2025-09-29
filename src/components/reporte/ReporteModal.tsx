'use client'
import React, { useState, useEffect, useCallback } from 'react'
import { Modal } from '@/components/ui/Modal'
import { Input } from '@/components/ui/Input'
import { CustomSelect } from '@/components/ui/CustomSelect'
import { DatePicker } from '@/components/ui/DatePicker'
import { Button } from '@/components/ui/Button'
import { Reporte, CreateReporteData, UpdateReporteData, ReporteFormData, TIPOS_REPORTE } from '@/types/reporte'
import { format } from 'date-fns'

interface ReporteModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (data: CreateReporteData | UpdateReporteData) => Promise<void>
  reporte?: Reporte | null
  mode: 'create' | 'edit'
  loading?: boolean
}

export const ReporteModal: React.FC<ReporteModalProps> = ({
  isOpen,
  onClose,
  onSave,
  reporte,
  mode,
  loading = false,
}) => {
  const [formData, setFormData] = useState<ReporteFormData>({
    fecha: new Date(),
    titulo: '',
    descripcion: '',
    tipo: 'general',
    datos: {},
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  // Reset form when modal opens/closes or mode changes
  useEffect(() => {
    if (isOpen) {
      if (mode === 'edit' && reporte) {
        setFormData({
          fecha: new Date(reporte.fecha),
          titulo: reporte.titulo,
          descripcion: reporte.descripcion,
          tipo: reporte.tipo,
          datos: reporte.datos || {},
        })
      } else {
        setFormData({
          fecha: new Date(),
          titulo: '',
          descripcion: '',
          tipo: 'general',
          datos: {},
        })
      }
      setErrors({})
    }
  }, [isOpen, mode, reporte])

  const validateForm = useCallback(() => {
    const newErrors: Record<string, string> = {}

    if (!formData.titulo.trim()) {
      newErrors.titulo = 'El título es requerido'
    }
    if (!formData.descripcion.trim()) {
      newErrors.descripcion = 'La descripción es requerida'
    }
    if (!formData.tipo) {
      newErrors.tipo = 'El tipo de reporte es requerido'
    }
    if (!formData.fecha) {
      newErrors.fecha = 'La fecha es requerida'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }, [formData])

  const handleSubmit = useCallback(async () => {
    if (!validateForm()) {
      return
    }

    try {
      const dataToSave = {
        fecha: formData.fecha.toISOString(),
        titulo: formData.titulo.trim(),
        descripcion: formData.descripcion.trim(),
        tipo: formData.tipo,
        datos: formData.datos,
      }

      await onSave(dataToSave)
      onClose()
    } catch (error) {
      console.error('Error al guardar reporte:', error)
    }
  }, [formData, validateForm, onSave, onClose])

  const handleInputChange = (field: keyof ReporteFormData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }))
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: '',
      }))
    }
  }

  const tipoOptions = TIPOS_REPORTE.map(tipo => ({
    value: tipo.value,
    label: tipo.label,
  }))

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={mode === 'create' ? 'Crear Reporte' : 'Editar Reporte'}
      size="lg"
    >
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Título"
            value={formData.titulo}
            onChange={(e) => handleInputChange('titulo', e.target.value)}
            placeholder="Ingrese el título del reporte"
            error={errors.titulo}
            required
          />

          <CustomSelect
            label="Tipo de Reporte"
            value={formData.tipo}
            onChange={(value) => handleInputChange('tipo', value)}
            options={tipoOptions}
            placeholder="Seleccione el tipo"
            error={errors.tipo}
            required
          />
        </div>

        <div>
          <DatePicker
            label="Fecha del Reporte"
            value={formData.fecha}
            onChange={(date) => handleInputChange('fecha', date)}
            error={errors.fecha}
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Descripción <span className="text-red-500">*</span>
          </label>
          <textarea
            value={formData.descripcion}
            onChange={(e) => handleInputChange('descripcion', e.target.value)}
            placeholder="Ingrese la descripción del reporte"
            rows={4}
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-verde-agro focus:border-verde-agro transition-colors ${
              errors.descripcion ? 'border-red-500' : 'border-gray-300'
            }`}
          />
          {errors.descripcion && (
            <p className="mt-1 text-sm text-red-500">{errors.descripcion}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Datos Adicionales (JSON)
          </label>
          <textarea
            value={JSON.stringify(formData.datos, null, 2)}
            onChange={(e) => {
              try {
                const parsed = JSON.parse(e.target.value)
                handleInputChange('datos', parsed)
              } catch {
                // Invalid JSON, keep the text but don't update datos
              }
            }}
            placeholder='{"campo": "valor"}'
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-verde-agro focus:border-verde-agro transition-colors font-mono text-sm"
          />
          <p className="mt-1 text-xs text-gray-500">
            Ingrese datos adicionales en formato JSON (opcional)
          </p>
        </div>

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
            {mode === 'create' ? 'Crear Reporte' : 'Guardar Cambios'}
          </Button>
        </div>
      </div>
    </Modal>
  )
}
