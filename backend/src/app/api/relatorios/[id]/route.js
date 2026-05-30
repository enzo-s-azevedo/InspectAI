import prisma from '@/lib/db';
import { getUsuarioAutenticado } from '@/lib/auth';
import { fail, ok, readJson } from '@/lib/http';
import { isAdministrador } from '@/lib/permissions';
import { serializeRelatorio } from '@/lib/serializers';

function parseId(value) {
  const id = Number(value);
  return Number.isInteger(id) && id > 0 ? id : null;
}

async function atualizarRelatorio(request, { params }) {
  const usuario = getUsuarioAutenticado(request);
  if (!usuario?.id) {
    return fail('Usuario autenticado e obrigatorio', 401, 'AUTH_REQUIRED');
  }

  if (!isAdministrador(usuario.cargo)) {
    return fail('Requer privilegios de administrador', 403, 'FORBIDDEN');
  }

  const { id } = await params;
  const relatorioId = parseId(id);
  if (!relatorioId) {
    return fail('id invalido', 400, 'VALIDATION_ERROR');
  }

  const body = (await readJson(request)) || {};
  const placaId = body.placa_id ?? body.placaId;
  const data = {
    idUsuarioUltimoAcesso: Number(usuario.id),
  };

  if (placaId !== undefined) {
    const parsedPlacaId = parseId(placaId);
    if (!parsedPlacaId) {
      return fail('placa_id invalido', 400, 'VALIDATION_ERROR');
    }
    data.placaId = parsedPlacaId;
  }

  try {
    const relatorio = await prisma.relatorio.update({
      where: { id: relatorioId },
      data,
      include: {
        placa: true,
        usuarioCriador: true,
        usuarioUltimoAcesso: true,
      },
    });

    return ok(serializeRelatorio(relatorio));
  } catch (error) {
    if (error.code === 'P2025') {
      return fail('Relatorio nao encontrado', 404, 'NOT_FOUND');
    }

    if (error.code === 'P2003') {
      return fail('Relacionamento invalido para o relatorio', 400, 'REFERENTIAL_INTEGRITY');
    }

    console.error('Erro ao atualizar relatorio:', error);
    return fail('Erro ao atualizar relatorio', 500, 'PERSISTENCE_ERROR', error.message || null);
  }
}

export const PATCH = atualizarRelatorio;
export const PUT = atualizarRelatorio;
