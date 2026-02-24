import { 
  DashboardResumen, 
  FinanzaMensual, 
  GanadoPorEstado, 
  ProduccionLeche,
  CultivoDashboard,
} from '@/types/dashboard'
import { getApiBaseUrl } from '@/lib/api/config'

class DashboardService {
  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${getApiBaseUrl()}${endpoint}`
    
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
        const errBody = errorData && typeof errorData === 'object' ? errorData : {}
        const msg = (errBody as { message?: string })?.message || 'Error en la solicitud'
        console.error('❌ Error en la respuesta:', msg)
        throw new Error(msg)
      }

      const raw = await response.json()
      const data = raw && typeof raw === 'object' && 'data' in raw ? (raw as { data: T }).data : raw
      return data as T
    } catch (error) {
      console.error('❌ Error en la petición:', error)
      if (error instanceof Error) {
        throw error
      }
      throw new Error('Error desconocido')
    }
  }

  async getResumen(): Promise<DashboardResumen> {
    const raw = await this.request<{ totalGanado?: number; totalParcelas?: number; finanzas?: { ingresos?: number; gastos?: number } }>('/dashboard/negocio/resumen')
    return {
      totalGanado: raw?.totalGanado ?? 0,
      totalIngresos: raw?.finanzas?.ingresos ?? 0,
      totalGastos: raw?.finanzas?.gastos ?? 0,
      totalReportes: raw?.totalParcelas ?? 0,
    }
  }

  async getFinanzasMensuales(year?: number): Promise<FinanzaMensual[]> {
    let endpoint = '/dashboard/negocio/finanzas-mensuales'
    if (year) endpoint += `?startDate=${year}-01-01&endDate=${year}-12-31`
    const data = await this.request<{ mensual?: { month: number; ingresos: number; gastos: number }[] }>(endpoint)
    const list = data?.mensual ?? []
    return Array.isArray(list) ? list.map((x) => ({ _id: x.month, ingresos: x.ingresos, gastos: x.gastos })) : []
  }

  async getGanadoPorEstado(): Promise<GanadoPorEstado[]> {
    const data = await this.request<{ porEstado?: { estado: string; cantidad: number }[] }>('/dashboard/negocio/ganado-por-estado')
    const list = data?.porEstado ?? []
    return Array.isArray(list) ? list.map((x) => ({ _id: x.estado || 'Sin estado', cantidad: x.cantidad })) : []
  }

  async getProduccionLeche(year?: number): Promise<ProduccionLeche[]> {
    let endpoint = '/dashboard/negocio/produccion-leche'
    if (year) endpoint += `?startDate=${year}-01-01&endDate=${year}-12-31`
    const data = await this.request<{ mensual?: { month: number; total: number }[] }>(endpoint)
    const list = data?.mensual ?? []
    return Array.isArray(list) ? list.map((x) => ({ _id: x.month, totalLitros: x.total })) : []
  }

  async getCultivosDashboard(): Promise<CultivoDashboard[]> {
    try {
      const response = await this.request<{ data?: unknown[] } | unknown[]>('/cultivos')
      const raw = Array.isArray(response) ? response : (response as { data?: unknown[] })?.data
      const list = (Array.isArray(raw) ? raw : []) as Record<string, unknown>[]
      const grouped = list.reduce<Record<string, CultivoDashboard>>((acc, c) => {
        const tipo = (c.tipo as string) || 'Sin tipo'
        if (!acc[tipo]) acc[tipo] = { _id: tipo, cantidad: 0, area: 0 }
        acc[tipo].cantidad += 1
        acc[tipo].area += (c.area as number) || 0
        return acc
      }, {})
      return Object.values(grouped)
    } catch {
      return []
    }
  }
}

export const dashboardService = new DashboardService()
export default dashboardService
