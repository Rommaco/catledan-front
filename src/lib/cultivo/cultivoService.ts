import { getApiBaseUrl } from '@/lib/api/config'
import {
  Cultivo,
  CreateCultivoData,
  UpdateCultivoData,
  CultivoFilters,
  CultivoResponse,
} from '@/types/cultivo'

/** Respuesta cruda del backend: { success, data?, error? } */
interface ApiBody<T = unknown> {
  success?: boolean
  data?: T
  error?: { message?: string }
}

/** Entidad que puede venir con id o _id, userId o user (backend devuelve CultivoEntity) */
function toCultivo(raw: Record<string, unknown>): Cultivo {
  const id = (raw._id ?? raw.id) as string
  const user = (raw.user ?? raw.userId) as string
  const toDate = (v: unknown): string =>
    v == null ? '' : typeof v === 'string' ? v : (v as Date).toISOString?.() ?? String(v)
  return {
    _id: String(id),
    user: String(user),
    nombre: String(raw.nombre ?? ''),
    tipo: String(raw.tipo ?? ''),
    area: Number(raw.area ?? 0),
    fechaSiembra: toDate(raw.fechaSiembra),
    fechaCosecha: raw.fechaCosecha != null ? toDate(raw.fechaCosecha) : undefined,
    variedad: raw.variedad != null ? String(raw.variedad) : undefined,
    densidadSiembra: raw.densidadSiembra != null ? Number(raw.densidadSiembra) : undefined,
    fertilizacion: Array.isArray(raw.fertilizacion) ? raw.fertilizacion as Cultivo['fertilizacion'] : undefined,
    riego: raw.riego != null ? (raw.riego as Cultivo['riego']) : undefined,
    plagas: Array.isArray(raw.plagas) ? raw.plagas as Cultivo['plagas'] : undefined,
    rendimientoEsperado: raw.rendimientoEsperado != null ? Number(raw.rendimientoEsperado) : undefined,
    rendimientoReal: raw.rendimientoReal != null ? Number(raw.rendimientoReal) : undefined,
    estado: (raw.estado as Cultivo['estado']) ?? 'sembrado',
    observaciones: raw.observaciones != null ? String(raw.observaciones) : undefined,
    createdAt: toDate(raw.createdAt),
    updatedAt: toDate(raw.updatedAt),
  }
}

class CultivoService {
  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null
    const url = `${getApiBaseUrl()}${endpoint}`
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
      json?.error?.message ?? (json as { message?: string })?.message ?? `Error en la solicitud: ${response.status}`
    if (!response.ok) throw new Error(errMsg)
    if (json.success === false) throw new Error(errMsg || 'Error en el servidor')
    return (json.data ?? {}) as T
  }

  /** GET /cultivos — Listar (backend devuelve { success, data: { data: items[], total } }) */
  async getAll(filters?: CultivoFilters): Promise<CultivoResponse> {
    const queryParams = new URLSearchParams()
    queryParams.set('page', String(filters?.page ?? 1))
    queryParams.set('limit', String(filters?.limit ?? 20))
    if (filters?.search) queryParams.append('search', filters.search)
    if (filters?.tipo) queryParams.append('tipo', filters.tipo)
    if (filters?.estado) queryParams.append('estado', filters.estado)
    if (filters?.startDate) queryParams.append('startDate', filters.startDate)
    if (filters?.endDate) queryParams.append('endDate', filters.endDate)
    const qs = queryParams.toString()
    const endpoint = `/cultivos?${qs}`

    const raw = await this.request<{ data?: unknown[]; total?: number }>(endpoint)
    const list = Array.isArray(raw?.data) ? raw.data : []
    const total = typeof raw?.total === 'number' ? raw.total : list.length
    return {
      data: list.map((item) => toCultivo(item as Record<string, unknown>)),
      total,
    }
  }

  async getById(id: string): Promise<Cultivo> {
    const raw = await this.request<Record<string, unknown>>(`/cultivos/${id}`)
    return toCultivo(raw ?? {})
  }

  async create(data: CreateCultivoData): Promise<Cultivo> {
    const raw = await this.request<Record<string, unknown>>('/cultivos', {
      method: 'POST',
      body: JSON.stringify(data),
    })
    return toCultivo(raw ?? {})
  }

  async update(id: string, data: UpdateCultivoData): Promise<Cultivo> {
    const raw = await this.request<Record<string, unknown>>(`/cultivos/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
    return toCultivo(raw ?? {})
  }

  async delete(id: string): Promise<{ message: string }> {
    await this.request<unknown>(`/cultivos/${id}`, { method: 'DELETE' })
    return { message: 'Eliminado' }
  }

  /** Estadísticas derivadas del listado (no hay endpoint /cultivos/stats) */
  async getStats(): Promise<{
    total: number
    totalArea: number
    porTipo: Record<string, number>
    porEstado: Record<string, number>
  }> {
    // Backend solo permite limit ≤ 100
    const { data } = await this.getAll({ page: 1, limit: 100 })
    const list = Array.isArray(data) ? data : []
    const total = list.length
    const totalArea = list.reduce((sum, c) => sum + (Number(c.area) || 0), 0)
    const porTipo = list.reduce((acc, c) => {
      const t = String(c.tipo || '')
      acc[t] = (acc[t] || 0) + 1
      return acc
    }, {} as Record<string, number>)
    const porEstado = list.reduce((acc, c) => {
      const e = String(c.estado || '')
      acc[e] = (acc[e] || 0) + 1
      return acc
    }, {} as Record<string, number>)
    return { total, totalArea, porTipo, porEstado }
  }
}

export const cultivoService = new CultivoService()
export default cultivoService
