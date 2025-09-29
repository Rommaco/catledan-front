import { 
  ProduccionLeche, 
  CreateProduccionLecheData, 
  UpdateProduccionLecheData, 
  ProduccionLecheFilters,
  ProduccionLecheResponse 
} from '@/types/produccionLeche'

class ProduccionLecheService {
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

  async getAll(filters?: ProduccionLecheFilters): Promise<ProduccionLecheResponse> {
    const queryParams = new URLSearchParams()

    if (filters?.search) queryParams.append('search', filters.search)
    if (filters?.startDate) queryParams.append('startDate', filters.startDate)
    if (filters?.endDate) queryParams.append('endDate', filters.endDate)
    if (filters?.page) queryParams.append('page', filters.page.toString())
    if (filters?.limit) queryParams.append('limit', filters.limit.toString())

    const endpoint = `/produccion-leche${queryParams.toString() ? `?${queryParams.toString()}` : ''}`
    
    try {
      const response = await this.request<ProduccionLeche[]>(endpoint)
      // El backend devuelve directamente un array, no un objeto con data y total
      return {
        data: response,
        total: response.length
      }
    } catch (error) {
      console.error('Error al obtener producción de leche:', error)
      throw error
    }
  }

  async getById(id: string): Promise<ProduccionLeche> {
    try {
      return await this.request<ProduccionLeche>(`/produccion-leche/${id}`)
    } catch (error) {
      console.error('Error al obtener producción por ID:', error)
      throw error
    }
  }

  async create(data: CreateProduccionLecheData): Promise<ProduccionLeche> {
    try {
      return await this.request<ProduccionLeche>('/produccion-leche', {
        method: 'POST',
        body: JSON.stringify(data),
      })
    } catch (error) {
      console.error('Error al crear producción de leche:', error)
      throw error
    }
  }

  async update(id: string, data: UpdateProduccionLecheData): Promise<ProduccionLeche> {
    try {
      return await this.request<ProduccionLeche>(`/produccion-leche/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      })
    } catch (error) {
      console.error('Error al actualizar producción de leche:', error)
      throw error
    }
  }

  async delete(id: string): Promise<{ message: string }> {
    try {
      return await this.request<{ message: string }>(`/produccion-leche/${id}`, {
        method: 'DELETE',
      })
    } catch (error) {
      console.error('Error al eliminar producción de leche:', error)
      throw error
    }
  }

  async getStats(): Promise<{
    total: number;
    promedioDiario: number;
    totalLitros: number;
    porMes: Record<string, number>;
  }> {
    try {
      return await this.request('/produccion-leche/stats')
    } catch (error) {
      console.error('Error al obtener estadísticas de producción:', error)
      throw error
    }
  }

}

export const produccionLecheService = new ProduccionLecheService()
export default produccionLecheService
