import { 
  LoginData, 
  RegisterData, 
  AuthResponse, 
  User 
} from '@/types/auth'
import { getApiBaseUrl } from '@/lib/api/config'

class AuthService {
  private async request<T>(
    endpoint: string, 
    options: RequestInit = {}
  ): Promise<T> {
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

  async register(data: RegisterData): Promise<AuthResponse | { message: string; requiresConfirmation: true }> {
    return this.request<AuthResponse | { message: string; requiresConfirmation: true }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async confirmSignUp(email: string, confirmationCode: string): Promise<{ message: string }> {
    return this.request<{ message: string }>('/auth/confirm-signup', {
      method: 'POST',
      body: JSON.stringify({ email, confirmationCode }),
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
    try {
      const response = await this.request<{ success?: boolean; data?: { id: string; email: string; fullName: string; businessName: string; phone?: string; plan?: { name: string }; profile?: string } }>('/perfil')
      const perfil = response?.data ?? (response as { id?: string })?.id ? response : null
      if (!perfil || typeof perfil !== 'object' || !('id' in perfil)) throw new Error('Perfil inválido')
      const p = perfil as { id: string; email: string; fullName: string; businessName: string; phone?: string; plan?: { name: string }; profile?: string }
      return {
        id: p.id,
        email: p.email,
        fullName: p.fullName,
        businessName: p.businessName || '',
        phone: p.phone || '',
        rol: (p.profile === 'trabajador' || p.profile === 'administrativo' ? p.profile : 'trabajador') as 'trabajador' | 'administrativo',
        plan: (p.plan?.name === 'pro' ? 'pro' : 'free') as 'free' | 'pro',
      }
    } catch {
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
