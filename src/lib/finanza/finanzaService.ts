import {
  Finanza,
  CreateFinanzaData,
  UpdateFinanzaData,
  FinanzaFilters,
  FinanzaResponse,
  FinanzaStats,
} from '@/types/finanza'

class FinanzaService {
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

    const response = await fetch(`${this.baseUrl}/finanzas${endpoint}`, config)

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.message || `Error en la solicitud: ${response.status}`)
    }

    return response.json()
  }

  async getAll(filters?: FinanzaFilters): Promise<FinanzaResponse> {
    const queryParams = new URLSearchParams()
    if (filters?.search) queryParams.append('search', filters.search)
    if (filters?.tipo) queryParams.append('tipo', filters.tipo)
    if (filters?.categoria) queryParams.append('categoria', filters.categoria)
    if (filters?.estado) queryParams.append('estado', filters.estado)
    if (filters?.startDate) queryParams.append('startDate', filters.startDate)
    if (filters?.endDate) queryParams.append('endDate', filters.endDate)
    if (filters?.page) queryParams.append('page', filters.page.toString())
    if (filters?.limit) queryParams.append('limit', filters.limit.toString())

    const endpoint = `?${queryParams.toString()}`
    return this.request<FinanzaResponse>(endpoint)
  }

  async getById(id: string): Promise<Finanza> {
    return this.request<Finanza>(`/${id}`)
  }

  async create(data: CreateFinanzaData): Promise<Finanza> {
    return this.request<Finanza>('/', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async update(id: string, data: UpdateFinanzaData): Promise<Finanza> {
    return this.request<Finanza>(`/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  }

  async delete(id: string): Promise<{ message: string }> {
    return this.request<{ message: string }>(`/${id}`, {
      method: 'DELETE',
    })
  }

  async getStats(): Promise<FinanzaStats> {
    try {
      // Obtener todas las finanzas para calcular estadísticas
      const response = await this.getAll({ limit: 1000 })
      const finanzas = response.data

      // Calcular estadísticas - incluir todas las transacciones, no solo las completadas
      const totalIngresos = finanzas
        .filter(f => f.tipo === 'ingreso')
        .reduce((sum, f) => sum + f.monto, 0)

      const totalGastos = finanzas
        .filter(f => f.tipo === 'gasto')
        .reduce((sum, f) => sum + f.monto, 0)

      const balance = totalIngresos - totalGastos

      const transaccionesCompletadas = finanzas.filter(f => f.estado === 'completado').length
      const transaccionesPendientes = finanzas.filter(f => f.estado === 'pendiente').length
      const transaccionesCanceladas = finanzas.filter(f => f.estado === 'cancelado').length

      const ingresosPorCategoria = finanzas
        .filter(f => f.tipo === 'ingreso')
        .reduce((acc: Record<string, number>, finanza) => {
          acc[finanza.categoria] = (acc[finanza.categoria] || 0) + finanza.monto
          return acc
        }, {})

      const gastosPorCategoria = finanzas
        .filter(f => f.tipo === 'gasto')
        .reduce((acc: Record<string, number>, finanza) => {
          acc[finanza.categoria] = (acc[finanza.categoria] || 0) + finanza.monto
          return acc
        }, {})

      return {
        totalIngresos,
        totalGastos,
        balance,
        transaccionesCompletadas,
        transaccionesPendientes,
        transaccionesCanceladas,
        ingresosPorCategoria,
        gastosPorCategoria,
      }
    } catch (error) {
      console.error('Error al obtener estadísticas de finanzas:', error)
      return {
        totalIngresos: 0,
        totalGastos: 0,
        balance: 0,
        transaccionesCompletadas: 0,
        transaccionesPendientes: 0,
        transaccionesCanceladas: 0,
        ingresosPorCategoria: {},
        gastosPorCategoria: {},
      }
    }
  }
}

export const finanzaService = new FinanzaService()
export default finanzaService
