'use client'
import React, { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { AuthLayout } from '@/components/auth/AuthLayout'
import { PublicRoute } from '@/components/auth/PublicRoute'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { useAuth } from '@/contexts/AuthContext'
import { useToast } from '@/hooks/useToast'
import { EnvelopeIcon, KeyIcon } from '@heroicons/react/24/outline'

const PENDING_EMAIL_KEY = 'pending_verify_email'
const PENDING_PASSWORD_KEY = 'pending_verify_password'

function VerifyEmailContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { confirmSignUp } = useAuth()
  const { toast } = useToast()
  const [email, setEmail] = useState('')
  const [code, setCode] = useState('')
  const [password, setPassword] = useState('')
  const [hasStoredPassword, setHasStoredPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    const fromQuery = searchParams.get('email') ?? ''
    const fromStorage =
      typeof window !== 'undefined' ? sessionStorage.getItem(PENDING_EMAIL_KEY) ?? '' : ''
    const nextEmail = fromQuery || fromStorage
    setEmail(nextEmail)
    if (typeof window !== 'undefined' && sessionStorage.getItem(PENDING_PASSWORD_KEY)) {
      setHasStoredPassword(true)
    }
  }, [searchParams])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim()) {
      toast({
        type: 'error',
        title: 'Correo requerido',
        message: 'Ingresa el correo con el que te registraste.'
      })
      return
    }
    if (!code.trim()) {
      toast({
        type: 'error',
        title: 'Código requerido',
        message: 'Ingresa el código de verificación que te enviamos por correo.'
      })
      return
    }
    const passwordToUse =
      hasStoredPassword && typeof window !== 'undefined'
        ? sessionStorage.getItem(PENDING_PASSWORD_KEY)
        : password
    if (!passwordToUse) {
      toast({
        type: 'error',
        title: 'Contraseña requerida',
        message: 'Ingresa tu contraseña para completar la verificación.'
      })
      return
    }
    setIsLoading(true)
    try {
      await confirmSignUp(email.trim(), code.trim(), passwordToUse)
      if (typeof window !== 'undefined') {
        sessionStorage.removeItem(PENDING_EMAIL_KEY)
        sessionStorage.removeItem(PENDING_PASSWORD_KEY)
      }
      toast({
        type: 'success',
        title: '¡Correo verificado!',
        message: 'Tu cuenta está activa. Redirigiendo al panel.'
      })
      router.push('/dashboard')
    } catch (error: unknown) {
      console.error('Verify email error:', error)
      let errorMessage = 'Código inválido o expirado. Revisa el correo e inténtalo de nuevo.'
      if (error instanceof Error) {
        if (error.name === 'CredentialsError') {
          errorMessage = error.message || 'Código o contraseña incorrectos.'
        }
      }
      toast({
        type: 'error',
        title: 'Error de verificación',
        message: errorMessage
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <AuthLayout
      title="Verificar correo"
      subtitle="Ingresa el código que te enviamos a tu correo electrónico"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-4">
          <Input
            name="email"
            type="email"
            label="Correo electrónico"
            placeholder="tu@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            icon={<EnvelopeIcon className="w-5 h-5" />}
            validationRules={{ required: true, email: true }}
            animate={true}
          />
          <Input
            name="code"
            type="text"
            label="Código de verificación"
            placeholder="Ej: 123456"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            icon={<KeyIcon className="w-5 h-5" />}
            validationRules={{ required: true }}
            animate={true}
            autoComplete="one-time-code"
          />
          {!hasStoredPassword && (
            <Input
              name="password"
              type="password"
              label="Contraseña"
              placeholder="Tu contraseña de la cuenta"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              validationRules={{ required: true, minLength: 6 }}
              animate={true}
            />
          )}
        </div>
        <p className="text-sm text-gray-500">
          Revisa la bandeja de entrada (y spam) del correo <strong>{email || 'indicado'}</strong> y
          copia el código que te enviamos.
        </p>
        <Button
          type="submit"
          variant="primary"
          size="lg"
          loading={isLoading}
          className="w-full"
          animate={true}
          glow={true}
        >
          {isLoading ? 'Verificando...' : 'Verificar y continuar'}
        </Button>
        <div className="text-center">
          <p className="text-sm text-gray-600">
            ¿No recibiste el código?{' '}
            <Link
              href="/auth/register"
              className="text-green-600 hover:text-green-700 font-medium transition-colors duration-200"
            >
              Regístrate de nuevo
            </Link>
            {' o '}
            <Link
              href="/auth/login"
              className="text-green-600 hover:text-green-700 font-medium transition-colors duration-200"
            >
              Inicia sesión
            </Link>
          </p>
        </div>
      </form>
    </AuthLayout>
  )
}

export default function VerifyEmailPage() {
  return (
    <PublicRoute>
      <VerifyEmailContent />
    </PublicRoute>
  )
}
