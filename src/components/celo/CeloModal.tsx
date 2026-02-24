'use client'
import React, { useState, useEffect } from 'react'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { TextArea } from '@/components/ui/TextArea'
import type { Celo, CreateCeloData, UpdateCeloData } from '@/types/celo'
import type { Ganado } from '@/types/ganado'

interface CeloModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (data: CreateCeloData | UpdateCeloData) => Promise<void>
  celo?: Celo | null
  mode: 'create' | 'edit'
  loading?: boolean
  ganadoList?: Ganado[]
}

export const CeloModal: React.FC<CeloModalProps> = ({
  isOpen,
  onClose,
  onSave,
  celo,
  mode,
  loading = false,
  ganadoList = [],
}) => {
  const [ganado, setGanado] = useState('')
  const [fecha, setFecha] = useState(() => new Date().toISOString().split('T')[0])
  const [observaciones, setObservaciones] = useState('')

  useEffect(() => {
    if (isOpen) {
      if (mode === 'edit' && celo) {
        setGanado(celo.ganado ?? '')
        setFecha(celo.fecha ? celo.fecha.split('T')[0] : new Date().toISOString().split('T')[0])
        setObservaciones(celo.observaciones ?? '')
      } else {
        setGanado('')
        setFecha(new Date().toISOString().split('T')[0])
        setObservaciones('')
      }
    }
  }, [isOpen, mode, celo])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (mode === 'create' && !ganado.trim()) return
    const data: CreateCeloData | UpdateCeloData = mode === 'create'
      ? { ganado: ganado.trim(), fecha, observaciones: observaciones.trim() || undefined }
      : { fecha, observaciones: observaciones.trim() || undefined }
    await onSave(data)
    onClose()
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={mode === 'create' ? 'Registrar celo' : 'Editar celo'} size="md">
      <form onSubmit={handleSubmit} className="space-y-4 p-4">
        {mode === 'create' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Animal (hembra)</label>
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
          label="Fecha del celo"
          name="fecha"
          type="date"
          value={fecha}
          onChange={(e) => setFecha(e.target.value)}
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
            {mode === 'create' ? 'Registrar celo' : 'Guardar'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
