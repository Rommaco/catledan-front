'use client'
import React, { useState, useEffect, useCallback } from 'react'
import { Modal } from '@/components/ui/Modal'
import { Input } from '@/components/ui/Input'
import { TextArea } from '@/components/ui/TextArea'
import { Button } from '@/components/ui/Button'
import type { Parcela, CreateParcelaData, UpdateParcelaData } from '@/types/parcela'

interface ParcelaModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (data: CreateParcelaData | UpdateParcelaData) => Promise<void>
  parcela?: Parcela | null
  mode: 'create' | 'edit'
  loading?: boolean
}

const initialForm: CreateParcelaData = {
  nombre: '',
  direccion: '',
  region: '',
  estado: '',
  municipio: '',
  areaHectareas: 0,
  latitud: undefined,
  longitud: undefined,
  observaciones: '',
}

export const ParcelaModal: React.FC<ParcelaModalProps> = ({
  isOpen,
  onClose,
  onSave,
  parcela,
  mode,
  loading = false,
}) => {
  const [formData, setFormData] = useState<CreateParcelaData>(initialForm)
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (isOpen) {
      if (mode === 'edit' && parcela) {
        setFormData({
          nombre: parcela.nombre,
          direccion: parcela.direccion ?? '',
          region: parcela.region,
          estado: parcela.estado,
          municipio: parcela.municipio,
          areaHectareas: parcela.areaHectareas,
          latitud: parcela.latitud,
          longitud: parcela.longitud,
          observaciones: parcela.observaciones ?? '',
        })
      } else {
        setFormData(initialForm)
      }
      setErrors({})
    }
  }, [isOpen, mode, parcela])

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const { name, value } = e.target
      const numFields = ['areaHectareas', 'latitud', 'longitud']
      const next = numFields.includes(name)
        ? { ...formData, [name]: value === '' ? undefined : Number(value) }
        : { ...formData, [name]: value }
      setFormData(next)
      if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }))
    },
    [formData, errors],
  )

  const validate = useCallback((): boolean => {
    const e: Record<string, string> = {}
    if (!formData.nombre?.trim()) e.nombre = 'El nombre es requerido'
    if (!formData.region?.trim()) e.region = 'La región es requerida'
    if (!formData.estado?.trim()) e.estado = 'El estado es requerido'
    if (!formData.municipio?.trim()) e.municipio = 'El municipio es requerido'
    if (formData.areaHectareas == null || formData.areaHectareas <= 0) {
      e.areaHectareas = 'El área en hectáreas debe ser mayor a 0'
    }
    if (formData.latitud != null && (formData.latitud < -90 || formData.latitud > 90)) {
      e.latitud = 'Latitud debe estar entre -90 y 90'
    }
    if (formData.longitud != null && (formData.longitud < -180 || formData.longitud > 180)) {
      e.longitud = 'Longitud debe estar entre -180 y 180'
    }
    setErrors(e)
    return Object.keys(e).length === 0
  }, [formData])

  const handleSubmit = async () => {
    if (!validate()) return
    const toSend = {
      ...formData,
      direccion: formData.direccion?.trim() || undefined,
      observaciones: formData.observaciones?.trim() || undefined,
    }
    await onSave(toSend)
    onClose()
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={mode === 'create' ? 'Nueva Parcela' : 'Editar Parcela'}
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
          placeholder="Ej. Parcela Norte"
        />
        <Input
          label="Dirección"
          name="direccion"
          value={formData.direccion ?? ''}
          onChange={handleChange}
          error={errors.direccion}
          disabled={loading}
          placeholder="Dirección o referencia"
        />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Input
            label="Región"
            name="region"
            value={formData.region}
            onChange={handleChange}
            error={errors.region}
            disabled={loading}
            placeholder="Región"
          />
          <Input
            label="Estado / Departamento"
            name="estado"
            value={formData.estado}
            onChange={handleChange}
            error={errors.estado}
            disabled={loading}
            placeholder="Estado o departamento"
          />
          <Input
            label="Municipio / Distrito"
            name="municipio"
            value={formData.municipio}
            onChange={handleChange}
            error={errors.municipio}
            disabled={loading}
            placeholder="Municipio o distrito"
          />
        </div>
        <Input
          label="Área (hectáreas)"
          name="areaHectareas"
          type="number"
          min={0.01}
          step={0.01}
          value={formData.areaHectareas === 0 ? '' : formData.areaHectareas}
          onChange={handleChange}
          error={errors.areaHectareas}
          disabled={loading}
          placeholder="Ej. 5.5"
        />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Latitud (opcional)"
            name="latitud"
            type="number"
            step="any"
            value={formData.latitud ?? ''}
            onChange={handleChange}
            error={errors.latitud}
            disabled={loading}
            placeholder="Ej. -12.046"
          />
          <Input
            label="Longitud (opcional)"
            name="longitud"
            type="number"
            step="any"
            value={formData.longitud ?? ''}
            onChange={handleChange}
            error={errors.longitud}
            disabled={loading}
            placeholder="Ej. -77.042"
          />
        </div>
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
          {mode === 'create' ? 'Crear Parcela' : 'Guardar'}
        </Button>
      </div>
    </Modal>
  )
}
