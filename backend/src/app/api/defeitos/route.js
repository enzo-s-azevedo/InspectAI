import prisma from '@/lib/db';
import { fail, ok, parseQuery, readJson } from '@/lib/http';
import { serializeDefeito } from '@/lib/serializers';

const STATUS_CONFIRMATION_VALUES = new Set(['confirmado', 'falso_positivo']);
const TIPO_VALUES = new Set(['imagem', 'video']);

function normalizeStatusConfirmacao(value) {
  const status = String(value || 'confirmado').trim();
  return STATUS_CONFIRMATION_VALUES.has(status) ? status : null;
}

function normalizeTipo(value) {
  const tipo = String(value || 'imagem').trim();
  return TIPO_VALUES.has(tipo) ? tipo : null;
}

export async function GET(request) {
  try {
    const searchParams = parseQuery(request);
    const placaId = searchParams.get('placa_id') || searchParams.get('id_placa');
    const modeloCodigo = searchParams.get('modelo_codigo') || searchParams.get('placaCodigo');
    const classeDefeito = searchParams.get('classe_defeito');
    const statusConfirmacao = searchParams.get('status_confirmacao');
    const tipo = searchParams.get('tipo');

    const where = {};
    if (classeDefeito) where.classeDefeito = classeDefeito;
    if (tipo) {
      const tipoFinal = normalizeTipo(tipo);
      if (!tipoFinal) return fail('tipo invalido', 400, 'VALIDATION_ERROR');
      where.tipo = tipoFinal;
    }
    if (statusConfirmacao) {
      const status = normalizeStatusConfirmacao(statusConfirmacao);
      if (!status) return fail('status_confirmacao invalido', 400, 'VALIDATION_ERROR');
      where.statusConfirmacao = status;
    }
    if (placaId) {
      const placaIdNumber = Number(placaId);
      if (!Number.isInteger(placaIdNumber)) {
        return fail('placa_id invalido', 400, 'VALIDATION_ERROR');
      }
      where.placaId = placaIdNumber;
    }
    if (modeloCodigo) {
      where.placa = {
        modeloCodigo,
      };
    }

    const defeitos = await prisma.defeito.findMany({
      where,
      include: {
        placa: true,
      },
      orderBy: {
        id: 'desc',
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
    const placaOrigemId = Number(body?.placa_id ?? body?.id_placa);
    const classeFinal = body?.classe_defeito ?? null;
    const statusConfirmacao = normalizeStatusConfirmacao(body?.status_confirmacao);
    const tipo = normalizeTipo(body?.tipo);

    if (!Number.isInteger(placaOrigemId)) {
      return fail('placa_id e obrigatorio', 400, 'VALIDATION_ERROR');
    }
    if (!statusConfirmacao) {
      return fail('status_confirmacao invalido', 400, 'VALIDATION_ERROR');
    }
    if (!tipo) {
      return fail('tipo invalido', 400, 'VALIDATION_ERROR');
    }

    const dataHora = body?.data_hora ? new Date(body.data_hora) : null;
    if (dataHora && Number.isNaN(dataHora.getTime())) {
      return fail('data_hora invalida', 400, 'VALIDATION_ERROR');
    }

    const created = await prisma.defeito.create({
      data: {
        placaId: placaOrigemId,
        classeDefeito: classeFinal === null || classeFinal === undefined ? null : String(classeFinal),
        statusConfirmacao,
        tipo,
        ...(tipo === 'imagem' ? { dataHora: null } : {}),
        ...(tipo === 'video' && dataHora ? { dataHora } : {}),
      },
      include: {
        placa: true,
      },
    });

    return ok(serializeDefeito(created), { created: true }, { status: 201 });
  } catch (error) {
    console.error('Erro ao criar defeito:', error);
    return fail('Erro ao criar defeito');
  }
}

export async function PUT(request) {
  try {
    const body = await readJson(request);
    const id = Number(body?.id);
    const statusConfirmacao = normalizeStatusConfirmacao(body?.status_confirmacao);

    if (!Number.isInteger(id)) {
      return fail('id do defeito e obrigatorio', 400, 'VALIDATION_ERROR');
    }
    if (!statusConfirmacao) {
      return fail('status_confirmacao invalido', 400, 'VALIDATION_ERROR');
    }

    const updated = await prisma.defeito.update({
      where: { id },
      data: { statusConfirmacao },
      include: {
        placa: true,
      },
    });

    return ok(serializeDefeito(updated));
  } catch (error) {
    if (error.code === 'P2025') {
      return fail('Defeito nao encontrado', 404, 'NOT_FOUND');
    }
    console.error('Erro ao atualizar defeito:', error);
    return fail('Erro ao atualizar defeito');
  }
}
