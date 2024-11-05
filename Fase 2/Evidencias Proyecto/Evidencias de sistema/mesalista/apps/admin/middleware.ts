import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { decrypt, verifySessionMiddleware } from '@/actions/session'
import { cookies } from 'next/headers'

export const config = {
  matcher: ['/((?!api/|_next/|_static/|_vercel|[\\w-]+\\.\\w+).*)']
}

const publicRoutes = new Set(['/login'])
const waiterRoutesNotAuth = new Set(['/kitchen'])
const kitchenRoutesNotAuth = new Set(['/waiter'])

export default async function middleware(req: NextRequest) {
  const path = req.nextUrl.pathname
  const isPublicRoute = publicRoutes.has(path)

  // Si es una ruta pública (excepto login), permitir acceso directo
  if (isPublicRoute && path !== '/login') {
    return NextResponse.next()
  }

  const cookie = cookies().get('session')?.value
  const session = await decrypt(cookie)

  // Redirigir a login si no hay sesión y la ruta no es pública
  if (!session && !isPublicRoute) {
    return NextResponse.redirect(new URL('/login', req.url))
  }

  // Si hay sesión y está en login, redirigir a home
  if (session && path === '/login') {
    return NextResponse.redirect(new URL('/', req.url))
  }

  // Solo verificar el rol si hay una sesión activa
  if (session) {
    const user = await verifySessionMiddleware()

    if (!user) {
      // Limpiar cookie si la sesión no es válida
      const response = NextResponse.redirect(new URL('/login', req.url))
      response.cookies.delete('session')
      return response
    }

    // Verificar restricciones de rol
    if (
      (waiterRoutesNotAuth.has(path) && user.role === 'waiter') ||
      (kitchenRoutesNotAuth.has(path) && user.role === 'kitchen')
    ) {
      return NextResponse.redirect(new URL('/', req.url))
    }
  }

  return NextResponse.next()
}
