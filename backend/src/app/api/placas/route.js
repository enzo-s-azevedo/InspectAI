import prisma from '@/lib/db';
import { fail, ok, readJson } from '@/lib/http';
import { serializePlaca } from '@/lib/serializers';

/**
 * GET /api/placas
 * Lista todas as placas com seus defeitos associados
 */
export async function GET(request) {
  try {
    const placas = await prisma.placa.findMany({
      include: {
        defeitos: {
          select: {
            id: true,
            codigoInterno: true,
            tipo: true,
            status: true,
            severidade: true,
          },
        },
        inspecoes: {
          orderBy: { criado: 'desc' },
          take: 5,
        },
      },
      orderBy: { criado: 'desc' },
    });

    return ok(placas.map(serializePlaca), { total: placas.length });
  } catch (error) {
    console.error('Erro ao listar placas:', error);
    return fail('Erro ao listar placas');
  }
}

/**
 * POST /api/placas
 * Criar nova placa
 * Body: { codigo, descricao?, localizacao? }
 */
export async function POST(request) {
  try {
    const body = await readJson(request);
    const { codigo, descricao, localizacao } = body || {};

    if (!codigo) {
      return fail('Codigo da placa e obrigatorio', 400, 'VALIDATION_ERROR');
    }

    const novaPlaca = await prisma.placa.create({
      data: { codigo, descricao, localizacao },
    });

    return ok(serializePlaca(novaPlaca), { created: true }, { status: 201 });
  } catch (error) {
    if (error.code === 'P2002') {
      return fail('Codigo de placa ja existe', 409, 'UNIQUE_CONSTRAINT');
    }
    console.error('Erro ao criar placa:', error);
    return fail('Erro ao criar placa');
  }
}
