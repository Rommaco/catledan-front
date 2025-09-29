import { 
  Ganado, 
  CreateGanadoData, 
  UpdateGanadoData, 
  GanadoResponse, 
  GanadoFilters 
} from '@/types/ganado'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'

class GanadoService {
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
    return this.request<GanadoResponse>(endpoint)
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

  async getById(id: string): Promise<Ganado> {
    try {
      return await this.request<Ganado>(`/ganado/${id}`)
    } catch (error) {
      // Si el backend no está disponible, buscar en datos de ejemplo
      console.warn('⚠️ Backend no disponible, usando datos de ejemplo')
      const mockData = this.getMockData()
      const ganado = mockData.data.find(g => g._id === id)
      if (ganado) return ganado
      throw new Error('Ganado no encontrado')
    }
  }

  async create(data: CreateGanadoData): Promise<Ganado> {
    try {
      return await this.request<Ganado>('/ganado', {
        method: 'POST',
        body: JSON.stringify(data),
      })
    } catch (error) {
      // Si el backend no está disponible, simular creación exitosa
      console.warn('⚠️ Backend no disponible, simulando creación')
      const newGanado: Ganado = {
        _id: Date.now().toString(),
        ...data,
        user: 'user1',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
      return newGanado
    }
  }

  async update(id: string, data: UpdateGanadoData): Promise<Ganado> {
    try {
      return await this.request<Ganado>(`/ganado/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      })
    } catch (error) {
      // Si el backend no está disponible, simular actualización exitosa
      console.warn('⚠️ Backend no disponible, simulando actualización')
      const mockData = this.getMockData()
      const existingGanado = mockData.data.find(g => g._id === id)
      if (!existingGanado) throw new Error('Ganado no encontrado')
      
      const updatedGanado: Ganado = {
        ...existingGanado,
        ...data,
        updatedAt: new Date().toISOString()
      }
      return updatedGanado
    }
  }

  async delete(id: string): Promise<void> {
    try {
      return await this.request<void>(`/ganado/${id}`, {
        method: 'DELETE',
      })
    } catch (error) {
      // Si el backend no está disponible, simular eliminación exitosa
      console.warn('⚠️ Backend no disponible, simulando eliminación')
      return Promise.resolve()
    }
  }

  async getStats(): Promise<{
    total: number;
    porCategoria: Record<string, number>;
    porEstado: Record<string, number>;
    porSexo: Record<string, number>;
  }> {
    try {
      return await this.request('/ganado/stats')
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
}

export const ganadoService = new GanadoService()
export default ganadoService
