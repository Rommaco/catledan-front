import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Rutas que requieren autenticación
  const protectedRoutes = ['/dashboard', '/ganado', '/sanidad', '/reproduccion', '/cultivos', '/leche', '/finanzas', '/reportes', '/configuracion']
  
  // Rutas de autenticación (solo para usuarios no autenticados)
  const authRoutes = ['/auth/login', '/auth/register', '/auth/forgot-password', '/auth/verify-email']

  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route))
  const isAuthRoute = authRoutes.some(route => pathname.startsWith(route))

  // Para rutas protegidas, permitir acceso y dejar que el componente AuthProvider maneje la redirección
  if (isProtectedRoute) {
    return NextResponse.next()
  }

  // Para rutas de auth, permitir acceso y dejar que el componente maneje la redirección
  if (isAuthRoute) {
    return NextResponse.next()
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}
