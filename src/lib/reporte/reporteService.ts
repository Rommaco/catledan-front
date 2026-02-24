import { getApiBaseUrl } from '@/lib/api/config'
import {
  Reporte,
  CreateReporteData,
  UpdateReporteData,
  ReporteFilters,
  ReporteResponse,
  ReporteStats,
} from '@/types/reporte'

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

function toReporte(raw: Record<string, unknown>): Reporte {
  const id = String(raw._id ?? raw.id ?? '')
  return {
    _id: id,
    user: String(raw.user ?? raw.userId ?? ''),
    fecha: toFechaISO(raw.fecha),
    titulo: String(raw.titulo ?? ''),
    descripcion: String(raw.descripcion ?? ''),
    tipo: (raw.tipo as Reporte['tipo']) ?? 'general',
    datos: (raw.datos != null && typeof raw.datos === 'object' && !Array.isArray(raw.datos))
      ? (raw.datos as Record<string, unknown>)
      : {},
    createdBy: raw.createdBy != null ? (raw.createdBy as Reporte['createdBy']) : undefined,
    createdAt: toFechaISO(raw.createdAt),
    updatedAt: toFechaISO(raw.updatedAt),
  }
}

class ReporteService {
  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null
    const url = `${getApiBaseUrl()}/reportes${endpoint}`
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

  /** GET /reportes — Listar (backend devuelve { success, data: { data: items[], total } }) */
  async getAll(filters?: ReporteFilters): Promise<ReporteResponse> {
    const queryParams = new URLSearchParams()
    queryParams.set('page', String(filters?.page ?? 1))
    queryParams.set('limit', String(Math.min(filters?.limit ?? 20, 100)))
    if (filters?.search) queryParams.append('search', filters.search)
    if (filters?.tipo) queryParams.append('tipo', filters.tipo)
    if (filters?.startDate) queryParams.append('startDate', filters.startDate)
    if (filters?.endDate) queryParams.append('endDate', filters.endDate)
    const qs = queryParams.toString()
    const raw = await this.request<{ data?: unknown[]; total?: number }>(`?${qs}`)
    const list = Array.isArray(raw?.data) ? raw.data : []
    const total = typeof raw?.total === 'number' ? raw.total : list.length
    return {
      data: list.map((item) => toReporte(item as Record<string, unknown>)),
      total,
      page: filters?.page ?? 1,
      pages: Math.ceil(total / (filters?.limit ?? 20)) || 1,
    }
  }

  async getById(id: string): Promise<Reporte> {
    const raw = await this.request<Record<string, unknown>>(`/${id}`)
    return toReporte(raw ?? {})
  }

  async create(data: CreateReporteData): Promise<Reporte> {
    const raw = await this.request<Record<string, unknown>>('/', {
      method: 'POST',
      body: JSON.stringify(data),
    })
    return toReporte(raw ?? {})
  }

  async update(id: string, data: UpdateReporteData): Promise<Reporte> {
    const raw = await this.request<Record<string, unknown>>(`/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
    return toReporte(raw ?? {})
  }

  async delete(id: string): Promise<{ message: string }> {
    await this.request<unknown>(`/${id}`, { method: 'DELETE' })
    return { message: 'Eliminado' }
  }

  /** Estadísticas derivadas del listado (máx. 100 por limit del backend) */
  async getStats(): Promise<ReporteStats> {
    const { data } = await this.getAll({ page: 1, limit: 100 })
    const list = Array.isArray(data) ? data : []
    const totalReportes = list.length
    const reportesPorTipo = list.reduce((acc: Record<string, number>, r) => {
      const t = String(r.tipo || '')
      acc[t] = (acc[t] || 0) + 1
      return acc
    }, {})
    const reportesRecientes = [...list]
      .sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime())
      .slice(0, 5)
    return { totalReportes, reportesPorTipo, reportesRecientes }
  }
}

export const reporteService = new ReporteService()
export default reporteService
