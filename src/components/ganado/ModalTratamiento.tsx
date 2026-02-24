'use client'
import React, { useState, useEffect } from 'react'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { ganadoService } from '@/lib/ganado/ganadoService'

interface ModalTratamientoProps {
  isOpen: boolean
  onClose: () => void
  ganadoId: string
  onSuccess: () => void
}

export function ModalTratamiento({ isOpen, onClose, ganadoId, onSuccess }: ModalTratamientoProps) {
  const [fecha, setFecha] = useState(() => new Date().toISOString().split('T')[0])
  const [tipo, setTipo] = useState('')
  const [producto, setProducto] = useState('')
  const [dosis, setDosis] = useState('')
  const [observaciones, setObservaciones] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (isOpen) {
      setFecha(new Date().toISOString().split('T')[0])
      setTipo('')
      setProducto('')
      setDosis('')
      setObservaciones('')
      setError('')
    }
  }, [isOpen])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (!tipo.trim()) {
      setError('El tipo de tratamiento es obligatorio.')
      return
    }
    if (!producto.trim()) {
      setError('El producto es obligatorio.')
      return
    }
    setLoading(true)
    try {
      await ganadoService.postTratamiento(ganadoId, {
        fecha,
        tipo: tipo.trim(),
        producto: producto.trim(),
        dosis: dosis.trim(),
        observaciones: observaciones.trim(),
      })
      onSuccess()
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al registrar el tratamiento.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Registrar tratamiento" size="md">
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
          <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de tratamiento</label>
          <input
            type="text"
            value={tipo}
            onChange={(e) => setTipo(e.target.value)}
            placeholder="Ej. Antiparasitario, Antibiótico"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 text-gray-900 bg-white"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Producto</label>
          <input
            type="text"
            value={producto}
            onChange={(e) => setProducto(e.target.value)}
            placeholder="Nombre del medicamento o producto"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 text-gray-900 bg-white"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Dosis (opcional)</label>
          <input
            type="text"
            value={dosis}
            onChange={(e) => setDosis(e.target.value)}
            placeholder="Ej. 5 ml, 1 tableta"
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
            {loading ? 'Guardando…' : 'Registrar tratamiento'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
