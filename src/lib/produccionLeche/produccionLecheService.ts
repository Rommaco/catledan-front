import { getApiBaseUrl } from '@/lib/api/config'
import {
  ProduccionLeche,
  CreateProduccionLecheData,
  UpdateProduccionLecheData,
  ProduccionLecheFilters,
  ProduccionLecheResponse,
} from '@/types/produccionLeche'

/** Convierte valor a fecha ISO o cadena vacía si no es válida. */
function toFechaISO(value: unknown): string {
  if (value == null) return ''
  if (typeof value === 'string') return value
  if (typeof value === 'number') {
    const d = new Date(value)
    return Number.isNaN(d.getTime()) ? '' : d.toISOString()
  }
  if (value instanceof Date) return Number.isNaN(value.getTime()) ? '' : value.toISOString()
  return ''
}

/** Normaliza un ítem del backend (puede venir con id o _id) al tipo del front. */
function toProduccionLeche(raw: Record<string, unknown>): ProduccionLeche {
  const id = String(raw.id ?? raw._id ?? '')
  const cantidad = Number(raw.cantidad)
  return {
    _id: id,
    user: String(raw.user ?? raw.userId ?? ''),
    fecha: toFechaISO(raw.fecha),
    cantidad: Number.isNaN(cantidad) || cantidad < 0 ? 0 : cantidad,
    observaciones: raw.observaciones != null && raw.observaciones !== '' ? String(raw.observaciones) : undefined,
    createdAt: toFechaISO(raw.createdAt),
    updatedAt: toFechaISO(raw.updatedAt),
  }
}

/** Extrae data de la respuesta estándar del backend { success, data } y lanza si hay error. */
async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${getApiBaseUrl()}${endpoint}`
  const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null
  const config: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
    ...options,
  }
  const response = await fetch(url, config)
  const json = await response.json().catch(() => ({})) as { success?: boolean; data?: T; error?: { message?: string }; message?: string }
  if (!response.ok) {
    const msg = json?.error?.message ?? json?.message ?? `Error en la solicitud: ${response.status}`
    throw new Error(msg)
  }
  return json.data as T
}

/** GET /produccion-leche — Lista con paginación. Backend devuelve { success, data: { data: items[], total } } */
async function getAll(filters?: ProduccionLecheFilters): Promise<ProduccionLecheResponse> {
  const queryParams = new URLSearchParams()
  if (filters?.page) queryParams.append('page', String(filters.page))
  if (filters?.limit) queryParams.append('limit', String(filters.limit))
  if (filters?.startDate) queryParams.append('startDate', filters.startDate)
  if (filters?.endDate) queryParams.append('endDate', filters.endDate)
  if (filters?.search) queryParams.append('search', filters.search)

  const endpoint = `/produccion-leche${queryParams.toString() ? `?${queryParams.toString()}` : ''}`
  const res = await request<{ data?: unknown[]; total?: number }>(endpoint)
  const items = Array.isArray(res?.data) ? res.data : []
  const total = typeof res?.total === 'number' ? res.total : 0
  const data = items.map((d) => toProduccionLeche(d as Record<string, unknown>))
  return { data, total }
}

/** GET /produccion-leche/:id — Uno por ID */
async function getById(id: string): Promise<ProduccionLeche> {
  const raw = await request<Record<string, unknown>>(`/produccion-leche/${id}`)
  return toProduccionLeche(raw ?? {})
}

/** POST /produccion-leche — Crear */
async function create(data: CreateProduccionLecheData): Promise<ProduccionLeche> {
  const raw = await request<Record<string, unknown>>('/produccion-leche', {
    method: 'POST',
    body: JSON.stringify(data),
  })
  return toProduccionLeche(raw ?? {})
}

/** PUT /produccion-leche/:id — Actualizar */
async function update(id: string, data: UpdateProduccionLecheData): Promise<ProduccionLeche> {
  const raw = await request<Record<string, unknown>>(`/produccion-leche/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  })
  return toProduccionLeche(raw ?? {})
}

/** DELETE /produccion-leche/:id — Eliminar */
async function deleteById(id: string): Promise<void> {
  await request<unknown>(`/produccion-leche/${id}`, { method: 'DELETE' })
}

/** GET /produccion-leche/stats — Estadísticas. Backend devuelve { total (litros), promedio, cantidad (registros) } */
async function getStats(): Promise<{
  total: number
  promedioDiario: number
  totalLitros: number
  porMes: Record<string, number>
}> {
  const res = await request<{ total?: number; promedio?: number; cantidad?: number; porMes?: Record<string, number> }>('/produccion-leche/stats')
  const totalLitros = typeof res?.total === 'number' ? res.total : 0
  const cantidad = typeof res?.cantidad === 'number' ? res.cantidad : 0
  const promedio = typeof res?.promedio === 'number' ? res.promedio : 0
  return {
    total: cantidad,
    promedioDiario: promedio,
    totalLitros,
    porMes: res?.porMes && typeof res.porMes === 'object' ? res.porMes : {},
  }
}

class ProduccionLecheService {
  getAll = getAll
  getById = getById
  create = create
  update = update
  delete = deleteById
  getStats = getStats
}

export const produccionLecheService = new ProduccionLecheService()
export default produccionLecheService
