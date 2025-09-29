import { 
  Cultivo, 
  CreateCultivoData, 
  UpdateCultivoData, 
  CultivoFilters,
  CultivoResponse 
} from '@/types/cultivo'

class CultivoService {
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

    const response = await fetch(`${this.baseUrl}${endpoint}`, config)
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.message || `Error en la solicitud: ${response.status}`)
    }

    return response.json()
  }

  async getAll(filters?: CultivoFilters): Promise<CultivoResponse> {
    const queryParams = new URLSearchParams()

    if (filters?.search) queryParams.append('search', filters.search)
    if (filters?.tipo) queryParams.append('tipo', filters.tipo)
    if (filters?.estado) queryParams.append('estado', filters.estado)
    if (filters?.startDate) queryParams.append('startDate', filters.startDate)
    if (filters?.endDate) queryParams.append('endDate', filters.endDate)
    if (filters?.page) queryParams.append('page', filters.page.toString())
    if (filters?.limit) queryParams.append('limit', filters.limit.toString())

    const endpoint = `/cultivos${queryParams.toString() ? `?${queryParams.toString()}` : ''}`
    
    try {
      const response = await this.request<CultivoResponse>(endpoint)
      return response
    } catch (error) {
      console.error('Error al obtener cultivos:', error)
      throw error
    }
  }

  async getById(id: string): Promise<Cultivo> {
    try {
      return await this.request<Cultivo>(`/cultivos/${id}`)
    } catch (error) {
      console.error('Error al obtener cultivo por ID:', error)
      throw error
    }
  }

  async create(data: CreateCultivoData): Promise<Cultivo> {
    try {
      return await this.request<Cultivo>('/cultivos', {
        method: 'POST',
        body: JSON.stringify(data),
      })
    } catch (error) {
      console.error('Error al crear cultivo:', error)
      throw error
    }
  }

  async update(id: string, data: UpdateCultivoData): Promise<Cultivo> {
    try {
      return await this.request<Cultivo>(`/cultivos/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      })
    } catch (error) {
      console.error('Error al actualizar cultivo:', error)
      throw error
    }
  }

  async delete(id: string): Promise<{ message: string }> {
    try {
      return await this.request<{ message: string }>(`/cultivos/${id}`, {
        method: 'DELETE',
      })
    } catch (error) {
      console.error('Error al eliminar cultivo:', error)
      throw error
    }
  }

  async getStats(): Promise<{
    total: number;
    totalArea: number;
    porTipo: Record<string, number>;
    porEstado: Record<string, number>;
  }> {
    try {
      // Por ahora calculamos las estadísticas desde los datos
      const response = await this.getAll()
      const data = response.data

      const total = data.length
      const totalArea = data.reduce((sum, cultivo) => sum + cultivo.area, 0)
      
      const porTipo = data.reduce((acc, cultivo) => {
        acc[cultivo.tipo] = (acc[cultivo.tipo] || 0) + 1
        return acc
      }, {} as Record<string, number>)

      const porEstado = data.reduce((acc, cultivo) => {
        acc[cultivo.estado] = (acc[cultivo.estado] || 0) + 1
        return acc
      }, {} as Record<string, number>)

      return {
        total,
        totalArea,
        porTipo,
        porEstado
      }
    } catch (error) {
      console.error('Error al obtener estadísticas de cultivos:', error)
      throw error
    }
  }
}

export const cultivoService = new CultivoService()
export default cultivoService
