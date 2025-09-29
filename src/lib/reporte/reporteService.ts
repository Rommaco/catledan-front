import {
  Reporte,
  CreateReporteData,
  UpdateReporteData,
  ReporteFilters,
  ReporteResponse,
  ReporteStats,
} from '@/types/reporte'

class ReporteService {
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

    const response = await fetch(`${this.baseUrl}/reportes${endpoint}`, config)

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.message || `Error en la solicitud: ${response.status}`)
    }

    return response.json()
  }

  async getAll(filters?: ReporteFilters): Promise<ReporteResponse> {
    const queryParams = new URLSearchParams()
    if (filters?.search) queryParams.append('search', filters.search)
    if (filters?.tipo) queryParams.append('tipo', filters.tipo)
    if (filters?.startDate) queryParams.append('startDate', filters.startDate)
    if (filters?.endDate) queryParams.append('endDate', filters.endDate)
    if (filters?.page) queryParams.append('page', filters.page.toString())
    if (filters?.limit) queryParams.append('limit', filters.limit.toString())

    const endpoint = `?${queryParams.toString()}`
    return this.request<ReporteResponse>(endpoint)
  }

  async getById(id: string): Promise<Reporte> {
    return this.request<Reporte>(`/${id}`)
  }

  async create(data: CreateReporteData): Promise<Reporte> {
    return this.request<Reporte>('/', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async update(id: string, data: UpdateReporteData): Promise<Reporte> {
    return this.request<Reporte>(`/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  }

  async delete(id: string): Promise<{ message: string }> {
    return this.request<{ message: string }>(`/${id}`, {
      method: 'DELETE',
    })
  }

  async getStats(): Promise<ReporteStats> {
    try {
      // Obtener todos los reportes para calcular estadísticas
      const response = await this.getAll({ limit: 1000 })
      const reportes = response.data

      // Calcular estadísticas
      const totalReportes = reportes.length
      
      const reportesPorTipo = reportes.reduce((acc: Record<string, number>, reporte) => {
        acc[reporte.tipo] = (acc[reporte.tipo] || 0) + 1
        return acc
      }, {})

      const reportesRecientes = reportes
        .sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime())
        .slice(0, 5)

      return {
        totalReportes,
        reportesPorTipo,
        reportesRecientes,
      }
    } catch (error) {
      console.error('Error al obtener estadísticas de reportes:', error)
      return {
        totalReportes: 0,
        reportesPorTipo: {},
        reportesRecientes: [],
      }
    }
  }
}

export const reporteService = new ReporteService()
export default reporteService
