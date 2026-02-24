import { getApiBaseUrl } from '@/lib/api/config'
import {
  Finanza,
  CreateFinanzaData,
  UpdateFinanzaData,
  FinanzaFilters,
  FinanzaResponse,
  FinanzaStats,
} from '@/types/finanza'

/** Respuesta cruda del backend: { success, data?, error? } */
interface ApiBody<T = unknown> {
  success?: boolean
  data?: T
  error?: { message?: string }
}

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

function toFinanza(raw: Record<string, unknown>): Finanza {
  const id = String(raw._id ?? raw.id ?? '')
  const monto = Number(raw.monto)
  return {
    _id: id,
    user: String(raw.user ?? raw.userId ?? ''),
    fecha: toFechaISO(raw.fecha),
    tipo: (raw.tipo as Finanza['tipo']) ?? 'gasto',
    categoria: String(raw.categoria ?? ''),
    descripcion: String(raw.descripcion ?? ''),
    monto: Number.isNaN(monto) ? 0 : monto,
    estado: (raw.estado as Finanza['estado']) ?? 'pendiente',
    lote: raw.lote != null ? String(raw.lote) : undefined,
    cantidad: raw.cantidad != null ? Number(raw.cantidad) : undefined,
    unidad: raw.unidad != null ? String(raw.unidad) : undefined,
    proveedor: raw.proveedor != null ? String(raw.proveedor) : undefined,
    responsable: raw.responsable != null ? String(raw.responsable) : undefined,
    observaciones: raw.observaciones != null ? String(raw.observaciones) : undefined,
    createdBy: raw.createdBy != null ? (raw.createdBy as Finanza['createdBy']) : undefined,
    createdAt: toFechaISO(raw.createdAt),
    updatedAt: toFechaISO(raw.updatedAt),
  }
}

class FinanzaService {
  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null
    const url = `${getApiBaseUrl()}/finanzas${endpoint}`
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
      ...options,
    }
    const response = await fetch(url, config)
    const json = (await response.json().catch(() => ({}))) as ApiBody<T>
    const errMsg =
      json?.error?.message ?? (json as { message?: string })?.message ?? `Error: ${response.status}`
    if (!response.ok) throw new Error(errMsg)
    if (json.success === false) throw new Error(errMsg || 'Error en el servidor')
    return (json.data ?? {}) as T
  }

  /** GET /finanzas — Listar (backend devuelve { success, data: { data: items[], total } }) */
  async getAll(filters?: FinanzaFilters): Promise<FinanzaResponse> {
    const queryParams = new URLSearchParams()
    queryParams.set('page', String(filters?.page ?? 1))
    queryParams.set('limit', String(Math.min(filters?.limit ?? 20, 100)))
    if (filters?.search) queryParams.append('search', filters.search)
    if (filters?.tipo) queryParams.append('tipo', filters.tipo)
    if (filters?.categoria) queryParams.append('categoria', filters.categoria)
    if (filters?.estado) queryParams.append('estado', filters.estado)
    if (filters?.startDate) queryParams.append('startDate', filters.startDate)
    if (filters?.endDate) queryParams.append('endDate', filters.endDate)
    const qs = queryParams.toString()
    const raw = await this.request<{ data?: unknown[]; total?: number }>(`?${qs}`)
    const list = Array.isArray(raw?.data) ? raw.data : []
    const total = typeof raw?.total === 'number' ? raw.total : list.length
    const limit = Math.min(filters?.limit ?? 20, 100)
    const page = filters?.page ?? 1
    return {
      data: list.map((item) => toFinanza(item as Record<string, unknown>)),
      total,
      page,
      pages: Math.ceil(total / limit) || 1,
    }
  }

  async getById(id: string): Promise<Finanza> {
    const raw = await this.request<Record<string, unknown>>(`/${id}`)
    return toFinanza(raw ?? {})
  }

  async create(data: CreateFinanzaData): Promise<Finanza> {
    const raw = await this.request<Record<string, unknown>>('/', {
      method: 'POST',
      body: JSON.stringify(data),
    })
    return toFinanza(raw ?? {})
  }

  async update(id: string, data: UpdateFinanzaData): Promise<Finanza> {
    const raw = await this.request<Record<string, unknown>>(`/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
    return toFinanza(raw ?? {})
  }

  async delete(id: string): Promise<{ message: string }> {
    await this.request<unknown>(`/${id}`, { method: 'DELETE' })
    return { message: 'Eliminado' }
  }

  /** Estadísticas derivadas del listado (backend limit máx 100) */
  async getStats(): Promise<FinanzaStats> {
    const { data } = await this.getAll({ page: 1, limit: 100 })
    const list = Array.isArray(data) ? data : []
    const totalIngresos = list
      .filter((f) => f.tipo === 'ingreso')
      .reduce((sum, f) => sum + (Number(f.monto) || 0), 0)
    const totalGastos = list
      .filter((f) => f.tipo === 'gasto')
      .reduce((sum, f) => sum + (Number(f.monto) || 0), 0)
    const balance = totalIngresos - totalGastos
    const transaccionesCompletadas = list.filter((f) => f.estado === 'completado').length
    const transaccionesPendientes = list.filter((f) => f.estado === 'pendiente').length
    const transaccionesCanceladas = list.filter((f) => f.estado === 'cancelado').length
    const ingresosPorCategoria = list
      .filter((f) => f.tipo === 'ingreso')
      .reduce((acc: Record<string, number>, f) => {
        const c = String(f.categoria || '')
        acc[c] = (acc[c] || 0) + (Number(f.monto) || 0)
        return acc
      }, {})
    const gastosPorCategoria = list
      .filter((f) => f.tipo === 'gasto')
      .reduce((acc: Record<string, number>, f) => {
        const c = String(f.categoria || '')
        acc[c] = (acc[c] || 0) + (Number(f.monto) || 0)
        return acc
      }, {})
    return {
      totalIngresos,
      totalGastos,
      balance,
      transaccionesCompletadas,
      transaccionesPendientes,
      transaccionesCanceladas,
      ingresosPorCategoria,
      gastosPorCategoria,
    }
  }
}

export const finanzaService = new FinanzaService()
export default finanzaService
