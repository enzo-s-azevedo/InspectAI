import { middleware } from '../../backend/src/middleware';
import { NextRequest } from 'next/server';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'sua_chave_secreta_aqui';

describe('Segurança do Middleware Next.js - Rota /api/usuarios', () => {
  
  it('🔒 Deve barrar um FUNCIONARIO tentando acessar a lista de usuários (Erro 403)', async () => {
    // Forjamos o token de funcionário
    const tokenFuncionario = jwt.sign(
      { id: 1, nome: 'João', cargo: 'FUNCIONARIO' }, 
      JWT_SECRET
    );

    // No Next.js, os middlewares exigem o NextRequest especial
    const req = new NextRequest('http://localhost:3000/api/usuarios', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${tokenFuncionario}`
      }
    });

    // Colocamos o Guarda-Costas à prova
    const res = await middleware(req);

    // O middleware deve interceptar e retornar 403 ou 401
    // (Se o seu middleware retornar 401 em vez de 403, é só ajustar o número aqui)
    expect(res.status).toBe(403); 
  });

  it('✅ Deve permitir que um ADMINISTRADOR passe pelo middleware', async () => {
    // Forjamos o token VIP
    const tokenAdmin = jwt.sign(
      { id: 2, nome: 'Admin Supremo', cargo: 'ADMINISTRADOR' }, 
      JWT_SECRET
    );

    const req = new NextRequest('http://localhost:3000/api/usuarios', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${tokenAdmin}`
      }
    });

    // Batemos no middleware
    const res = await middleware(req);

    // Detalhe do Next.js: Se o middleware autorizar, ele geralmente retorna 'undefined' 
    // ou passa reto. Então pegamos o status 200 como padrão de sucesso.
    const finalStatus = res ? res.status : 200;
    
    // Garantimos que não fomos bloqueados
    expect(finalStatus).not.toBe(403);
    expect(finalStatus).not.toBe(401);
    expect(finalStatus).not.toBe(500); // E garantimos que não deu erro 500!
  });

  it('🔒 Deve barrar um FUNCIONARIO tentando cadastrar modelos (Erro 403)', async () => {
    const tokenFuncionario = jwt.sign(
      { id: 1, nome: 'João', cargo: 'FUNCIONARIO' },
      JWT_SECRET
    );

    const req = new NextRequest('http://localhost:3000/api/modelos', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${tokenFuncionario}`,
      },
    });

    const res = await middleware(req);

    expect(res.status).toBe(403);
  });

  it('✅ Deve permitir que um ADMINISTRADOR cadastre modelos', async () => {
    const tokenAdmin = jwt.sign(
      { id: 2, nome: 'Admin Supremo', cargo: 'ADMINISTRADOR' },
      JWT_SECRET
    );

    const req = new NextRequest('http://localhost:3000/api/modelos', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${tokenAdmin}`,
      },
    });

    const res = await middleware(req);
    const finalStatus = res ? res.status : 200;

    expect(finalStatus).not.toBe(403);
    expect(finalStatus).not.toBe(401);
    expect(finalStatus).not.toBe(500);
  });

  it('🔒 Deve barrar um FUNCIONARIO tentando acessar relatórios (Erro 403)', async () => {
    const tokenFuncionario = jwt.sign(
      { id: 1, nome: 'João', cargo: 'FUNCIONARIO' },
      JWT_SECRET
    );

    const req = new NextRequest('http://localhost:3000/api/relatorios', {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${tokenFuncionario}`,
      },
    });

    const res = await middleware(req);

    expect(res.status).toBe(403);
  });

  it('✅ Deve permitir que um ADMINISTRADOR acesse relatórios', async () => {
    const tokenAdmin = jwt.sign(
      { id: 2, nome: 'Admin Supremo', cargo: 'ADMINISTRADOR' },
      JWT_SECRET
    );

    const req = new NextRequest('http://localhost:3000/api/relatorios', {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${tokenAdmin}`,
      },
    });

    const res = await middleware(req);
    const finalStatus = res ? res.status : 200;

    expect(finalStatus).not.toBe(403);
    expect(finalStatus).not.toBe(401);
    expect(finalStatus).not.toBe(500);
  });

  it('🔒 Deve retornar 401 quando não houver token', async () => {
    const req = new NextRequest('http://localhost:3000/api/usuarios', {
      method: 'GET',
    });

    const res = await middleware(req);
    expect(res.status).toBe(401);
    expect(res).toBeDefined();
  });
});
