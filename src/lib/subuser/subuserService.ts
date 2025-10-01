import {
  Subuser,
  CreateSubuserData,
  UpdateSubuserData,
  SubuserFilters,
  SubuserResponse,
  SubuserStats,
  RefreshPasswordsResponse,
} from '@/types/subuser'

class SubuserService {
  private baseUrl: string

  constructor() {
    this.baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const token = localStorage.getItem('auth_token')

    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
      ...options,
    }

    const response = await fetch(`${this.baseUrl}/subusers${endpoint}`, config)

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.message || `Error en la solicitud: ${response.status}`)
    }

    return response.json()
  }

  async getAll(filters?: SubuserFilters): Promise<Subuser[]> {
    const queryParams = new URLSearchParams()
    if (filters?.search) queryParams.append('search', filters.search)
    if (filters?.rol) queryParams.append('rol', filters.rol)
    if (filters?.isOnline !== undefined) queryParams.append('isOnline', filters.isOnline.toString())
    if (filters?.page) queryParams.append('page', filters.page.toString())
    if (filters?.limit) queryParams.append('limit', filters.limit.toString())

    const endpoint = `?${queryParams.toString()}`
    return this.request<Subuser[]>(endpoint)
  }

  async getById(id: string): Promise<Subuser> {
    return this.request<Subuser>(`/${id}`)
  }

  async create(data: CreateSubuserData): Promise<Subuser> {
    return this.request<Subuser>('/', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async update(id: string, data: UpdateSubuserData): Promise<Subuser> {
    return this.request<Subuser>(`/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  }

  async delete(id: string): Promise<{ message: string }> {
    return this.request<{ message: string }>(`/${id}`, {
      method: 'DELETE',
    })
  }

  async refreshPasswords(): Promise<RefreshPasswordsResponse> {
    return this.request<RefreshPasswordsResponse>('/refresh-passwords', {
      method: 'POST',
    })
  }

  async getStats(): Promise<SubuserStats> {
    try {
      // Obtener todos los subusuarios para calcular estadísticas
      const subusers = await this.getAll({ limit: 1000 })

      const stats: SubuserStats = {
        totalSubusers: subusers.length,
        onlineSubusers: subusers.filter(s => s.isOnline).length,
        offlineSubusers: subusers.filter(s => !s.isOnline).length,
        administrativos: subusers.filter(s => s.permisos.includes('administrativo')).length,
        trabajadores: subusers.filter(s => s.permisos.includes('trabajador')).length,
      }

      return stats
    } catch (error) {
      console.error('Error al calcular estadísticas de subusuarios:', error)
      return {
        totalSubusers: 0,
        onlineSubusers: 0,
        offlineSubusers: 0,
        administrativos: 0,
        trabajadores: 0,
      }
    }
  }
}

export const subuserService = new SubuserService()
export default subuserService


