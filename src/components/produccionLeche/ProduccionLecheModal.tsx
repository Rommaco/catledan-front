'use client'

import React, { useState, useEffect } from 'react'
import { Modal } from '@/components/ui/Modal'
import { Input } from '@/components/ui/Input'
import { DatePicker } from '@/components/ui/DatePicker'
import { Button } from '@/components/ui/Button'
import { 
  ProduccionLeche, 
  CreateProduccionLecheData, 
  UpdateProduccionLecheData, 
  ProduccionLecheFormData 
} from '@/types/produccionLeche'
import { 
  CalendarDaysIcon,
  BeakerIcon,
  DocumentTextIcon
} from '@heroicons/react/24/outline'

interface ProduccionLecheModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (data: CreateProduccionLecheData | UpdateProduccionLecheData) => Promise<void>
  produccion?: ProduccionLeche | null
  mode: 'create' | 'edit'
  loading?: boolean
}

export const ProduccionLecheModal: React.FC<ProduccionLecheModalProps> = ({
  isOpen,
  onClose,
  onSave,
  produccion,
  mode,
  loading = false
}) => {
  const [formData, setFormData] = useState<ProduccionLecheFormData>({
    fecha: new Date(),
    cantidad: 0,
    observaciones: ''
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  // Función para convertir ProduccionLecheFormData a CreateProduccionLecheData
  const convertFormDataToCreateData = (data: ProduccionLecheFormData): CreateProduccionLecheData => {
    return {
      fecha: data.fecha.toISOString().split('T')[0],
      cantidad: data.cantidad,
      observaciones: data.observaciones
    }
  }

  // Resetear formulario cuando se abre/cierra el modal
  useEffect(() => {
    if (isOpen) {
      if (mode === 'edit' && produccion) {
        setFormData({
          fecha: new Date(produccion.fecha),
          cantidad: produccion.cantidad,
          observaciones: produccion.observaciones || undefined
        })
      } else {
        // Resetear para crear nuevo
        setFormData({
          fecha: new Date(),
          cantidad: 0,
          observaciones: ''
        })
      }
      setErrors({})
    }
  }, [isOpen, mode, produccion])

  const handleInputChange = (field: keyof ProduccionLecheFormData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))

    // Limpiar error del campo cuando el usuario empiece a escribir
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }))
    }
  }

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.fecha) {
      newErrors.fecha = 'La fecha es requerida'
    }

    if (!formData.cantidad || formData.cantidad <= 0) {
      newErrors.cantidad = 'La cantidad debe ser mayor a 0'
    }

    if (formData.cantidad > 100) {
      newErrors.cantidad = 'La cantidad parece ser muy alta (máximo 100 litros)'
    }

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
      console.error('Error al guardar producción:', error)
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={mode === 'create' ? 'Agregar Producción de Leche' : 'Editar Producción de Leche'}
      size="md"
    >
      <div className="space-y-6">
        {/* Fecha */}
        <div>
          <DatePicker
            label="Fecha"
            value={formData.fecha}
            onChange={(date) => handleInputChange('fecha', date)}
            error={errors.fecha}
          />
        </div>

        {/* Cantidad */}
        <div>
          <Input
            label="Cantidad (Litros)"
            type="number"
            value={formData.cantidad}
            onChange={(e) => handleInputChange('cantidad', parseFloat(e.target.value) || 0)}
            placeholder="Ej: 25.5"
            error={errors.cantidad}
            min={0}
            max={100}
            step={0.1}
          />
        </div>

        {/* Observaciones */}
        <div>
          <Input
            label="Observaciones"
            type="textarea"
            value={formData.observaciones}
            onChange={(e) => handleInputChange('observaciones', e.target.value)}
            placeholder="Observaciones sobre la producción..."
            error={errors.observaciones}
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
            onClick={handleSubmit}
            loading={loading}
            className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
          >
            {mode === 'create' ? 'Agregar' : 'Actualizar'}
          </Button>
        </div>
      </div>
    </Modal>
  )
}
