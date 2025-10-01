'use client'
import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { AuthLayout } from '@/components/auth/AuthLayout'
import { PublicRoute } from '@/components/auth/PublicRoute'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { useAuth } from '@/contexts/AuthContext'
import { useToast } from '@/hooks/useToast'
import { 
  UserIcon,
  EnvelopeIcon, 
  LockClosedIcon,
  PhoneIcon,
  BuildingOfficeIcon,
  EyeIcon,
  EyeSlashIcon
} from '@heroicons/react/24/outline'

function RegisterContent() {
  const router = useRouter()
  const { register } = useAuth()
  const { toast } = useToast()
  
  const [formData, setFormData] = useState({
    fullName: '',
    businessName: '',
    phone: '',
    email: '',
    password: '',
    confirmPassword: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    // Validar que las contraseñas coincidan
    if (formData.password !== formData.confirmPassword) {
      toast({
        type: 'error',
        title: 'Error de validación',
        message: 'Las contraseñas no coinciden.'
      })
      setIsLoading(false)
      return
    }

    try {
      await register({
        fullName: formData.fullName,
        businessName: formData.businessName,
        phone: formData.phone,
        email: formData.email,
        password: formData.password
      })
      
      toast({
        type: 'success',
        title: '¡Registro exitoso!',
        message: 'Tu cuenta ha sido creada correctamente.'
      })
      
      router.push('/dashboard')
    } catch (error: unknown) {
      console.error('Register error:', error)
      
      let errorMessage = 'Error en el registro. Inténtalo de nuevo.'
      let errorType: 'error' | 'warning' = 'error'

      if (error instanceof Error) {
        if (error.name === 'CredentialsError') {
          errorMessage = 'El email ya está registrado o hay un error en los datos.'
        } else if (error.name === 'RateLimitError') {
          errorMessage = 'Demasiados intentos. Espera unos minutos.'
          errorType = 'warning'
        } else if (error.name === 'NetworkError') {
          errorMessage = 'Error de conexión. Verifica tu internet.'
        }
      }

      toast({
        type: errorType,
        title: 'Error de registro',
        message: errorMessage
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  return (
    <AuthLayout
      title="Crear Cuenta"
      subtitle="Regístrate para comenzar a gestionar tu ganadería"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-4">
          <Input
            name="fullName"
            label="Nombre completo"
            placeholder="Tu nombre completo"
            value={formData.fullName}
            onChange={handleInputChange}
            icon={<UserIcon className="w-5 h-5" />}
            validationRules={{ required: true, minLength: 2 }}
            animate={true}
          />

          <Input
            name="businessName"
            label="Nombre del negocio"
            placeholder="Nombre de tu rancho/empresa"
            value={formData.businessName}
            onChange={handleInputChange}
            icon={<BuildingOfficeIcon className="w-5 h-5" />}
            validationRules={{ required: true, minLength: 2 }}
            animate={true}
          />

          <Input
            name="phone"
            label="Teléfono"
            placeholder="1234567890"
            value={formData.phone}
            onChange={handleInputChange}
            icon={<PhoneIcon className="w-5 h-5" />}
            validationRules={{ required: true, phone: true }}
            animate={true}
          />

          <Input
            name="email"
            type="email"
            label="Correo electrónico"
            placeholder="tu@email.com"
            value={formData.email}
            onChange={handleInputChange}
            icon={<EnvelopeIcon className="w-5 h-5" />}
            validationRules={{ required: true, email: true }}
            animate={true}
          />

          <div className="relative">
            <Input
              name="password"
              type={showPassword ? 'text' : 'password'}
              label="Contraseña"
              placeholder="Mínimo 6 caracteres"
              value={formData.password}
              onChange={handleInputChange}
              icon={<LockClosedIcon className="w-5 h-5" />}
              validationRules={{ required: true, minLength: 6 }}
              animate={true}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-9 text-gray-400 hover:text-gray-600 transition-colors duration-200"
            >
              {showPassword ? (
                <EyeSlashIcon className="w-5 h-5" />
              ) : (
                <EyeIcon className="w-5 h-5" />
              )}
            </button>
          </div>

          <div className="relative">
            <Input
              name="confirmPassword"
              type={showConfirmPassword ? 'text' : 'password'}
              label="Confirmar contraseña"
              placeholder="Repite tu contraseña"
              value={formData.confirmPassword}
              onChange={handleInputChange}
              icon={<LockClosedIcon className="w-5 h-5" />}
              validationRules={{ required: true, minLength: 6 }}
              animate={true}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-9 text-gray-400 hover:text-gray-600 transition-colors duration-200"
            >
              {showConfirmPassword ? (
                <EyeSlashIcon className="w-5 h-5" />
              ) : (
                <EyeIcon className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>

        <div className="text-sm text-gray-600">
          <p>
            Al registrarte, aceptas nuestros{' '}
            <Link href="/terms" className="text-green-600 hover:text-green-700">
              Términos de Servicio
            </Link>{' '}
            y{' '}
            <Link href="/privacy" className="text-green-600 hover:text-green-700">
              Política de Privacidad
            </Link>
            .
          </p>
        </div>

        <Button
          type="submit"
          variant="primary"
          size="lg"
          loading={isLoading}
          className="w-full"
          animate={true}
          glow={true}
        >
          {isLoading ? 'Creando cuenta...' : 'Crear Cuenta'}
        </Button>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-gray-500">O continúa con</span>
          </div>
        </div>

        <Button
          type="button"
          variant="secondary"
          size="lg"
          className="w-full"
          animate={true}
          onClick={() => {
            toast({
              type: 'info',
              title: 'Google Auth',
              message: 'Funcionalidad de Google en desarrollo'
            })
          }}
        >
          <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          Continuar con Google
        </Button>

        <div className="text-center">
          <p className="text-sm text-gray-600">
            ¿Ya tienes una cuenta?{' '}
            <Link 
              href="/auth/login"
              className="text-green-600 hover:text-green-700 font-medium transition-colors duration-200"
            >
              Inicia sesión aquí
            </Link>
          </p>
        </div>
      </form>
    </AuthLayout>
  )
}

export default function RegisterPage() {
  return (
    <PublicRoute>
      <RegisterContent />
    </PublicRoute>
  )
}
