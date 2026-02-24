import { getApiBaseUrl } from '@/lib/api/config'
import {
  Subuser,
  CreateSubuserData,
  UpdateSubuserData,
  SubuserFilters,
  SubuserStats,
  RefreshPasswordsResponse,
} from '@/types/subuser'

/** Respuesta cruda del backend: { success, data?, error? } */
interface ApiBody<T = unknown> {
  success?: boolean
  data?: T
  error?: { message?: string }
}

function toDateISO(value: unknown): string {
  if (value == null) return ''
  if (typeof value === 'string') return value
  if (value instanceof Date) return value.toISOString()
  if (typeof value === 'number') {
    const d = new Date(value)
    return Number.isNaN(d.getTime()) ? '' : d.toISOString()
  }
  return ''
}

function permisosToArray(permisos: unknown): string[] {
  if (Array.isArray(permisos)) return permisos.map(String)
  if (permisos && typeof permisos === 'object') {
    const flat = (Object.values(permisos) as unknown[]).flat()
    return flat.map(String)
  }
  return []
}

/** Genera una contraseña temporal que cumple Cognito: mayúscula, minúscula, número y símbolo */
function generateTempPassword(): string {
  const lower = 'abcdefghjkmnpqrstuvwxyz'
  const upper = 'ABCDEFGHJKMNPQRSTUVWXYZ'
  const digits = '23456789'
  const symbols = '!@#$%&*'
  const all = lower + upper + digits + symbols
  let p = ''
  p += lower[Math.floor(Math.random() * lower.length)]
  p += upper[Math.floor(Math.random() * upper.length)]
  p += digits[Math.floor(Math.random() * digits.length)]
  p += symbols[Math.floor(Math.random() * symbols.length)]
  for (let i = 0; i < 8; i++) p += all[Math.floor(Math.random() * all.length)]
  return p
}

function toSubuser(raw: Record<string, unknown>): Subuser {
  const id = String(raw._id ?? raw.id ?? '')
  let permisos = permisosToArray(raw.permisos)
  const profile = String(raw.profile ?? '').toLowerCase()
  if (!permisos.includes('administrativo') && !permisos.includes('trabajador')) {
    if (profile === 'admin' || profile === 'super_user') permisos = [...permisos, 'administrativo']
    else permisos = [...permisos, 'trabajador']
  }
  return {
    _id: id,
    fullName: String(raw.fullName ?? raw.name ?? ''),
    email: String(raw.email ?? ''),
    permisos,
    isOnline: raw.isOnline === true,
    lastSeen: raw.lastSeen != null ? toDateISO(raw.lastSeen) : undefined,
    currentTempPassword: raw.currentTempPassword != null ? String(raw.currentTempPassword) : undefined,
    tempPasswordExpires: raw.tempPasswordExpires != null ? toDateISO(raw.tempPasswordExpires) : undefined,
    createdAt: toDateISO(raw.createdAt),
    lastPasswordUpdate: raw.lastPasswordUpdate != null ? toDateISO(raw.lastPasswordUpdate) : undefined,
    isPasswordExpired: raw.isPasswordExpired === true,
  }
}

class SubuserService {
  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null
    const url = `${getApiBaseUrl()}/subusers${endpoint}`
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

  /** GET /subusers — Listar (backend devuelve { success, data: array }) */
  async getAll(filters?: SubuserFilters): Promise<Subuser[]> {
    const queryParams = new URLSearchParams()
    if (filters?.page) queryParams.append('page', String(filters.page))
    if (filters?.limit) queryParams.append('limit', String(filters.limit))
    if (filters?.search) queryParams.append('search', filters.search)
    if (filters?.rol) queryParams.append('rol', filters.rol)
    if (filters?.isOnline !== undefined) queryParams.append('isOnline', String(filters.isOnline))
    const qs = queryParams.toString()
    const raw = await this.request<unknown>(qs ? `?${qs}` : '')
    const list = Array.isArray(raw) ? raw : []
    return list.map((item) => toSubuser(item as Record<string, unknown>))
  }

  /** POST /subusers — Backend espera: fullName, email, password, phone, profile. Devuelve subuser y contraseña temporal si se generó. */
  async create(data: CreateSubuserData & { password?: string; phone?: string }): Promise<{ subuser: Subuser; temporaryPassword?: string }> {
    const generated = !(data.password && data.password.length >= 8)
    const password = data.password && data.password.length >= 8 ? data.password : generateTempPassword()
    const rawPhone = data.phone && String(data.phone).trim()
    const phone = (rawPhone && rawPhone.length >= 10)
      ? rawPhone
      : `1${Date.now().toString().slice(-9)}`
    const profile = data.rol === 'administrativo' ? 'super_user' : 'user'
    const body = {
      fullName: data.fullName.trim(),
      email: data.email.trim(),
      password,
      phone,
      profile,
    }
    const raw = await this.request<{ subuser?: Record<string, unknown> } | Record<string, unknown>>('/', {
      method: 'POST',
      body: JSON.stringify(body),
    })
    const subuserRaw = raw && typeof raw === 'object' && 'subuser' in raw ? (raw as { subuser: Record<string, unknown> }).subuser : raw
    const subuser = toSubuser((subuserRaw as Record<string, unknown>) ?? {})
    return { subuser, ...(generated ? { temporaryPassword: password } : {}) }
  }

  async delete(id: string): Promise<{ message: string }> {
    await this.request<unknown>(`/${id}`, { method: 'DELETE' })
    return { message: 'Eliminado' }
  }

  /** Actualizar subusuario: el backend solo expone PUT /permisos; actualizamos permisos y devolvemos el listado actualizado */
  async update(id: string, data: UpdateSubuserData): Promise<Subuser> {
    if (data.permisos != null) {
      const permisosMap: Record<string, string[]> = { subusers: data.permisos }
      await this.request<unknown>(`/${id}/permisos`, {
        method: 'PUT',
        body: JSON.stringify({ permisos: permisosMap }),
      })
    }
    const list = await this.getAll()
    const found = list.find((s) => s._id === id)
    return found ?? toSubuser({ _id: id, email: '', fullName: '', permisos: data.permisos ?? [] })
  }

  /** PUT /subusers/:id/reset-password */
  async resetPassword(id: string, newPassword: string): Promise<{ message: string }> {
    const raw = await this.request<{ message?: string }>(`/${id}/reset-password`, {
      method: 'PUT',
      body: JSON.stringify({ newPassword }),
    })
    return { message: (raw as { message?: string })?.message ?? 'Contraseña actualizada' }
  }

  /** GET /subusers/:id/permisos */
  async getPermisos(id: string): Promise<Record<string, string[]>> {
    const raw = await this.request<Record<string, string[]>>(`/${id}/permisos`)
    return raw && typeof raw === 'object' ? raw : {}
  }

  /** PUT /subusers/:id/permisos */
  async updatePermisos(id: string, permisos: Record<string, string[]>): Promise<unknown> {
    return this.request<unknown>(`/${id}/permisos`, {
      method: 'PUT',
      body: JSON.stringify({ permisos }),
    })
  }

  /** POST /subusers/refresh-passwords (actualizar contraseñas temporales) */
  async refreshPasswords(): Promise<RefreshPasswordsResponse> {
    const raw = await this.request<RefreshPasswordsResponse>('/refresh-passwords', {
      method: 'POST',
    })
    return {
      message: raw?.message ?? 'Actualizado',
      updatedCount: raw?.updatedCount ?? 0,
      passwords: Array.isArray(raw?.passwords) ? raw.passwords : [],
    }
  }

  /** Estadísticas derivadas del listado */
  async getStats(): Promise<SubuserStats> {
    const list = await this.getAll()
    const totalSubusers = list.length
    const onlineSubusers = list.filter((s) => s.isOnline).length
    const offlineSubusers = totalSubusers - onlineSubusers
    const administrativos = list.filter((s) => s.permisos?.includes('administrativo')).length
    const trabajadores = list.filter((s) => s.permisos?.includes('trabajador')).length
    return {
      totalSubusers,
      onlineSubusers,
      offlineSubusers,
      administrativos,
      trabajadores,
    }
  }
}

export const subuserService = new SubuserService()
export default subuserService
