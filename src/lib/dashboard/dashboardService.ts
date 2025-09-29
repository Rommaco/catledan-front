import { 
  DashboardResumen, 
  FinanzaMensual, 
  GanadoPorEstado, 
  ProduccionLeche,
  CultivoDashboard,
  DashboardStats
} from '@/types/dashboard'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'

class DashboardService {
  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    }

    // Agregar token si existe
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('auth_token')
      if (token) {
        config.headers = {
          ...config.headers,
          Authorization: `Bearer ${token}`,
        }
      }
    }

    try {
      const response = await fetch(url, config)
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        console.error('❌ Error en la respuesta:', errorData)
        throw new Error(errorData.message || 'Error en la solicitud')
      }

      const data = await response.json()
      return data
    } catch (error) {
      console.error('❌ Error en la petición:', error)
      if (error instanceof Error) {
        throw error
      }
      throw new Error('Error desconocido')
    }
  }

  async getResumen(): Promise<DashboardResumen> {
    return this.request<DashboardResumen>('/dashboard/resumen')
  }

  async getFinanzasMensuales(year?: number): Promise<FinanzaMensual[]> {
    const endpoint = year
      ? `/dashboard/finanzas-mensuales?year=${year}`
      : '/dashboard/finanzas-mensuales'
    return this.request<FinanzaMensual[]>(endpoint)
  }

  async getGanadoPorEstado(): Promise<GanadoPorEstado[]> {
    return this.request<GanadoPorEstado[]>('/dashboard/ganado-por-estado')
  }

  async getProduccionLeche(year?: number): Promise<ProduccionLeche[]> {
    const endpoint = year
      ? `/dashboard/produccion-leche?year=${year}`
      : '/dashboard/produccion-leche'
    return this.request<ProduccionLeche[]>(endpoint)
  }

  async getCultivosDashboard(): Promise<CultivoDashboard[]> {
    try {
      // Obtener todos los cultivos y procesarlos para el dashboard
      const response = await this.request<{ data: any[], total: number }>('/cultivos')
      const cultivos = response.data || response
      
      // Validar que cultivos sea un array
      if (!Array.isArray(cultivos)) {
        console.warn('⚠️ Cultivos no es un array:', cultivos)
        return []
      }
      
      // Agrupar por tipo de cultivo
      const cultivosGrouped = cultivos.reduce((acc: any, cultivo: any) => {
        const tipo = cultivo.tipo || 'Sin tipo'
        if (!acc[tipo]) {
          acc[tipo] = { _id: tipo, cantidad: 0, area: 0 }
        }
        acc[tipo].cantidad += 1
        acc[tipo].area += cultivo.area || 0
        return acc
      }, {})
      
      return Object.values(cultivosGrouped)
    } catch (error) {
      console.error('❌ Error al obtener cultivos:', error)
      return []
    }
  }

  async getStatistics(): Promise<DashboardStats> {
    return this.request<DashboardStats>('/dashboard/statistics')
  }

  // Endpoints de prueba para debugging
  async testGanado(): Promise<any> {
    return this.request<any>('/dashboard/test-ganado')
  }

  async testFinanzas(): Promise<any> {
    return this.request<any>('/dashboard/test-finanzas')
  }
}

export const dashboardService = new DashboardService()
export default dashboardService
