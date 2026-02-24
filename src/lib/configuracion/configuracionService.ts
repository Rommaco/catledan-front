import { getApiBaseUrl } from '@/lib/api/config'
import {
  Configuracion,
  ConfiguracionEmpresa,
  ConfiguracionUsuario,
  ConfiguracionSistema,
  UpdateConfiguracionData,
} from '@/types/configuracion'

interface ApiBody<T = unknown> {
  success?: boolean
  data?: T
  error?: { message?: string }
}

function toConfiguracion(raw: Record<string, unknown>): Configuracion {
  return {
    _id: String(raw._id ?? raw.id ?? ''),
    user: String(raw.user ?? raw.userId ?? ''),
    empresa: (raw.empresa ?? {}) as Configuracion['empresa'],
    usuario: (raw.usuario ?? {}) as Configuracion['usuario'],
    sistema: (raw.sistema ?? {}) as Configuracion['sistema'],
    createdAt: raw.createdAt != null ? String(raw.createdAt) : '',
    updatedAt: raw.updatedAt != null ? String(raw.updatedAt) : '',
  } as Configuracion
}

class ConfiguracionService {
  private getUrl() {
    return `${getApiBaseUrl()}/configuracion`
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null
    const url = `${this.getUrl()}${endpoint}`
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
    const errMsg = json?.error?.message ?? (json as { message?: string })?.message ?? `Error: ${response.status}`
    if (!response.ok) throw new Error(errMsg)
    if (json.success === false) throw new Error(errMsg)
    return (json.data ?? json) as T
  }

  /** GET /configuracion. Retorna null si no existe (404). Normaliza id/userId a _id/user. */
  async get(): Promise<Configuracion | null> {
    const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null
    const url = `${this.getUrl()}/`
    const response = await fetch(url, {
      headers: { 'Content-Type': 'application/json', ...(token && { Authorization: `Bearer ${token}` }) },
    })
    const json = (await response.json().catch(() => ({}))) as ApiBody<Configuracion & { id?: string; userId?: string }>
    if (response.status === 404 || !response.ok) {
      if (response.status === 404) return null
      throw new Error(json?.error?.message ?? (json as { message?: string })?.message ?? `Error: ${response.status}`)
    }
    if (json.success === false) throw new Error(json?.error?.message ?? 'Error al cargar la configuración.')
    const raw = json.data ?? json
    if (!raw || typeof raw !== 'object') return null
    return toConfiguracion(raw as Record<string, unknown>)
  }

  /** PUT /configuracion (completa) */
  async update(data: UpdateConfiguracionData): Promise<Configuracion> {
    const raw = await this.request<Record<string, unknown>>('/', {
      method: 'PUT',
      body: JSON.stringify(data),
    })
    return toConfiguracion(raw ?? {})
  }

  /** PUT /configuracion/empresa */
  async updateEmpresa(empresa: ConfiguracionEmpresa): Promise<Configuracion> {
    const raw = await this.request<Record<string, unknown>>('/empresa', {
      method: 'PUT',
      body: JSON.stringify({ empresa }),
    })
    return toConfiguracion(raw ?? {})
  }

  /** PUT /configuracion/usuario */
  async updateUsuario(usuario: ConfiguracionUsuario): Promise<Configuracion> {
    const raw = await this.request<Record<string, unknown>>('/usuario', {
      method: 'PUT',
      body: JSON.stringify({ usuario }),
    })
    return toConfiguracion(raw ?? {})
  }

  /** PUT /configuracion/sistema */
  async updateSistema(sistema: ConfiguracionSistema): Promise<Configuracion> {
    const raw = await this.request<Record<string, unknown>>('/sistema', {
      method: 'PUT',
      body: JSON.stringify({ sistema }),
    })
    return toConfiguracion(raw ?? {})
  }

  /** DELETE /configuracion */
  async delete(): Promise<{ message: string }> {
    const raw = await this.request<{ message?: string }>('/', { method: 'DELETE' })
    return { message: (raw as { message?: string })?.message ?? 'Eliminado' }
  }
}

export const configuracionService = new ConfiguracionService()
export default configuracionService


