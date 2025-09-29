import { 
  LoginData, 
  RegisterData, 
  AuthResponse, 
  User 
} from '@/types/auth'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'

class AuthService {
  private async request<T>(
    endpoint: string, 
    options: RequestInit = {}
  ): Promise<T> {
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
        
        // Crear errores personalizados
        if (response.status === 429) {
          const error = new Error('Demasiadas solicitudes. Inténtalo más tarde.')
          error.name = 'RateLimitError'
          throw error
        }
        
        if (response.status === 400 || response.status === 401) {
          const error = new Error(errorData.message || 'Credenciales inválidas')
          error.name = 'CredentialsError'
          throw error
        }
        
        if (!response.ok && !response.status) {
          const error = new Error('Error de conexión. Verifica tu internet.')
          error.name = 'NetworkError'
          throw error
        }
        
        throw new Error(errorData.message || 'Error en la solicitud')
      }

      return await response.json()
    } catch (error) {
      if (error instanceof Error) {
        throw error
      }
      throw new Error('Error desconocido')
    }
  }

  async login(data: LoginData): Promise<AuthResponse> {
    return this.request<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async register(data: RegisterData): Promise<AuthResponse> {
    return this.request<AuthResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async forgotPassword(email: string): Promise<{ message: string }> {
    return this.request<{ message: string }>('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    })
  }

  async resetPassword(
    token: string, 
    password: string
  ): Promise<{ message: string }> {
    return this.request<{ message: string }>('/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ token, password }),
    })
  }

  async googleLogin(token: string): Promise<AuthResponse> {
    return this.request<AuthResponse>('/auth/google', {
      method: 'POST',
      body: JSON.stringify({ token }),
    })
  }

  async updateUserPlan(plan: "free" | "pro"): Promise<AuthResponse> {
    return this.request<AuthResponse>('/auth/update-plan', {
      method: 'PUT',
      body: JSON.stringify({ plan }),
    })
  }

  async verifyToken(): Promise<User> {
    // Como el backend no tiene endpoint de verificación, 
    // usamos el endpoint de resumen del dashboard para verificar el token
    try {
      await this.request('/dashboard/resumen')
      // Si llegamos aquí, el token es válido
      // Devolvemos un usuario básico (el backend no devuelve info del usuario en resumen)
      const token = this.getToken()
      if (!token) throw new Error('No token found')
      
      // Decodificar el token JWT básicamente para obtener info del usuario
      const payload = JSON.parse(atob(token.split('.')[1]))
      return {
        id: payload.id || payload.userId,
        email: payload.email,
        fullName: payload.fullName || payload.name || 'Usuario',
        businessName: payload.businessName || 'Empresa',
        rol: payload.rol || 'user',
        plan: payload.plan || 'free',
        phone: payload.phone || ''
      }
    } catch (error) {
      console.error('Error verifying token:', error)
      throw new Error('Token inválido')
    }
  }

  // Métodos de utilidad
  setToken(token: string): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem('auth_token', token)
    }
  }

  getToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('auth_token')
    }
    return null
  }

  removeToken(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth_token')
    }
  }

  isAuthenticated(): boolean {
    return !!this.getToken()
  }
}

export const authService = new AuthService()
export default authService
