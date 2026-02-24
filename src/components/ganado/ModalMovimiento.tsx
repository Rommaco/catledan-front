'use client'
import React, { useState, useEffect } from 'react'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { ganadoService } from '@/lib/ganado/ganadoService'

const TIPOS_MOVIMIENTO = [
  { value: 'ingreso', label: 'Ingreso' },
  { value: 'venta', label: 'Venta' },
  { value: 'muerte', label: 'Muerte' },
  { value: 'cambio_ubicacion', label: 'Cambio de ubicación' },
  { value: 'traslado', label: 'Traslado' },
  { value: 'otro', label: 'Otro' },
] as const

interface ModalMovimientoProps {
  isOpen: boolean
  onClose: () => void
  ganadoId: string
  onSuccess: () => void
}

export function ModalMovimiento({ isOpen, onClose, ganadoId, onSuccess }: ModalMovimientoProps) {
  const [fecha, setFecha] = useState(() => new Date().toISOString().split('T')[0])
  const [tipo, setTipo] = useState<string>('ingreso')
  const [origen, setOrigen] = useState('')
  const [destino, setDestino] = useState('')
  const [observaciones, setObservaciones] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (isOpen) {
      setFecha(new Date().toISOString().split('T')[0])
      setTipo('ingreso')
      setOrigen('')
      setDestino('')
      setObservaciones('')
      setError('')
    }
  }, [isOpen])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await ganadoService.postMovimiento(ganadoId, {
        fecha,
        tipo,
        origen: origen.trim(),
        destino: destino.trim(),
        observaciones: observaciones.trim(),
      })
      onSuccess()
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al crear el movimiento.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Crear movimiento" size="md">
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{error}</p>
        )}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Fecha</label>
          <input
            type="date"
            value={fecha}
            onChange={(e) => setFecha(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 text-gray-900 bg-white"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de movimiento</label>
          <select
            value={tipo}
            onChange={(e) => setTipo(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 text-gray-900 bg-white"
          >
            {TIPOS_MOVIMIENTO.map((t) => (
              <option key={t.value} value={t.value}>{t.label}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Origen (opcional)</label>
          <input
            type="text"
            value={origen}
            onChange={(e) => setOrigen(e.target.value)}
            placeholder="Ej. Corral Norte, Finca A"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 text-gray-900 bg-white"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Destino (opcional)</label>
          <input
            type="text"
            value={destino}
            onChange={(e) => setDestino(e.target.value)}
            placeholder="Ej. Corral Sur, Comprador"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 text-gray-900 bg-white"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Observaciones (opcional)</label>
          <textarea
            value={observaciones}
            onChange={(e) => setObservaciones(e.target.value)}
            placeholder="Notas adicionales"
            rows={2}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 text-gray-900 bg-white resize-none"
          />
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="secondary" onClick={onClose}>Cancelar</Button>
          <Button type="submit" variant="primary" disabled={loading}>
            {loading ? 'Guardando…' : 'Crear movimiento'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
