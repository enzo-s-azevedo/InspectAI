import { NextResponse } from 'next/server';

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

  // 2. Proteção do Backend
  if (path.startsWith('/api/')) {
    


    // Busca o token nos Cookies (Navegador) OU nos Headers (Testes/Mobile/Postman)
    const cookieToken = request.cookies.get('inspectai_session')?.value;
    const authHeader = request.headers.get('authorization');
    const token = cookieToken || (authHeader ? authHeader.split(' ')[1] : null);

    // Sem crachá? Fica de fora.
    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Acesso negado. Faça login para acessar esta rota.' },
        { status: 401 }
      );
    }

    // 3. BARREIRA DE CARGO (RBAC)
    try {
      // Como o Next.js Edge Runtime não suporta a biblioteca jsonwebtoken, 
      // nós abrimos o payload do token "na unha" (base64) para ler o cargo.
      const payloadBase64 = token.split('.')[1];
      const decodedPayload = JSON.parse(atob(payloadBase64));

      // Regra de Ouro: Se tentar acessar /usuarios e não for ADMIN, expulsa!
      if (path.startsWith('/api/usuarios') && decodedPayload.cargo !== 'ADMINISTRADOR') {
        return NextResponse.json(
          { success: false, error: 'Acesso negado. Requer privilégios de administrador.' },
          { status: 403 }
        );
      }
      
    } catch (error) {
      // Se o token estiver malformado
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