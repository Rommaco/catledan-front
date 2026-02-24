'use client'
import React, { useState, useEffect, useCallback } from 'react'
import { Modal } from '@/components/ui/Modal'
import { Input } from '@/components/ui/Input'
import { TextArea } from '@/components/ui/TextArea'
import { Button } from '@/components/ui/Button'
import { CustomSelect } from '@/components/ui/CustomSelect'
import type { Regla, CreateReglaData, UpdateReglaData, CondicionRegla, AccionRegla } from '@/types/regla'

interface ReglaModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (data: CreateReglaData | UpdateReglaData) => Promise<void>
  regla?: Regla | null
  mode: 'create' | 'edit'
  loading?: boolean
}

const initialCondicion: CondicionRegla = { tipo: 'umbral', campo: '', operador: '<', valor: 0 }
const initialAccion: AccionRegla = { tipo: 'alerta', mensaje: '', crearAlerta: true, notificarEmail: false }

const OPERADORES = [
  { value: '<', label: 'Menor que (<)' },
  { value: '>', label: 'Mayor que (>)' },
  { value: '=', label: 'Igual (=)' },
  { value: '<=', label: 'Menor o igual (≤)' },
  { value: '>=', label: 'Mayor o igual (≥)' },
]

/** Dónde aplica la regla (módulo del menú que se vigila) */
const MODULOS_VIGILAR = [
  { value: 'insumos', label: 'Insumos (inventario de medicamentos, alimento, etc.)' },
  { value: 'ganado', label: 'Ganado (animales)' },
  { value: 'produccion-leche', label: 'Producción de leche' },
  { value: 'cultivos', label: 'Cultivos' },
  { value: 'parcelas', label: 'Parcelas' },
  { value: 'ventas', label: 'Ventas' },
  { value: 'otro', label: 'Otro (definir manualmente)' },
]

/** Qué dato vigilar según el módulo elegido */
const CAMPOS_POR_MODULO: Record<string, { value: string; label: string }[]> = {
  insumos: [
    { value: 'cantidad', label: 'Cantidad en stock' },
    { value: 'umbralMinimo', label: 'Umbral mínimo (alerta cuando baje de X)' },
  ],
  ganado: [
    { value: 'cantidad', label: 'Cantidad de animales' },
    { value: 'peso', label: 'Peso' },
  ],
  'produccion-leche': [
    { value: 'litros', label: 'Litros de leche' },
    { value: 'cantidad', label: 'Cantidad registrada' },
  ],
  cultivos: [
    { value: 'area', label: 'Área' },
    { value: 'cantidad', label: 'Cantidad' },
  ],
  parcelas: [
    { value: 'areaHectareas', label: 'Área (hectáreas)' },
    { value: 'cantidad', label: 'Cantidad de parcelas' },
  ],
  ventas: [
    { value: 'monto', label: 'Monto' },
    { value: 'cantidad', label: 'Cantidad de ventas' },
  ],
  otro: [],
}

const initialForm: CreateReglaData = {
  nombre: '',
  condicion: { ...initialCondicion },
  accion: { ...initialAccion },
  activa: true,
  observaciones: '',
}

export const ReglaModal: React.FC<ReglaModalProps> = ({
  isOpen,
  onClose,
  onSave,
  regla,
  mode,
  loading = false,
}) => {
  const [formData, setFormData] = useState<CreateReglaData>(initialForm)
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (isOpen) {
      if (mode === 'edit' && regla) {
        setFormData({
          nombre: regla.nombre,
          condicion: { ...initialCondicion, ...regla.condicion },
          accion: { ...initialAccion, ...regla.accion },
          activa: regla.activa,
          observaciones: regla.observaciones ?? '',
        })
      } else {
        setFormData(initialForm)
      }
      setErrors({})
    }
  }, [isOpen, mode, regla])

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const { name, value } = e.target
      const type = (e.target as HTMLInputElement).type
      if (name.startsWith('condicion.')) {
        const key = name.replace('condicion.', '')
        const numKeys = ['valor']
        const nextVal = numKeys.includes(key) && value !== '' ? Number(value) : value
        setFormData((prev) => ({
          ...prev,
          condicion: { ...prev.condicion, [key]: nextVal },
        }))
      } else if (name.startsWith('accion.')) {
        const key = name.replace('accion.', '')
        const nextVal = key === 'crearAlerta' || key === 'notificarEmail' ? (value === 'true' || value === 'on') : value
        setFormData((prev) => ({
          ...prev,
          accion: { ...prev.accion, [key]: nextVal },
        }))
      } else if (name === 'activa') {
        setFormData((prev) => ({ ...prev, activa: (e.target as HTMLInputElement).checked }))
      } else {
        setFormData((prev) => ({ ...prev, [name]: value }))
      }
      if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }))
    },
    [errors],
  )

  const validate = useCallback((): boolean => {
    const e: Record<string, string> = {}
    if (!formData.nombre?.trim()) e.nombre = 'El nombre es requerido'
    if (!formData.condicion?.modulo) e['condicion.modulo'] = 'Elige dónde debe revisar (ej: Insumos, Ganado)'
    if (!formData.condicion?.tipo?.trim()) e['condicion.tipo'] = 'Tipo de condición es requerido'
    const mod = formData.condicion?.modulo as string
    const camposOpciones = mod ? CAMPOS_POR_MODULO[mod] : []
    if (camposOpciones.length && !formData.condicion?.campo) e['condicion.campo'] = 'Elige qué dato vigilar'
    if ((!mod || mod === 'otro') && !formData.condicion?.campo?.toString()?.trim()) e['condicion.campo'] = 'Indica qué dato vigilar'
    if (!formData.accion?.tipo?.trim()) e['accion.tipo'] = 'Tipo de acción es requerido'
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

  const handleOperadorChange = useCallback((value: string | number) => {
    setFormData((prev) => ({
      ...prev,
      condicion: { ...prev.condicion, operador: String(value) },
    }))
  }, [])

  const handleModuloChange = useCallback((value: string | number) => {
    const v = String(value)
    setFormData((prev) => {
      const condicion = { ...prev.condicion, modulo: v }
      const campos = CAMPOS_POR_MODULO[v]
      if (campos?.length && !campos.some((c) => c.value === prev.condicion?.campo)) condicion.campo = campos[0].value
      if (v === 'otro') condicion.campo = ''
      return { ...prev, condicion }
    })
  }, [])

  const handleCampoChange = useCallback((value: string | number) => {
    setFormData((prev) => ({
      ...prev,
      condicion: { ...prev.condicion, campo: String(value) },
    }))
  }, [])

  const moduloActual = (formData.condicion?.modulo as string) || ''
  const opcionesCampo = moduloActual && CAMPOS_POR_MODULO[moduloActual]
  const mostrarCampoLibre = !opcionesCampo || opcionesCampo.length === 0

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={mode === 'create' ? 'Nueva regla de aviso' : 'Editar regla'}
      size="lg"
    >
      <div className="space-y-5 p-4">
        <p className="text-sm text-gray-600 bg-blue-50 border border-blue-100 rounded-lg p-3">
          Una regla le dice al sistema: <strong>“Cuando pase esto, avísame”</strong>. Por ejemplo: “Cuando la cantidad de un insumo baje de 10, muéstrame una alerta”.
        </p>

        <Input
          label="Nombre de la regla"
          name="nombre"
          value={formData.nombre}
          onChange={handleChange}
          error={errors.nombre}
          disabled={loading}
          placeholder="Ej: Aviso cuando falte alimento para el ganado"
          helper="Un nombre que te ayude a reconocerla después"
        />

        <div className="border border-gray-200 rounded-lg p-4 space-y-3 bg-amber-50/30">
          <h4 className="text-sm font-semibold text-gray-800">¿Cuándo quieres que avise?</h4>
          <p className="text-xs text-gray-600 -mt-1">Elige en qué parte del sistema debe revisar y qué valor vigilar.</p>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">¿Dónde quieres que revise?</label>
            <CustomSelect
              value={moduloActual || ''}
              onChange={handleModuloChange}
              options={[{ value: '', label: 'Elige una sección del menú...' }, ...MODULOS_VIGILAR]}
              disabled={loading}
              placeholder="Elige una sección"
              error={errors['condicion.modulo']}
            />
            <p className="text-xs text-gray-500 mt-1">Es la misma sección que ves en el menú: Insumos, Ganado, Ventas, etc.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Input
              label="Tipo de condición"
              name="condicion.tipo"
              value={formData.condicion?.tipo ?? ''}
              onChange={handleChange}
              disabled={loading}
              placeholder="Ej: umbral (cuando un número pase un límite)"
            />
            {mostrarCampoLibre ? (
              <Input
                label="¿Qué dato vigilar?"
                name="condicion.campo"
                value={formData.condicion?.campo ?? ''}
                onChange={handleChange}
                disabled={loading}
                placeholder="Ej: cantidad, peso, litros..."
                error={errors['condicion.campo']}
                helper={moduloActual === 'otro' ? 'Escribe el nombre del dato que quieres vigilar' : 'Primero elige arriba «Dónde revisar»'}
              />
            ) : (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">¿Qué dato vigilar?</label>
                <CustomSelect
                  value={formData.condicion?.campo ?? ''}
                  onChange={handleCampoChange}
                  options={opcionesCampo}
                  disabled={loading}
                  placeholder="Elige el dato"
                  error={errors['condicion.campo']}
                />
                <p className="text-xs text-gray-500 mt-1">Dato que el sistema revisará en {MODULOS_VIGILAR.find((m) => m.value === moduloActual)?.label?.split(' ')[0] ?? moduloActual}.</p>
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">¿Qué comparación usar?</label>
              <CustomSelect
                value={formData.condicion?.operador ?? '<'}
                onChange={handleOperadorChange}
                options={OPERADORES}
                disabled={loading}
                placeholder="Elige una"
              />
            </div>
            <Input
              label="¿A partir de qué número?"
              name="condicion.valor"
              type="number"
              value={formData.condicion?.valor ?? ''}
              onChange={handleChange}
              disabled={loading}
              placeholder="Ej: 10"
              helper="Ej: si pones 10 y «menor que», avisará cuando baje de 10"
            />
          </div>
        </div>

        <div className="border border-gray-200 rounded-lg p-4 space-y-3 bg-green-50/30">
          <h4 className="text-sm font-semibold text-gray-800">¿Qué hacer cuando pase?</h4>
          <p className="text-xs text-gray-600 -mt-1">Cuando se cumpla la condición, el sistema puede mostrarte una alerta y, si quieres, enviarte un correo.</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Input
              label="Tipo de acción"
              name="accion.tipo"
              value={formData.accion?.tipo ?? ''}
              onChange={handleChange}
              disabled={loading}
              placeholder="Ej: alerta"
            />
            <div className="md:col-span-2">
              <Input
                label="Mensaje que verás en la alerta"
                name="accion.mensaje"
                value={formData.accion?.mensaje ?? ''}
                onChange={handleChange}
                disabled={loading}
                placeholder="Ej: El insumo está por debajo del mínimo. Revisar stock."
              />
            </div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                name="accion.crearAlerta"
                checked={Boolean(formData.accion?.crearAlerta)}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    accion: { ...prev.accion, crearAlerta: e.target.checked },
                  }))
                }
                disabled={loading}
                className="rounded border-gray-300 text-green-600"
              />
              <span className="text-sm text-gray-700">Mostrar alerta en el sistema</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                name="accion.notificarEmail"
                checked={Boolean(formData.accion?.notificarEmail)}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    accion: { ...prev.accion, notificarEmail: e.target.checked },
                  }))
                }
                disabled={loading}
                className="rounded border-gray-300 text-green-600"
              />
              <span className="text-sm text-gray-700">Enviar también un correo electrónico</span>
            </label>
          </div>
        </div>

        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            name="activa"
            checked={formData.activa}
            onChange={handleChange}
            disabled={loading}
            className="rounded border-gray-300 text-green-600"
          />
          <span className="text-sm font-medium text-gray-700">Activar la regla ahora</span>
        </label>
        <p className="text-xs text-gray-500 -mt-2 ml-6">Si la desmarcas, la regla se guarda pero no estará vigente hasta que la actives.</p>

        <TextArea
          label="Notas (opcional)"
          name="observaciones"
          value={formData.observaciones ?? ''}
          onChange={handleChange}
          disabled={loading}
          rows={2}
          placeholder="Cualquier comentario o recordatorio para ti o tu equipo"
        />
      </div>
      <div className="flex justify-end gap-2 pt-4 border-t border-gray-200 px-4 pb-4">
        <Button variant="secondary" onClick={onClose} disabled={loading}>
          Cancelar
        </Button>
        <Button variant="primary" onClick={handleSubmit} loading={loading}>
          {mode === 'create' ? 'Crear Regla' : 'Guardar'}
        </Button>
      </div>
    </Modal>
  )
}
