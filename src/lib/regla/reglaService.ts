import { getApiBaseUrl } from '@/lib/api/config'
import type {
  Regla,
  CreateReglaData,
  UpdateReglaData,
  ReglaFilters,
  ReglaListResponse,
} from '@/types/regla'

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

function toRegla(raw: Record<string, unknown>): Regla {
  const id = String(raw._id ?? raw.id ?? '')
  return {
    _id: id,
    user: raw.user != null ? String(raw.user) : raw.userId != null ? String(raw.userId) : undefined,
    nombre: String(raw.nombre ?? ''),
    condicion: (raw.condicion as Regla['condicion']) ?? {},
    accion: (raw.accion as Regla['accion']) ?? {},
    activa: Boolean(raw.activa),
    observaciones: raw.observaciones != null ? String(raw.observaciones) : undefined,
    createdAt: toDate(raw.createdAt),
    updatedAt: toDate(raw.updatedAt),
  }
}

class ReglaService {
  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null
    const url = `${getApiBaseUrl()}/reglas${endpoint}`
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

  async getAll(filters?: ReglaFilters): Promise<ReglaListResponse> {
    const page = filters?.page ?? 1
    const limit = Math.min(filters?.limit ?? 20, 100)
    const qs = new URLSearchParams({ page: String(page), limit: String(limit) }).toString()
    const raw = await this.request<{ items?: unknown[]; total?: number; page?: number; limit?: number; totalPages?: number }>(`?${qs}`)
    const items = Array.isArray(raw?.items) ? raw.items : []
    const total = typeof raw?.total === 'number' ? raw.total : items.length
    return {
      data: items.map((item) => toRegla(item as Record<string, unknown>)),
      total,
      page: raw?.page ?? page,
      limit: raw?.limit ?? limit,
      totalPages: typeof raw?.totalPages === 'number' ? raw.totalPages : Math.ceil(total / limit),
    }
  }

  async getById(id: string): Promise<Regla> {
    const raw = await this.request<Record<string, unknown>>(`/${id}`)
    return toRegla(raw ?? {})
  }

  async create(data: CreateReglaData): Promise<Regla> {
    const raw = await this.request<Record<string, unknown>>('', {
      method: 'POST',
      body: JSON.stringify(data),
    })
    return toRegla(raw ?? {})
  }

  async update(id: string, data: UpdateReglaData): Promise<Regla> {
    const raw = await this.request<Record<string, unknown>>(`/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
    return toRegla(raw ?? {})
  }

  async delete(id: string): Promise<{ deleted: boolean }> {
    const raw = await this.request<{ deleted?: boolean }>(`/${id}`, { method: 'DELETE' })
    return { deleted: raw?.deleted ?? true }
  }
}

export const reglaService = new ReglaService()
export default reglaService
