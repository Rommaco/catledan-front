'use client'
import Link from 'next/link'
import { AuthLayout } from '@/components/auth/AuthLayout'
import { PublicRoute } from '@/components/auth/PublicRoute'

function HomeContent() {
  return (
    <AuthLayout title="Bienvenido" subtitle="Elige una opción para continuar">
      <div className="space-y-4">
        <Link
          href="/auth/register"
          className="flex w-full justify-center rounded-xl bg-green-600 px-4 py-3 text-base font-semibold text-white shadow-sm hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors"
        >
          Crear cuenta / Registrarse
        </Link>
        <Link
          href="/auth/login"
          className="flex w-full justify-center rounded-xl border border-gray-300 bg-white px-4 py-3 text-base font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors"
        >
          Iniciar sesión
        </Link>
        <p className="text-center text-sm text-gray-500">
          ¿Ya tienes cuenta?{' '}
          <Link href="/auth/login" className="font-medium text-green-600 hover:text-green-700">
            Inicia sesión
          </Link>
          {' · '}
          <Link href="/auth/register" className="font-medium text-green-600 hover:text-green-700">
            Regístrate
          </Link>
        </p>
      </div>
    </AuthLayout>
  )
}

export default function Home() {
  return (
    <PublicRoute>
      <HomeContent />
    </PublicRoute>
  )
}
