import { getApiBaseUrl } from '@/lib/api/config'

function toParto(raw: Record<string, unknown>) {
  const id = String(raw._id ?? raw.id ?? '')
  return {
    _id: id,
    user: raw.user != null ? String(raw.user) : undefined,
    ganado: raw.ganado != null ? String(raw.ganado) : undefined,
    fecha: raw.fecha != null ? String(raw.fecha) : undefined,
    tipoParto: raw.tipoParto != null ? String(raw.tipoParto) : undefined,
    numeroCrias: raw.numeroCrias != null ? Number(raw.numeroCrias) : undefined,
    observaciones: raw.observaciones != null ? String(raw.observaciones) : undefined,
    createdAt: raw.createdAt != null ? String(raw.createdAt) : undefined,
    updatedAt: raw.updatedAt != null ? String(raw.updatedAt) : undefined,
  }
}

class PartoService {
  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null
    const url = `${getApiBaseUrl()}/partos${endpoint}`
    const res = await fetch(url, {
      headers: { 'Content-Type': 'application/json', ...(token && { Authorization: `Bearer ${token}` }), ...options.headers as Record<string, string> },
      ...options,
    })
    const json = await res.json().catch(() => ({})) as { success?: boolean; data?: T; error?: { message?: string }; message?: string }
    if (!res.ok) throw new Error(json?.error?.message ?? json?.message ?? `Error ${res.status}`)
    return (json.data ?? json) as T
  }

  async getAll(filters?: { page?: number; limit?: number }) {
    const qs = new URLSearchParams()
    if (filters?.page) qs.append('page', String(filters.page))
    if (filters?.limit) qs.append('limit', String(filters.limit))
    const raw = await this.request<{ items?: unknown[]; total?: number }>(qs.toString() ? `?${qs}` : '')
    const items = Array.isArray(raw?.items) ? raw.items : (Array.isArray((raw as { data?: unknown[] })?.data) ? (raw as { data: unknown[] }).data : [])
    return { data: items.map((i) => toParto(i as Record<string, unknown>)), total: typeof (raw as { total?: number })?.total === 'number' ? (raw as { total: number }).total : items.length }
  }

  async getById(id: string) {
    const raw = await this.request<Record<string, unknown>>(`/${id}`)
    return toParto(raw ?? {})
  }

  async create(data: Record<string, unknown>) {
    const raw = await this.request<Record<string, unknown>>('', { method: 'POST', body: JSON.stringify(data) })
    return toParto(raw ?? {})
  }

  async update(id: string, data: Record<string, unknown>) {
    const raw = await this.request<Record<string, unknown>>(`/${id}`, { method: 'PUT', body: JSON.stringify(data) })
    return toParto(raw ?? {})
  }

  async delete(id: string) {
    await this.request(`/${id}`, { method: 'DELETE' })
  }
}

export const partoService = new PartoService()
