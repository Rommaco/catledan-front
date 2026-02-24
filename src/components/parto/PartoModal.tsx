'use client'
import React, { useState, useEffect } from 'react'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { TextArea } from '@/components/ui/TextArea'
import type { Parto, CreatePartoData, UpdatePartoData } from '@/types/parto'
import type { Ganado } from '@/types/ganado'

interface PartoModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (data: CreatePartoData | UpdatePartoData) => Promise<void>
  parto?: Parto | null
  mode: 'create' | 'edit'
  loading?: boolean
  ganadoList?: Ganado[]
}

const TIPOS_PARTO = [
  { value: 'normal', label: 'Normal' },
  { value: 'cesarea', label: 'Cesárea' },
  { value: 'asistido', label: 'Asistido' },
]

export const PartoModal: React.FC<PartoModalProps> = ({
  isOpen,
  onClose,
  onSave,
  parto,
  mode,
  loading = false,
  ganadoList = [],
}) => {
  const [ganado, setGanado] = useState('')
  const [fecha, setFecha] = useState(() => new Date().toISOString().split('T')[0])
  const [tipoParto, setTipoParto] = useState('normal')
  const [numeroCrias, setNumeroCrias] = useState(1)
  const [observaciones, setObservaciones] = useState('')

  useEffect(() => {
    if (isOpen) {
      if (mode === 'edit' && parto) {
        setGanado(parto.ganado ?? '')
        setFecha(parto.fecha ? parto.fecha.split('T')[0] : new Date().toISOString().split('T')[0])
        setTipoParto(parto.tipoParto ?? 'normal')
        setNumeroCrias(parto.numeroCrias ?? 1)
        setObservaciones(parto.observaciones ?? '')
      } else {
        setGanado('')
        setFecha(new Date().toISOString().split('T')[0])
        setTipoParto('normal')
        setNumeroCrias(1)
        setObservaciones('')
      }
    }
  }, [isOpen, mode, parto])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (mode === 'create' && !ganado.trim()) return
    const data: CreatePartoData | UpdatePartoData = mode === 'create'
      ? { ganado: ganado.trim(), fecha, tipoParto, numeroCrias, observaciones: observaciones.trim() || undefined }
      : { fecha, tipoParto, numeroCrias, observaciones: observaciones.trim() || undefined }
    await onSave(data)
    onClose()
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={mode === 'create' ? 'Registrar parto' : 'Editar parto'} size="md">
      <form onSubmit={handleSubmit} className="space-y-4 p-4">
        {mode === 'create' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Madre (animal)</label>
            <select
              value={ganado}
              onChange={(e) => setGanado(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-gray-900 bg-white"
              required
              disabled={loading}
            >
              <option value="">— Seleccionar —</option>
              {ganadoList.map((g) => {
                const id = (g as Ganado & { id?: string }).id ?? g._id
                return (
                  <option key={id} value={id}>{g.nombre} ({g.numeroIdentificacion})</option>
                )
              })}
            </select>
          </div>
        )}
        <Input
          label="Fecha del parto"
          name="fecha"
          type="date"
          value={fecha}
          onChange={(e) => setFecha(e.target.value)}
          disabled={loading}
        />
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de parto</label>
          <select
            value={tipoParto}
            onChange={(e) => setTipoParto(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-gray-900 bg-white"
            disabled={loading}
          >
            {TIPOS_PARTO.map((t) => (
              <option key={t.value} value={t.value}>{t.label}</option>
            ))}
          </select>
        </div>
        <Input
          label="Número de crías"
          name="numeroCrias"
          type="number"
          min={1}
          value={String(numeroCrias)}
          onChange={(e) => setNumeroCrias(parseInt(e.target.value, 10) || 1)}
          disabled={loading}
        />
        <TextArea
          label="Observaciones"
          name="observaciones"
          value={observaciones}
          onChange={(e) => setObservaciones(e.target.value)}
          disabled={loading}
          rows={2}
          placeholder="Notas adicionales"
        />
        <div className="flex justify-end gap-2 pt-4 border-t border-gray-200">
          <Button variant="secondary" type="button" onClick={onClose} disabled={loading}>Cancelar</Button>
          <Button variant="primary" type="submit" loading={loading}>
            {mode === 'create' ? 'Registrar parto' : 'Guardar'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
