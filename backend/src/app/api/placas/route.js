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
        modelo: true,
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
 * Body: { nome_classe, codigo?, descricao?, localizacao? }
 */
export async function POST(request) {
  try {
    const body = await readJson(request);
    const { codigo, modelo, nome_classe, nomeClasse, descricao, localizacao } = body || {};
    const classeFinal = nome_classe || nomeClasse || codigo;
    const modeloCodigo = String(modelo || codigo || classeFinal || '').trim();

    if (!classeFinal || !modeloCodigo) {
      return fail('modelo e nome_classe da placa sao obrigatorios', 400, 'VALIDATION_ERROR');
    }

    await prisma.modelo.upsert({
      where: { codigo: modeloCodigo },
      update: {},
      create: {
        codigo: modeloCodigo,
        descricao: `Modelo ${modeloCodigo}`,
      },
    });

    const novaPlaca = await prisma.placa.create({
      data: {
        codigo: codigo || null,
        modeloCodigo,
        nomeClasse: String(classeFinal),
        descricao,
        localizacao,
      },
      include: {
        modelo: true,
      },
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
