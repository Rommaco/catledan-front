'use client'
import React, { useState, useEffect, useCallback } from 'react'
import { Modal } from '@/components/ui/Modal'
import { Input } from '@/components/ui/Input'
import { TextArea } from '@/components/ui/TextArea'
import { Button } from '@/components/ui/Button'
import { CustomSelect } from '@/components/ui/CustomSelect'
import type { Venta, CreateVentaData, UpdateVentaData } from '@/types/venta'
import { format } from 'date-fns'

interface VentaModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (data: CreateVentaData | UpdateVentaData) => Promise<void>
  venta?: Venta | null
  mode: 'create' | 'edit'
  loading?: boolean
}

const TIPOS_VENTA: { value: string; label: string }[] = [
  { value: 'animal', label: 'Animal' },
  { value: 'producto', label: 'Producto' },
  { value: 'leche', label: 'Leche' },
  { value: 'servicio', label: 'Servicio' },
  { value: 'otro', label: 'Otro' },
]

function tipoOptions(currentTipo: string) {
  if (!currentTipo) return TIPOS_VENTA
  if (TIPOS_VENTA.some((o) => o.value === currentTipo)) return TIPOS_VENTA
  return [...TIPOS_VENTA, { value: currentTipo, label: currentTipo }]
}

function todayISO() {
  return format(new Date(), 'yyyy-MM-dd')
}

const initialForm: CreateVentaData = {
  fecha: todayISO(),
  tipo: 'animal',
  concepto: '',
  cantidad: 1,
  monto: 0,
  comprador: '',
  observaciones: '',
}

export const VentaModal: React.FC<VentaModalProps> = ({
  isOpen,
  onClose,
  onSave,
  venta,
  mode,
  loading = false,
}) => {
  const [formData, setFormData] = useState<CreateVentaData>(initialForm)
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (isOpen) {
      if (mode === 'edit' && venta) {
        const fechaStr = venta.fecha?.slice(0, 10) || todayISO()
        setFormData({
          fecha: fechaStr,
          tipo: venta.tipo,
          concepto: venta.concepto,
          cantidad: venta.cantidad,
          monto: venta.monto,
          comprador: venta.comprador ?? '',
          observaciones: venta.observaciones ?? '',
        })
      } else {
        setFormData({ ...initialForm, fecha: todayISO() })
      }
      setErrors({})
    }
  }, [isOpen, mode, venta])

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const { name, value } = e.target
      const numFields = ['cantidad', 'monto']
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

  const validate = useCallback((): boolean => {
    const e: Record<string, string> = {}
    if (!formData.fecha?.trim()) e.fecha = 'La fecha es requerida'
    if (!formData.tipo?.trim()) e.tipo = 'El tipo es requerido'
    if (!formData.concepto?.trim()) e.concepto = 'El concepto es requerido'
    if (formData.cantidad == null || formData.cantidad < 0) e.cantidad = 'La cantidad no puede ser negativa'
    if (formData.monto == null || formData.monto < 0) e.monto = 'El monto no puede ser negativo'
    setErrors(e)
    return Object.keys(e).length === 0
  }, [formData])

  const handleSubmit = async () => {
    if (!validate()) return
    const toSend = {
      ...formData,
      comprador: formData.comprador?.trim() || undefined,
      observaciones: formData.observaciones?.trim() || undefined,
    }
    await onSave(toSend)
    onClose()
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={mode === 'create' ? 'Nueva Venta' : 'Editar Venta'}
      size="lg"
    >
      <div className="space-y-4 p-4">
        <Input
          label="Fecha"
          name="fecha"
          type="date"
          value={formData.fecha}
          onChange={handleChange}
          error={errors.fecha}
          disabled={loading}
        />
        <CustomSelect
          label="Tipo"
          value={formData.tipo}
          onChange={handleTipoChange}
          options={tipoOptions(formData.tipo)}
          error={errors.tipo}
          disabled={loading}
          placeholder="Tipo de venta"
        />
        <Input
          label="Concepto"
          name="concepto"
          value={formData.concepto}
          onChange={handleChange}
          error={errors.concepto}
          disabled={loading}
          placeholder="Ej. Venta de novillo"
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
            placeholder="1"
          />
          <Input
            label="Monto (PEN)"
            name="monto"
            type="number"
            min={0}
            step={0.01}
            value={formData.monto === 0 ? '' : formData.monto}
            onChange={handleChange}
            error={errors.monto}
            disabled={loading}
            placeholder="0.00"
          />
        </div>
        <Input
          label="Comprador (opcional)"
          name="comprador"
          value={formData.comprador ?? ''}
          onChange={handleChange}
          error={errors.comprador}
          disabled={loading}
          placeholder="Nombre del comprador"
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
          {mode === 'create' ? 'Registrar Venta' : 'Guardar'}
        </Button>
      </div>
    </Modal>
  )
}
