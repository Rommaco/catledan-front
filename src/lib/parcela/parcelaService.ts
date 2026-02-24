import { getApiBaseUrl } from '@/lib/api/config'
import type {
  Parcela,
  CreateParcelaData,
  UpdateParcelaData,
  ParcelaFilters,
  ParcelaListResponse,
} from '@/types/parcela'

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

function toParcela(raw: Record<string, unknown>): Parcela {
  const id = String(raw._id ?? raw.id ?? '')
  return {
    _id: id,
    user: raw.user != null ? String(raw.user) : raw.userId != null ? String(raw.userId) : undefined,
    nombre: String(raw.nombre ?? ''),
    direccion: raw.direccion != null ? String(raw.direccion) : undefined,
    region: String(raw.region ?? ''),
    estado: String(raw.estado ?? ''),
    municipio: String(raw.municipio ?? ''),
    areaHectareas: Number(raw.areaHectareas ?? 0),
    latitud: raw.latitud != null ? Number(raw.latitud) : undefined,
    longitud: raw.longitud != null ? Number(raw.longitud) : undefined,
    observaciones: raw.observaciones != null ? String(raw.observaciones) : undefined,
    createdAt: toDate(raw.createdAt),
    updatedAt: toDate(raw.updatedAt),
  }
}

class ParcelaService {
  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null
    const url = `${getApiBaseUrl()}/parcelas${endpoint}`
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

  /** GET /parcelas?page=&limit= — Lista paginada (backend devuelve { items, total, page, limit, totalPages }) */
  async getAll(filters?: ParcelaFilters): Promise<ParcelaListResponse> {
    const page = filters?.page ?? 1
    const limit = Math.min(filters?.limit ?? 20, 100)
    const qs = new URLSearchParams({ page: String(page), limit: String(limit) }).toString()
    const raw = await this.request<{ items?: unknown[]; total?: number; page?: number; limit?: number; totalPages?: number }>(`?${qs}`)
    const items = Array.isArray(raw?.items) ? raw.items : []
    const total = typeof raw?.total === 'number' ? raw.total : items.length
    return {
      data: items.map((item) => toParcela(item as Record<string, unknown>)),
      total,
      page: raw?.page ?? page,
      limit: raw?.limit ?? limit,
      totalPages: typeof raw?.totalPages === 'number' ? raw.totalPages : Math.ceil(total / limit),
    }
  }

  /** GET /parcelas/:id */
  async getById(id: string): Promise<Parcela> {
    const raw = await this.request<Record<string, unknown>>(`/${id}`)
    return toParcela(raw ?? {})
  }

  /** POST /parcelas */
  async create(data: CreateParcelaData): Promise<Parcela> {
    const raw = await this.request<Record<string, unknown>>('', {
      method: 'POST',
      body: JSON.stringify(data),
    })
    return toParcela(raw ?? {})
  }

  /** PUT /parcelas/:id */
  async update(id: string, data: UpdateParcelaData): Promise<Parcela> {
    const raw = await this.request<Record<string, unknown>>(`/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
    return toParcela(raw ?? {})
  }

  /** DELETE /parcelas/:id */
  async delete(id: string): Promise<{ deleted: boolean }> {
    const raw = await this.request<{ deleted?: boolean }>(`/${id}`, { method: 'DELETE' })
    return { deleted: raw?.deleted ?? true }
  }
}

export const parcelaService = new ParcelaService()
export default parcelaService
