import { getApiBaseUrl } from '@/lib/api/config'
import type { Alerta, CreateAlertaData, AlertaFilters, AlertaListResponse } from '@/types/alerta'

interface ApiBody<T = unknown> {
  success?: boolean
  data?: T
  error?: { message?: string }
}

function toDate(v: unknown): string {
  if (v == null) return ''
  if (typeof v === 'string') return v
  if (typeof (v as Date).toISOString === 'function') return (v as Date).toISOString()
  return String(v)
}

function toAlerta(raw: Record<string, unknown>): Alerta {
  const id = String(raw._id ?? raw.id ?? '')
  return {
    _id: id,
    user: raw.user != null ? String(raw.user) : raw.userId != null ? String(raw.userId) : undefined,
    tipo: String(raw.tipo ?? ''),
    titulo: String(raw.titulo ?? ''),
    mensaje: String(raw.mensaje ?? ''),
    leido: Boolean(raw.leido),
    metadata: raw.metadata as Record<string, unknown> | undefined,
    createdAt: toDate(raw.createdAt),
    updatedAt: toDate(raw.updatedAt),
  }
}

class AlertaService {
  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null
    const url = `${getApiBaseUrl()}/alertas${endpoint}`
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
    return (json.data ?? json) as T
  }

  /** GET /alertas?page=&limit=&leido= — Backend devuelve { alertas, total, page, limit, totalPages } */
  async getAll(filters?: AlertaFilters): Promise<AlertaListResponse> {
    const page = filters?.page ?? 1
    const limit = Math.min(filters?.limit ?? 20, 100)
    const params = new URLSearchParams({ page: String(page), limit: String(limit) })
    if (typeof filters?.leido === 'boolean') params.set('leido', String(filters.leido))
    const raw = await this.request<{
      alertas?: unknown[]
      total?: number
      page?: number
      limit?: number
      totalPages?: number
    }>(`?${params.toString()}`)
    const items = Array.isArray(raw?.alertas) ? raw.alertas : []
    const total = typeof raw?.total === 'number' ? raw.total : items.length
    return {
      data: items.map((item) => toAlerta(item as Record<string, unknown>)),
      total,
      page: raw?.page ?? page,
      limit: raw?.limit ?? limit,
      totalPages: typeof raw?.totalPages === 'number' ? raw.totalPages : Math.ceil(total / limit),
    }
  }

  /** POST /alertas */
  async create(data: CreateAlertaData): Promise<{ id: string; message: string }> {
    const raw = await this.request<{ id?: string; message?: string }>('', {
      method: 'POST',
      body: JSON.stringify(data),
    })
    return { id: raw?.id ?? '', message: raw?.message ?? 'Alerta creada' }
  }

  /** PUT /alertas/:id/leer — Backend devuelve { alerta } con id/userId */
  async markAsRead(id: string): Promise<Alerta> {
    const raw = await this.request<{ alerta?: Record<string, unknown> }>(`/${id}/leer`, {
      method: 'PUT',
    })
    const one = raw?.alerta ?? raw
    return toAlerta((one as Record<string, unknown>) ?? {})
  }
}

export const alertaService = new AlertaService()
export default alertaService
