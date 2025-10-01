import {
  Configuracion,
  ConfiguracionEmpresa,
  ConfiguracionUsuario,
  ConfiguracionSistema,
  UpdateConfiguracionData,
} from '@/types/configuracion'

class ConfiguracionService {
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

    const response = await fetch(`${this.baseUrl}/configuracion${endpoint}`, config)

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.message || `Error en la solicitud: ${response.status}`)
    }

    return response.json()
  }

  async get(): Promise<Configuracion> {
    return this.request<Configuracion>('/')
  }

  async create(data: {
    empresa: ConfiguracionEmpresa
    usuario: ConfiguracionUsuario
    sistema: ConfiguracionSistema
  }): Promise<{ message: string; configuracion: Configuracion }> {
    return this.request<{ message: string; configuracion: Configuracion }>('/', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async update(data: UpdateConfiguracionData): Promise<{ message: string; configuracion: Configuracion }> {
    return this.request<{ message: string; configuracion: Configuracion }>('/', {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  }

  async updateEmpresa(empresa: ConfiguracionEmpresa): Promise<{ message: string; configuracion: Configuracion }> {
    return this.request<{ message: string; configuracion: Configuracion }>('/empresa', {
      method: 'PUT',
      body: JSON.stringify({ empresa }),
    })
  }

  async updateUsuario(usuario: ConfiguracionUsuario): Promise<{ message: string; configuracion: Configuracion }> {
    return this.request<{ message: string; configuracion: Configuracion }>('/usuario', {
      method: 'PUT',
      body: JSON.stringify({ usuario }),
    })
  }

  async updateSistema(sistema: ConfiguracionSistema): Promise<{ message: string; configuracion: Configuracion }> {
    return this.request<{ message: string; configuracion: Configuracion }>('/sistema', {
      method: 'PUT',
      body: JSON.stringify({ sistema }),
    })
  }

  async delete(): Promise<{ message: string }> {
    return this.request<{ message: string }>('/', {
      method: 'DELETE',
    })
  }
}

export const configuracionService = new ConfiguracionService()
export default configuracionService


