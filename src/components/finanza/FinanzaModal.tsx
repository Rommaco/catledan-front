'use client'
import React, { useState, useEffect, useCallback } from 'react'
import { Modal } from '@/components/ui/Modal'
import { Input } from '@/components/ui/Input'
import { CustomSelect } from '@/components/ui/CustomSelect'
import { DatePicker } from '@/components/ui/DatePicker'
import { Button } from '@/components/ui/Button'
import { 
  Finanza, 
  CreateFinanzaData, 
  UpdateFinanzaData, 
  FinanzaFormData, 
  TIPOS_FINANZA, 
  ESTADOS_FINANZA,
  CATEGORIAS_INGRESOS,
  CATEGORIAS_GASTOS,
  UNIDADES
} from '@/types/finanza'

interface FinanzaModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (data: CreateFinanzaData | UpdateFinanzaData) => Promise<void>
  finanza?: Finanza | null
  mode: 'create' | 'edit'
  loading?: boolean
}

export const FinanzaModal: React.FC<FinanzaModalProps> = ({
  isOpen,
  onClose,
  onSave,
  finanza,
  mode,
  loading = false,
}) => {
  const [formData, setFormData] = useState<FinanzaFormData>({
    fecha: new Date(),
    tipo: 'ingreso',
    categoria: '',
    descripcion: '',
    monto: 0,
    estado: 'completado',
    lote: '',
    cantidad: 0,
    unidad: '',
    proveedor: '',
    responsable: '',
    observaciones: '',
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  // Reset form when modal opens/closes or mode changes
  useEffect(() => {
    if (isOpen) {
      if (mode === 'edit' && finanza) {
        setFormData({
          fecha: new Date(finanza.fecha),
          tipo: finanza.tipo,
          categoria: finanza.categoria,
          descripcion: finanza.descripcion,
          monto: finanza.monto,
          estado: finanza.estado,
          lote: finanza.lote || undefined,
          cantidad: finanza.cantidad || 0,
          unidad: finanza.unidad || undefined,
          proveedor: finanza.proveedor || undefined,
          responsable: finanza.responsable || undefined,
          observaciones: finanza.observaciones || undefined,
        })
      } else {
        setFormData({
          fecha: new Date(),
          tipo: 'ingreso',
          categoria: '',
          descripcion: '',
          monto: 0,
          estado: 'completado',
          lote: '',
          cantidad: 0,
          unidad: '',
          proveedor: '',
          responsable: '',
          observaciones: '',
        })
      }
      setErrors({})
    }
  }, [isOpen, mode, finanza])

  const validateForm = useCallback(() => {
    const newErrors: Record<string, string> = {}

    if (!formData.categoria.trim()) {
      newErrors.categoria = 'La categoría es requerida'
    }
    if (!formData.descripcion.trim()) {
      newErrors.descripcion = 'La descripción es requerida'
    }
    if (formData.monto <= 0) {
      newErrors.monto = 'El monto debe ser mayor a 0'
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
        tipo: formData.tipo,
        categoria: formData.categoria.trim(),
        descripcion: formData.descripcion.trim(),
        monto: formData.monto,
        estado: formData.estado,
        lote: formData.lote?.trim() || undefined,
        cantidad: formData.cantidad || undefined,
        unidad: formData.unidad?.trim() || undefined,
        proveedor: formData.proveedor?.trim() || undefined,
        responsable: formData.responsable?.trim() || undefined,
        observaciones: formData.observaciones?.trim() || undefined,
      }

      await onSave(dataToSave)
      onClose()
    } catch (error) {
      console.error('Error al guardar finanza:', error)
    }
  }, [formData, validateForm, onSave, onClose])

  const handleInputChange = (field: keyof FinanzaFormData, value: any) => {
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

  const tipoOptions = TIPOS_FINANZA.map(tipo => ({
    value: tipo.value,
    label: tipo.label,
  }))

  const estadoOptions = ESTADOS_FINANZA.map(estado => ({
    value: estado.value,
    label: estado.label,
  }))

  const categoriaOptions = formData.tipo === 'ingreso' 
    ? CATEGORIAS_INGRESOS.map(cat => ({ value: cat, label: cat }))
    : CATEGORIAS_GASTOS.map(cat => ({ value: cat, label: cat }))

  const unidadOptions = UNIDADES.map(unit => ({
    value: unit,
    label: unit,
  }))

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={mode === 'create' ? 'Nueva Transacción' : 'Editar Transacción'}
      size="lg"
    >
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <CustomSelect
            label="Tipo de Transacción"
            value={formData.tipo}
            onChange={(value) => handleInputChange('tipo', value)}
            options={tipoOptions}
            placeholder="Seleccione el tipo"
            error={errors.tipo}
          />

          <CustomSelect
            label="Categoría"
            value={formData.categoria}
            onChange={(value) => handleInputChange('categoria', value)}
            options={categoriaOptions}
            placeholder="Seleccione la categoría"
            error={errors.categoria}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Descripción"
            value={formData.descripcion}
            onChange={(e) => handleInputChange('descripcion', e.target.value)}
            placeholder="Ingrese la descripción"
            error={errors.descripcion}
          />

          <Input
            label="Monto"
            type="number"
            value={formData.monto}
            onChange={(e) => handleInputChange('monto', parseFloat(e.target.value) || 0)}
            placeholder="0.00"
            error={errors.monto}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <DatePicker
            label="Fecha"
            value={formData.fecha}
            onChange={(date) => handleInputChange('fecha', date)}
            error={errors.fecha}
          />

          <CustomSelect
            label="Estado"
            value={formData.estado}
            onChange={(value) => handleInputChange('estado', value)}
            options={estadoOptions}
            placeholder="Seleccione el estado"
            error={errors.estado}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Input
            label="Lote (opcional)"
            value={formData.lote}
            onChange={(e) => handleInputChange('lote', e.target.value)}
            placeholder="Número de lote"
          />

          <Input
            label="Cantidad (opcional)"
            type="number"
            value={formData.cantidad}
            onChange={(e) => handleInputChange('cantidad', parseFloat(e.target.value) || 0)}
            placeholder="0"
          />

          <CustomSelect
            label="Unidad (opcional)"
            value={formData.unidad}
            onChange={(value) => handleInputChange('unidad', value)}
            options={unidadOptions}
            placeholder="Seleccione unidad"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Proveedor (opcional)"
            value={formData.proveedor}
            onChange={(e) => handleInputChange('proveedor', e.target.value)}
            placeholder="Nombre del proveedor"
          />

          <Input
            label="Responsable (opcional)"
            value={formData.responsable}
            onChange={(e) => handleInputChange('responsable', e.target.value)}
            placeholder="Nombre del responsable"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Observaciones (opcional)
          </label>
          <textarea
            value={formData.observaciones}
            onChange={(e) => handleInputChange('observaciones', e.target.value)}
            placeholder="Observaciones adicionales"
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-verde-agro focus:border-verde-agro transition-colors"
          />
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
            {mode === 'create' ? 'Crear Transacción' : 'Guardar Cambios'}
          </Button>
        </div>
      </div>
    </Modal>
  )
}
