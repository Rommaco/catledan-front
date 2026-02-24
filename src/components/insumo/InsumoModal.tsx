'use client'
import React, { useState, useEffect, useCallback } from 'react'
import { Modal } from '@/components/ui/Modal'
import { Input } from '@/components/ui/Input'
import { TextArea } from '@/components/ui/TextArea'
import { Button } from '@/components/ui/Button'
import { CustomSelect } from '@/components/ui/CustomSelect'
import type { Insumo, CreateInsumoData, UpdateInsumoData } from '@/types/insumo'

interface InsumoModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (data: CreateInsumoData | UpdateInsumoData) => Promise<void>
  insumo?: Insumo | null
  mode: 'create' | 'edit'
  loading?: boolean
}

const TIPOS_INSUMO: { value: string; label: string }[] = [
  { value: 'antiparasitario', label: 'Antiparasitario' },
  { value: 'vacuna', label: 'Vacuna' },
  { value: 'antibiotico', label: 'Antibiótico' },
  { value: 'mineral', label: 'Mineral' },
  { value: 'alimento', label: 'Alimento' },
  { value: 'otro', label: 'Otro' },
]

function tipoOptions(currentTipo: string) {
  if (!currentTipo) return TIPOS_INSUMO
  if (TIPOS_INSUMO.some((o) => o.value === currentTipo)) return TIPOS_INSUMO
  return [...TIPOS_INSUMO, { value: currentTipo, label: currentTipo }]
}

const UNIDADES = [
  { value: 'ml', label: 'ml' },
  { value: 'l', label: 'L' },
  { value: 'kg', label: 'kg' },
  { value: 'g', label: 'g' },
  { value: 'unidad', label: 'Unidad' },
  { value: 'dosis', label: 'Dosis' },
  { value: 'otro', label: 'Otro' },
]

const initialForm: CreateInsumoData = {
  nombre: '',
  tipo: 'antiparasitario',
  cantidad: 0,
  unidad: 'ml',
  umbralMinimo: 0,
  observaciones: '',
}

export const InsumoModal: React.FC<InsumoModalProps> = ({
  isOpen,
  onClose,
  onSave,
  insumo,
  mode,
  loading = false,
}) => {
  const [formData, setFormData] = useState<CreateInsumoData>(initialForm)
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (isOpen) {
      if (mode === 'edit' && insumo) {
        setFormData({
          nombre: insumo.nombre,
          tipo: insumo.tipo,
          cantidad: insumo.cantidad,
          unidad: insumo.unidad,
          umbralMinimo: insumo.umbralMinimo,
          observaciones: insumo.observaciones ?? '',
        })
      } else {
        setFormData(initialForm)
      }
      setErrors({})
    }
  }, [isOpen, mode, insumo])

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const { name, value } = e.target
      const numFields = ['cantidad', 'umbralMinimo']
      const next = numFields.includes(name)
        ? { ...formData, [name]: value === '' ? 0 : Number(value) }
        : { ...formData, [name]: value }
      setFormData(next)
      if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }))
    },
    [formData, errors],
  )

  const handleTipoChange = useCallback((value: string) => {
    setFormData((prev) => ({ ...prev, tipo: value }))
    setErrors((prev) => ({ ...prev, tipo: '' }))
  }, [])

  const handleUnidadChange = useCallback((value: string) => {
    setFormData((prev) => ({ ...prev, unidad: value }))
    setErrors((prev) => ({ ...prev, unidad: '' }))
  }, [])

  const validate = useCallback((): boolean => {
    const e: Record<string, string> = {}
    if (!formData.nombre?.trim()) e.nombre = 'El nombre es requerido'
    if (!formData.tipo?.trim()) e.tipo = 'El tipo es requerido'
    if (formData.cantidad == null || formData.cantidad < 0) e.cantidad = 'La cantidad no puede ser negativa'
    if (!formData.unidad?.trim()) e.unidad = 'La unidad es requerida'
    if (formData.umbralMinimo == null || formData.umbralMinimo < 0) {
      e.umbralMinimo = 'El umbral mínimo no puede ser negativa'
    }
    setErrors(e)
    return Object.keys(e).length === 0
  }, [formData])

  const handleSubmit = async () => {
    if (!validate()) return
    const toSend = {
      ...formData,
      observaciones: formData.observaciones?.trim() || undefined,
    }
    await onSave(toSend)
    onClose()
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={mode === 'create' ? 'Nuevo Insumo' : 'Editar Insumo'}
      size="lg"
    >
      <div className="space-y-4 p-4">
        <Input
          label="Nombre"
          name="nombre"
          value={formData.nombre}
          onChange={handleChange}
          error={errors.nombre}
          disabled={loading}
          placeholder="Ej. Ivermectina"
        />
        <CustomSelect
          label="Tipo"
          value={formData.tipo}
          onChange={handleTipoChange}
          options={tipoOptions(formData.tipo)}
          error={errors.tipo}
          disabled={loading}
          placeholder="Selecciona tipo"
        />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Cantidad"
            name="cantidad"
            type="number"
            min={0}
            value={formData.cantidad === 0 ? '' : formData.cantidad}
            onChange={handleChange}
            error={errors.cantidad}
            disabled={loading}
            placeholder="0"
          />
          <CustomSelect
            label="Unidad"
            value={formData.unidad}
            onChange={handleUnidadChange}
            options={UNIDADES}
            error={errors.unidad}
            disabled={loading}
            placeholder="Unidad"
          />
        </div>
        <Input
          label="Umbral mínimo (alerta)"
          name="umbralMinimo"
          type="number"
          min={0}
          value={formData.umbralMinimo === 0 ? '' : formData.umbralMinimo}
          onChange={handleChange}
          error={errors.umbralMinimo}
          disabled={loading}
          placeholder="Ej. 10"
        />
        <TextArea
          label="Observaciones"
          name="observaciones"
          value={formData.observaciones ?? ''}
          onChange={handleChange}
          disabled={loading}
          rows={2}
          placeholder="Notas adicionales"
        />
      </div>
      <div className="flex justify-end gap-2 pt-4 border-t border-gray-200 px-4 pb-4">
        <Button variant="secondary" onClick={onClose} disabled={loading}>
          Cancelar
        </Button>
        <Button variant="primary" onClick={handleSubmit} loading={loading}>
          {mode === 'create' ? 'Crear Insumo' : 'Guardar'}
        </Button>
      </div>
    </Modal>
  )
}
