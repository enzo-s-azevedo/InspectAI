import { NextResponse } from 'next/server';
import { isAdministrador } from './lib/permissions';

export function middleware(request) {
  const path = request.nextUrl.pathname;

  // 1. Lista VIP rigorosa (Removemos o /api/usuarios daqui!)
  const rotasPublicas = [
    '/api/auth/login', 
    '/api/health',
    '/api/swagger'
  ];

  if (rotasPublicas.some(rota => path.startsWith(rota))) {
    return NextResponse.next();
  }

  if (path.startsWith('/api/')) {
    const cookieToken = request.cookies.get('inspectai_session')?.value;
    const authHeader = request.headers.get('authorization');
    const token = cookieToken || (authHeader ? authHeader.split(' ')[1] : null);

    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Acesso negado. Faça login para acessar esta rota.' },
        { status: 401 }
      );
    }

    try {
      const payloadBase64 = token.split('.')[1];
      const decodedPayload = JSON.parse(atob(payloadBase64));
      const cargo = decodedPayload.cargo;
      const metodo = request.method;

      const rotaExigeAdmin =
        path.startsWith('/api/usuarios') ||
        path.startsWith('/api/relatorios') ||
        (path.startsWith('/api/modelos') && metodo !== 'GET');

      if (rotaExigeAdmin && !isAdministrador(cargo)) {
        return NextResponse.json(
          { success: false, error: 'Acesso negado. Requer privilégios de administrador.' },
          { status: 403 }
        );
      }
      
    } catch (error) {
      return NextResponse.json(
        { success: false, error: 'Token inválido ou corrompido.' },
        { status: 401 }
      );
    }
  }

  // Passou por todas as provas? Pode entrar.
  return NextResponse.next();
}

export const config = {
  matcher: ['/api/:path*'],
};
