import prisma from '@/lib/db';
import { fail, ok, parseQuery, readJson } from '@/lib/http';
import { serializeRelatorio } from '@/lib/serializers';

export async function GET(request) {
  try {
    const searchParams = parseQuery(request);
    const status = searchParams.get('status');
    const usuarioId = searchParams.get('usuarioId');

    const where = {};
    if (status) where.status = status;
    if (usuarioId) where.usuarioId = usuarioId;

    const relatorios = await prisma.relatorio.findMany({
      where,
      include: {
        usuario: true,
        defeitos: {
          include: {
            defeito: {
              include: {
                placa: true,
                usuario: true,
              },
            },
          },
        },
      },
      orderBy: {
        criado: 'desc',
      },
    });

    return ok(relatorios.map(serializeRelatorio), { total: relatorios.length });
  } catch (error) {
    console.error('Erro ao listar relatorios:', error);
    return fail('Erro ao listar relatorios');
  }
}

export async function POST(request) {
  try {
    const body = await readJson(request);
    const {
      titulo,
      descricao,
      usuarioId,
      origem = 'inspecao',
      status = 'rascunho',
      defeitoIds = [],
    } = body || {};

    if (!titulo || !usuarioId) {
      return fail('titulo e usuarioId sao obrigatorios', 400, 'VALIDATION_ERROR');
    }

    const relatorio = await prisma.relatorio.create({
      data: {
        titulo,
        descricao,
        usuarioId,
        origem,
        status,
        defeitos: {
          create: Array.isArray(defeitoIds)
            ? defeitoIds.map((defeitoId) => ({ defeitoId }))
            : [],
        },
      },
      include: {
        usuario: true,
        defeitos: {
          include: {
            defeito: {
              include: {
                placa: true,
                usuario: true,
              },
            },
          },
        },
      },
    });

    return ok(serializeRelatorio(relatorio), { created: true }, { status: 201 });
  } catch (error) {
    console.error('Erro ao criar relatorio:', error);
    return fail('Erro ao criar relatorio');
  }
}
