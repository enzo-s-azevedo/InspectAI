import { NextResponse } from 'next/server'
import { isAdministrador, ROTAS_ADMIN } from './lib/permissions'

export function middleware(request) {
  const { pathname } = request.nextUrl
  
  const cargoCookie = request.cookies.get('inspectai_cargo')?.value
  const isAcessoNegado = pathname.startsWith('/acesso-negado')

  if (!cargoCookie && !pathname.startsWith('/login') && !isAcessoNegado) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  const isProtectedRoute = ROTAS_ADMIN.some(route => pathname.startsWith(route))

  if (isProtectedRoute && !isAdministrador(cargoCookie)) {
    return NextResponse.redirect(new URL('/acesso-negado', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!api|backend-api|_next/static|_next/image|favicon.ico).*)'],
}
