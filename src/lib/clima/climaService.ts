import { getApiBaseUrl } from '@/lib/api/config'

export interface ClimaData {
  temperatura?: number
  descripcion?: string
  ciudad?: string
  humedad?: number
  icono?: string
  [key: string]: unknown
}

interface ApiBody<T = unknown> {
  success?: boolean
  data?: T
  error?: { message?: string }
}

export const climaService = {
  async get(): Promise<ClimaData | null> {
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null
      const url = `${getApiBaseUrl()}/clima`
      const res = await fetch(url, {
        headers: { 'Content-Type': 'application/json', ...(token && { Authorization: `Bearer ${token}` }) },
      })
      const json = (await res.json().catch(() => ({}))) as ApiBody<ClimaData>
      if (!res.ok) return null
      if (json.success === false) return null
      const d = json.data ?? json
      return d && typeof d === 'object' ? (d as ClimaData) : null
    } catch {
      return null
    }
  },
}
