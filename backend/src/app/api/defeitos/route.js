import prisma from '@/lib/db';
import { fail, ok, parseQuery, readJson } from '@/lib/http';
import { serializeDefeito } from '@/lib/serializers';

export async function GET(request) {
  try {
    const searchParams = parseQuery(request);
    const status = searchParams.get('status');
    const severidade = searchParams.get('severidade');
    const origem = searchParams.get('origem');
    const placaCodigo = searchParams.get('placaCodigo');

    const where = {};
    if (status) where.status = status;
    if (severidade) where.severidade = severidade;
    if (origem) where.origem = origem;
    if (placaCodigo) {
      where.placa = {
        codigo: placaCodigo,
      };
    }

    const defeitos = await prisma.defeito.findMany({
      where,
      include: {
        placa: true,
        usuario: true,
        imagens: {
          orderBy: {
            criado: 'desc',
          },
        },
      },
      orderBy: {
        criado: 'desc',
      },
    });

    return ok(defeitos.map(serializeDefeito), { total: defeitos.length });
  } catch (error) {
    console.error('Erro ao listar defeitos:', error);
    return fail('Erro ao listar defeitos');
  }
}

export async function POST(request) {
  try {
    const body = await readJson(request);
    const {
      placaId,
      tipo,
      componente,
      origem = 'manual',
      severidade = 'media',
      descricao,
      status = 'aberto',
      usuarioId,
    } = body || {};

    if (!placaId || !tipo) {
      return fail('placaId e tipo sao obrigatorios', 400, 'VALIDATION_ERROR');
    }

    const created = await prisma.defeito.create({
      data: {
        placaId,
        tipo,
        componente,
        origem,
        severidade,
        descricao,
        status,
        usuarioId,
      },
      include: {
        placa: true,
        usuario: true,
        imagens: true,
      },
    });

    return ok(serializeDefeito(created), { created: true }, { status: 201 });
  } catch (error) {
    console.error('Erro ao criar defeito:', error);
    return fail('Erro ao criar defeito');
  }
}