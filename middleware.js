import { NextResponse } from 'next/server'

export function middleware(request) {
  const { pathname } = request.nextUrl
  
  // RASTREADOR: Vai imprimir no terminal do Docker toda vez que alguém acessar
  console.log('🛡️ MIDDLEWARE RODANDO NA ROTA:', pathname)

  const cargoCookie = request.cookies.get('inspectai_cargo')?.value

  if (!cargoCookie && !pathname.startsWith('/login')) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  const adminRoutes = ['/usuarios', '/configuracoes']
  const isProtectedRoute = adminRoutes.some(route => pathname.startsWith(route))

  if (isProtectedRoute && cargoCookie !== 'ADMINISTRADOR') {
    return NextResponse.redirect(new URL('/defeitos', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}