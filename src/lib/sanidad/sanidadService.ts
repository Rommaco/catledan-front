import { getApiBaseUrl } from '@/lib/api/config'
import type { Vacuna, Tratamiento } from '@/types/sanidad'

function toVacuna(raw: Record<string, unknown>): Vacuna {
  const id = String(raw._id ?? raw.id ?? '')
  return {
    _id: id,
    ganado: raw.ganado != null ? String(raw.ganado) : undefined,
    fecha: raw.fecha != null ? String(raw.fecha) : undefined,
    tipo: raw.tipo != null ? String(raw.tipo) : undefined,
    lote: raw.lote != null ? String(raw.lote) : undefined,
    observaciones: raw.observaciones != null ? String(raw.observaciones) : undefined,
    createdAt: raw.createdAt != null ? String(raw.createdAt) : undefined,
    updatedAt: raw.updatedAt != null ? String(raw.updatedAt) : undefined,
  }
}

function toTratamiento(raw: Record<string, unknown>): Tratamiento {
  const id = String(raw._id ?? raw.id ?? '')
  return {
    _id: id,
    ganado: raw.ganado != null ? String(raw.ganado) : undefined,
    fecha: raw.fecha != null ? String(raw.fecha) : undefined,
    tipo: raw.tipo != null ? String(raw.tipo) : undefined,
    producto: raw.producto != null ? String(raw.producto) : undefined,
    dosis: raw.dosis != null ? String(raw.dosis) : undefined,
    observaciones: raw.observaciones != null ? String(raw.observaciones) : undefined,
    createdAt: raw.createdAt != null ? String(raw.createdAt) : undefined,
    updatedAt: raw.updatedAt != null ? String(raw.updatedAt) : undefined,
  }
}

class SanidadService {
  private async request<T>(path: string, options: RequestInit = {}): Promise<T> {
    const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null
    const url = `${getApiBaseUrl()}${path}`
    const res = await fetch(url, {
      headers: { 'Content-Type': 'application/json', ...(token && { Authorization: `Bearer ${token}` }), ...options.headers as Record<string, string> },
      ...options,
    })
    const json = await res.json().catch(() => ({})) as { success?: boolean; data?: T; items?: unknown[]; error?: { message?: string }; message?: string }
    if (!res.ok) throw new Error(json?.error?.message ?? json?.message ?? `Error ${res.status}`)
    return (json.data ?? json) as T
  }

  async getVacunaciones(filters?: { page?: number; limit?: number }) {
    const qs = new URLSearchParams()
    if (filters?.page) qs.append('page', String(filters.page))
    if (filters?.limit) qs.append('limit', String(filters.limit))
    const raw = await this.request<{ items?: unknown[]; data?: unknown[]; total?: number }>(`/sanidad/vacunaciones${qs.toString() ? `?${qs}` : ''}`)
    const items = Array.isArray(raw?.items) ? raw.items : (Array.isArray(raw?.data) ? raw.data : [])
    return { data: items.map((i) => toVacuna(i as Record<string, unknown>)), total: typeof raw?.total === 'number' ? raw.total : items.length }
  }

  async getVacunaById(id: string) {
    const raw = await this.request<Record<string, unknown>>(`/sanidad/vacunaciones/${id}`)
    return toVacuna(raw ?? {})
  }

  async updateVacuna(id: string, data: Record<string, unknown>) {
    const raw = await this.request<Record<string, unknown>>(`/sanidad/vacunaciones/${id}`, { method: 'PUT', body: JSON.stringify(data) })
    return toVacuna(raw ?? {})
  }

  async deleteVacuna(id: string) {
    await this.request(`/sanidad/vacunaciones/${id}`, { method: 'DELETE' })
  }

  async getTratamientos(filters?: { page?: number; limit?: number }) {
    const qs = new URLSearchParams()
    if (filters?.page) qs.append('page', String(filters.page))
    if (filters?.limit) qs.append('limit', String(filters.limit))
    const raw = await this.request<{ items?: unknown[]; data?: unknown[]; total?: number }>(`/sanidad/tratamientos${qs.toString() ? `?${qs}` : ''}`)
    const items = Array.isArray(raw?.items) ? raw.items : (Array.isArray(raw?.data) ? raw.data : [])
    return { data: items.map((i) => toTratamiento(i as Record<string, unknown>)), total: typeof raw?.total === 'number' ? raw.total : items.length }
  }

  async getTratamientoById(id: string) {
    const raw = await this.request<Record<string, unknown>>(`/sanidad/tratamientos/${id}`)
    return toTratamiento(raw ?? {})
  }

  async updateTratamiento(id: string, data: Record<string, unknown>) {
    const raw = await this.request<Record<string, unknown>>(`/sanidad/tratamientos/${id}`, { method: 'PUT', body: JSON.stringify(data) })
    return toTratamiento(raw ?? {})
  }

  async deleteTratamiento(id: string) {
    await this.request(`/sanidad/tratamientos/${id}`, { method: 'DELETE' })
  }
}

export const sanidadService = new SanidadService()
