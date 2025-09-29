'use client'
import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { 
  AuthContextType, 
  AuthState, 
  LoginData, 
  RegisterData, 
  User,
  AuthError
} from '@/types/auth'
import { authService } from '@/lib/auth/authService'

const AuthContext = createContext<AuthContextType | undefined>(undefined)

interface AuthProviderProps {
  children: ReactNode
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    token: null,
    isAuthenticated: false,
    isLoading: true,
  })

  // Verificar autenticación al cargar la app
  useEffect(() => {
    const initAuth = async () => {
      try {
        const token = authService.getToken()
        if (token) {
          // Verificar si el token es válido
          const user = await authService.verifyToken()
          setAuthState({
            user,
            token,
            isAuthenticated: true,
            isLoading: false,
          })
        } else {
          setAuthState({
            user: null,
            token: null,
            isAuthenticated: false,
            isLoading: false,
          })
        }
      } catch (error) {
        console.error('Error verifying token:', error)
        authService.removeToken()
        setAuthState({
          user: null,
          token: null,
          isAuthenticated: false,
          isLoading: false,
        })
      }
    }

    initAuth()
  }, [])

  const login = async (data: LoginData) => {
    try {
      const response = await authService.login(data)
      authService.setToken(response.token)
      
      // Si la respuesta incluye el usuario, lo usamos; si no, lo obtenemos
      let user = response.user
      if (!user) {
        user = await authService.verifyToken()
      }

      setAuthState({
        user,
        token: response.token,
        isAuthenticated: true,
        isLoading: false,
      })

      return response
    } catch (error) {
      throw error
    }
  }

  const register = async (data: RegisterData) => {
    try {
      const response = await authService.register(data)
      authService.setToken(response.token)
      
      // Si la respuesta incluye el usuario, lo usamos; si no, lo obtenemos
      let user = response.user
      if (!user) {
        user = await authService.verifyToken()
      }

      setAuthState({
        user,
        token: response.token,
        isAuthenticated: true,
        isLoading: false,
      })

      return response
    } catch (error) {
      throw error
    }
  }

  const googleLogin = async (token: string) => {
    try {
      const response = await authService.googleLogin(token)
      authService.setToken(response.token)
      
      // Si la respuesta incluye el usuario, lo usamos; si no, lo obtenemos
      let user = response.user
      if (!user) {
        user = await authService.verifyToken()
      }

      setAuthState({
        user,
        token: response.token,
        isAuthenticated: true,
        isLoading: false,
      })

      return response
    } catch (error) {
      throw error
    }
  }

  const logout = () => {
    authService.removeToken()
    setAuthState({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
    })
  }

  const forgotPassword = async (email: string) => {
    return await authService.forgotPassword(email)
  }

  const resetPassword = async (token: string, password: string) => {
    return await authService.resetPassword(token, password)
  }

  const updatePlan = async (plan: "free" | "pro") => {
    try {
      const response = await authService.updateUserPlan(plan)
      
      // Actualizar el token si es necesario
      if (response.token) {
        authService.setToken(response.token)
      }

      // Actualizar el usuario en el estado
      setAuthState(prev => ({
        ...prev,
        user: prev.user ? { ...prev.user, plan } : null,
        token: response.token || prev.token,
      }))

      return response
    } catch (error) {
      throw error
    }
  }

  const value: AuthContextType = {
    ...authState,
    login,
    register,
    googleLogin,
    logout,
    forgotPassword,
    resetPassword,
    updatePlan,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export default AuthContext
