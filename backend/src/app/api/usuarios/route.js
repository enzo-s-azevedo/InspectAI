import prisma from '@/lib/db';
import { fail, ok, parseQuery, readJson } from '@/lib/http';
import { serializeUsuario } from '@/lib/serializers';

/**
 * GET /api/usuarios
 * Lista todos os usuários
 * Query params: papel=admin|funcionario|inspetor, status=ativo|inativo
 */
export async function GET(request) {
  try {
    const searchParams = parseQuery(request);
    const papel = searchParams.get('papel');
    const status = searchParams.get('status');

    const where = {};
    if (papel) where.papel = papel;
    if (status) where.status = status;

    const usuarios = await prisma.usuario.findMany({
      where,
      orderBy: { criado: 'desc' },
    });

    return ok(usuarios.map(serializeUsuario), { total: usuarios.length });
  } catch (error) {
    console.error('Erro ao listar usuários:', error);
    return fail('Erro ao listar usuarios');
  }
}

/**
 * POST /api/usuarios
 * Criar novo usuário
 * Body: { email, nome, papel?, status? }
 */
export async function POST(request) {
  try {
    const body = await readJson(request);
    const { email, nome, papel, status } = body || {};

    if (!email || !nome) {
      return fail('Email e nome sao obrigatorios', 400, 'VALIDATION_ERROR');
    }

    const novoUsuario = await prisma.usuario.create({
      data: {
        email,
        nome,
        papel: papel || 'funcionario',
        status: status || 'ativo',
      },
    });

    return ok(serializeUsuario(novoUsuario), { created: true }, { status: 201 });
  } catch (error) {
    if (error.code === 'P2002') {
      return fail('Email ja cadastrado', 409, 'UNIQUE_CONSTRAINT');
    }
    console.error('Erro ao criar usuário:', error);
    return fail('Erro ao criar usuario');
  }
}
