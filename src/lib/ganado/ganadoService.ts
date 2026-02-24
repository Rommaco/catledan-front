import { getApiBaseUrl } from '@/lib/api/config'
import { 
  Ganado, 
  CreateGanadoData, 
  UpdateGanadoData, 
  GanadoResponse, 
  GanadoFilters 
} from '@/types/ganado'

class GanadoService {
  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${getApiBaseUrl()}${endpoint}`
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    }
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('auth_token')
      if (token) {
        config.headers = { ...config.headers, Authorization: `Bearer ${token}` }
      }
    }
    const response = await fetch(url, config)
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({})) as { error?: { message?: string }; message?: string }
      const msg = errorData?.error?.message ?? errorData?.message ?? `Error en la solicitud: ${response.status}`
      throw new Error(msg)
    }
    return response.json()
  }

  /** GET /ganado - Lista con paginación y filtros. Backend devuelve { data: { ganados, total } } */
  async getAll(filters?: GanadoFilters): Promise<GanadoResponse> {
    const queryParams = new URLSearchParams()
    if (filters?.search) queryParams.append('search', filters.search)
    if (filters?.categoria) queryParams.append('categoria', filters.categoria)
    if (filters?.estado) queryParams.append('estado', filters.estado)
    if (filters?.estadoReproductivo) queryParams.append('estadoReproductivo', filters.estadoReproductivo)
    if (filters?.sexo) queryParams.append('sexo', filters.sexo)
    if (filters?.page) queryParams.append('page', filters.page.toString())
    if (filters?.limit) queryParams.append('limit', filters.limit.toString())
    const endpoint = `/ganado${queryParams.toString() ? `?${queryParams.toString()}` : ''}`
    const response = await this.request<{ success?: boolean; data?: { ganados?: (Ganado & { id?: string })[]; total?: number } }>(endpoint)
    const inner = response?.data
    const rawList = Array.isArray(inner?.ganados) ? inner.ganados : []
    const data = rawList.map((g) => ({ ...g, _id: (g as Ganado)._id ?? (g as { id?: string }).id ?? '' })) as Ganado[]
    return { data, total: typeof inner?.total === 'number' ? inner.total : 0 }
  }

  private getMockData(): GanadoResponse {
    const mockGanado: Ganado[] = [
      {
        _id: '1',
        nombre: 'Rosita',
        raza: 'Holstein',
        peso: 650,
        edad: 4,
        estado: 'Activo',
        fechaIngreso: '2023-01-15T00:00:00.000Z',
        numeroIdentificacion: 'VACA001',
        sexo: 'hembra',
        categoria: 'vaca',
        estadoReproductivo: 'lactando',
        fechaUltimoCelo: '2023-12-15T00:00:00.000Z',
        fechaUltimaMonta: '2023-12-20T00:00:00.000Z',
        fechaEsperadaParto: '2024-09-20T00:00:00.000Z',
        tiempoSeca: 45,
        diasLactancia: 120,
        numeroPartos: 3,
        ultimaProduccionLeche: 25,
        historialVacunas: ['Triple Viral', 'Brucelosis', 'Carbunco'],
        proximaVacuna: '2024-02-15T00:00:00.000Z',
        observaciones: 'Vaca de alta producción, buen temperamento',
        user: 'user1',
        createdAt: '2023-01-15T00:00:00.000Z',
        updatedAt: '2023-01-15T00:00:00.000Z'
      },
      {
        _id: '2',
        nombre: 'Toro Bravo',
        raza: 'Brahman',
        peso: 850,
        edad: 5,
        estado: 'Activo',
        fechaIngreso: '2023-02-20T00:00:00.000Z',
        numeroIdentificacion: 'TORO001',
        sexo: 'macho',
        categoria: 'toro',
        estadoReproductivo: 'vacia',
        historialVacunas: ['Triple Viral', 'Carbunco'],
        proximaVacuna: '2024-03-01T00:00:00.000Z',
        observaciones: 'Toro reproductor de alta calidad genética',
        user: 'user1',
        createdAt: '2023-02-20T00:00:00.000Z',
        updatedAt: '2023-02-20T00:00:00.000Z'
      },
      {
        _id: '3',
        nombre: 'Luna',
        raza: 'Jersey',
        peso: 450,
        edad: 3,
        estado: 'Activo',
        fechaIngreso: '2023-03-10T00:00:00.000Z',
        numeroIdentificacion: 'VACA002',
        sexo: 'hembra',
        categoria: 'vaca',
        estadoReproductivo: 'preñada',
        fechaUltimoCelo: '2023-11-10T00:00:00.000Z',
        fechaUltimaMonta: '2023-11-15T00:00:00.000Z',
        fechaEsperadaParto: '2024-08-15T00:00:00.000Z',
        tiempoSeca: 0,
        diasLactancia: 0,
        numeroPartos: 1,
        ultimaProduccionLeche: 18,
        historialVacunas: ['Triple Viral', 'Brucelosis'],
        proximaVacuna: '2024-01-20T00:00:00.000Z',
        observaciones: 'Primer parto, gestación normal',
        user: 'user1',
        createdAt: '2023-03-10T00:00:00.000Z',
        updatedAt: '2023-03-10T00:00:00.000Z'
      },
      {
        _id: '4',
        nombre: 'Pequeño',
        raza: 'Holstein',
        peso: 80,
        edad: 1,
        estado: 'Activo',
        fechaIngreso: '2023-12-01T00:00:00.000Z',
        numeroIdentificacion: 'TER001',
        sexo: 'macho',
        categoria: 'ternero',
        estadoReproductivo: 'vacia',
        historialVacunas: ['Triple Viral'],
        proximaVacuna: '2024-04-01T00:00:00.000Z',
        observaciones: 'Ternero sano, buen crecimiento',
        user: 'user1',
        createdAt: '2023-12-01T00:00:00.000Z',
        updatedAt: '2023-12-01T00:00:00.000Z'
      }
    ]

    return {
      data: mockGanado,
      total: mockGanado.length
    }
  }

  /** GET /ganado/:id - Uno por ID. Backend devuelve { data: { ganado } }; normalizar _id desde id */
  async getById(id: string): Promise<Ganado> {
    const response = await this.request<{ success?: boolean; data?: { ganado?: Ganado & { id?: string } } }>(`/ganado/${id}`)
    const raw = response?.data?.ganado
    if (raw && typeof raw === 'object') {
      const _id = (raw as Ganado)._id ?? (raw as { id?: string }).id
      return { ...raw, _id: _id ?? id } as Ganado
    }
    return response as unknown as Ganado
  }

  /** POST /ganado - Crear. Backend devuelve { data: { ganado } } */
  async create(data: CreateGanadoData): Promise<Ganado> {
    const response = await this.request<{ success?: boolean; data?: { ganado?: Ganado & { id?: string } } }>('/ganado', {
      method: 'POST',
      body: JSON.stringify(data),
    })
    const raw = response?.data?.ganado
    if (raw && typeof raw === 'object') {
      const _id = (raw as Ganado)._id ?? (raw as { id?: string }).id
      return { ...raw, _id: _id ?? '' } as Ganado
    }
    return response as unknown as Ganado
  }

  /** PUT /ganado/:id - Actualizar. Backend devuelve { data: { ganado } } */
  async update(id: string, data: UpdateGanadoData): Promise<Ganado> {
    const response = await this.request<{ success?: boolean; data?: { ganado?: Ganado & { id?: string } } }>(`/ganado/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
    const raw = response?.data?.ganado
    if (raw && typeof raw === 'object') {
      const _id = (raw as Ganado)._id ?? (raw as { id?: string }).id
      return { ...raw, _id: _id ?? id } as Ganado
    }
    return response as unknown as Ganado
  }

  /** DELETE /ganado/:id - Eliminar. Backend devuelve { data: { deleted: true } } */
  async delete(id: string): Promise<void> {
    await this.request<{ success?: boolean; data?: { deleted?: boolean } }>(`/ganado/${id}`, { method: 'DELETE' })
  }

  /** GET /ganado/stats - Estadísticas (si el backend lo expone). Backend puede devolver { data: { ... } } */
  async getStats(): Promise<{
    total: number;
    porCategoria: Record<string, number>;
    porEstado: Record<string, number>;
    porSexo: Record<string, number>;
  }> {
    try {
      const res = await this.request<{ success?: boolean; data?: { total?: number; porCategoria?: Record<string, number>; porEstado?: Record<string, number>; porSexo?: Record<string, number> } }>('/ganado/stats')
      const d = (res as { data?: unknown })?.data
      if (d && typeof d === 'object' && !Array.isArray(d)) {
        const o = d as Record<string, unknown>
        return {
          total: typeof o.total === 'number' ? o.total : 0,
          porCategoria: (o.porCategoria && typeof o.porCategoria === 'object') ? (o.porCategoria as Record<string, number>) : {},
          porEstado: (o.porEstado && typeof o.porEstado === 'object') ? (o.porEstado as Record<string, number>) : {},
          porSexo: (o.porSexo && typeof o.porSexo === 'object') ? (o.porSexo as Record<string, number>) : {},
        }
      }
      return res as { total: number; porCategoria: Record<string, number>; porEstado: Record<string, number>; porSexo: Record<string, number> }
    } catch (error) {
      // Si el endpoint no existe, calcular estadísticas desde los datos locales
      console.warn('⚠️ Endpoint /ganado/stats no disponible, usando datos locales')
      
      // Usar datos de ejemplo directamente para evitar llamadas adicionales
      const mockData = this.getMockData()
      
      const stats = {
        total: mockData.total,
        porCategoria: {} as Record<string, number>,
        porEstado: {} as Record<string, number>,
        porSexo: {} as Record<string, number>
      }
      
      mockData.data.forEach(ganado => {
        // Por categoría
        stats.porCategoria[ganado.categoria] = (stats.porCategoria[ganado.categoria] || 0) + 1
        // Por estado
        stats.porEstado[ganado.estado] = (stats.porEstado[ganado.estado] || 0) + 1
        // Por sexo
        stats.porSexo[ganado.sexo] = (stats.porSexo[ganado.sexo] || 0) + 1
      })
      
      return stats
    }
  }

  /** GET /ganado/:id/qr - QR del animal (?format=base64 | png) */
  async getQr(ganadoId: string, format: 'base64' | 'png' = 'base64'): Promise<{ qr: string } | Blob> {
    const url = `${getApiBaseUrl()}/ganado/${ganadoId}/qr?format=${format}`
    const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null
    const res = await fetch(url, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    })
    if (!res.ok) {
      const err = await res.json().catch(() => ({})) as { error?: { message?: string }; message?: string }
      throw new Error(err?.error?.message ?? err?.message ?? `Error ${res.status}`)
    }
    if (format === 'png') return res.blob()
    const data = await res.json()
    return data?.data ?? data
  }

  /** GET /ganado/scan - Iniciar escaneo */
  async getScan(): Promise<unknown> {
    return this.request<unknown>('/ganado/scan')
  }

  /** GET /ganado/:id/trazabilidad */
  async getTrazabilidad(ganadoId: string): Promise<unknown> {
    const data = await this.request<{ success?: boolean; data?: unknown }>(`/ganado/${ganadoId}/trazabilidad`)
    return (data as { data?: unknown })?.data ?? data
  }

  /** GET /ganado/:id/trazabilidad/blockchain */
  async getTrazabilidadBlockchain(ganadoId: string): Promise<unknown> {
    const data = await this.request<{ success?: boolean; data?: unknown }>(`/ganado/${ganadoId}/trazabilidad/blockchain`)
    return (data as { data?: unknown })?.data ?? data
  }

  /** GET /ganado/:id/expediente */
  async getExpediente(ganadoId: string): Promise<unknown> {
    const data = await this.request<{ success?: boolean; data?: unknown }>(`/ganado/${ganadoId}/expediente`)
    return (data as { data?: unknown })?.data ?? data
  }

  /** POST /ganado/:id/vacunas */
  async postVacuna(ganadoId: string, body: Record<string, unknown>): Promise<unknown> {
    const data = await this.request<{ success?: boolean; data?: unknown }>(`/ganado/${ganadoId}/vacunas`, {
      method: 'POST',
      body: JSON.stringify(body),
    })
    return (data as { data?: unknown })?.data ?? data
  }

  /** POST /ganado/:id/tratamientos */
  async postTratamiento(ganadoId: string, body: Record<string, unknown>): Promise<unknown> {
    const data = await this.request<{ success?: boolean; data?: unknown }>(`/ganado/${ganadoId}/tratamientos`, {
      method: 'POST',
      body: JSON.stringify(body),
    })
    return (data as { data?: unknown })?.data ?? data
  }

  /** POST /ganado/:id/movimientos */
  async postMovimiento(ganadoId: string, body: Record<string, unknown>): Promise<unknown> {
    const data = await this.request<{ success?: boolean; data?: unknown }>(`/ganado/${ganadoId}/movimientos`, {
      method: 'POST',
      body: JSON.stringify(body),
    })
    return (data as { data?: unknown })?.data ?? data
  }

  /** POST /ganado/:id/consultas */
  async postConsulta(ganadoId: string, body: Record<string, unknown>): Promise<unknown> {
    const data = await this.request<{ success?: boolean; data?: unknown }>(`/ganado/${ganadoId}/consultas`, {
      method: 'POST',
      body: JSON.stringify(body),
    })
    return (data as { data?: unknown })?.data ?? data
  }
}

export const ganadoService = new GanadoService()
export default ganadoService
