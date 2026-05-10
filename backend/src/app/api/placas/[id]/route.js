import prisma from '@/lib/db';
import { fail, ok, readJson } from '@/lib/http';
import { serializePlaca } from '@/lib/serializers';

// GET: Busca uma placa específica
export async function GET(request, { params }) {
  const resolvedParams = await params;
  const id = Number(resolvedParams.id);
  if (!Number.isInteger(id)) return fail('ID da placa invalido', 400);

  const placa = await prisma.placa.findUnique({
    where: { id },
    include: {
      modelo: true,
      defeitos: {
        select: {
          id: true,
          codigoInterno: true,
          classeDefeito: true,
          tipo: true,
          status: true,
          severidade: true,
        },
      },
    },
  });
  return placa ? ok(serializePlaca(placa)) : fail('Placa nao encontrada', 404);
}

// PUT: Edita a placa
export async function PUT(request, { params }) {
  try {
    const resolvedParams = await params;
    const id = Number(resolvedParams.id);
    if (!Number.isInteger(id)) return fail('ID da placa invalido', 400);

    const body = await readJson(request);
    const { nome_classe, nomeClasse, codigo, modelo, descricao, localizacao } = body || {};
    const modeloCodigo = modelo !== undefined ? String(modelo).trim() : null;

    if (modeloCodigo) {
      await prisma.modelo.upsert({
        where: { codigo: modeloCodigo },
        update: {},
        create: {
          codigo: modeloCodigo,
          descricao: `Modelo ${modeloCodigo}`,
        },
      });
    }

    const placaAtualizada = await prisma.placa.update({
      where: { id },
      data: {
        ...(codigo !== undefined ? { codigo: codigo || null } : {}),
        ...(modeloCodigo ? { modeloCodigo } : {}),
        ...(nome_classe !== undefined || nomeClasse !== undefined
          ? { nomeClasse: String(nome_classe || nomeClasse) }
          : {}),
        ...(descricao !== undefined ? { descricao } : {}),
        ...(localizacao !== undefined ? { localizacao } : {}),
      },
      include: {
        modelo: true,
      },
    });

    return ok(serializePlaca(placaAtualizada));
  } catch (error) {
    console.error('ERRO NO PUT PLACA:', error);
    return fail('Erro ao atualizar placa: ' + error.message, 400);
  }
}

// DELETE: Remove a placa
export async function DELETE(request, { params }) {
  try {
    // 1. Aguarda a resolução dos parâmetros da URL
    const resolvedParams = await params;
    const id = Number(resolvedParams.id);

    if (!Number.isInteger(id)) {
      return fail('ID da placa não identificado', 400);
    }

    // 2. Executa a exclusão no banco de dados
    await prisma.placa.delete({
      where: { id },
    });

    return ok({ message: 'Placa removida com sucesso' });
  } catch (error) {
    console.error('ERRO NO DELETE PLACA:', error);

    // Erro P2025: O registro não existe no banco
    if (error.code === 'P2025') {
      return fail('Placa não encontrada', 404);
    }

    // Erro P2003: Restrição de chave estrangeira (placa tem defeitos ou inspeções)
    if (error.code === 'P2003') {
      return fail('Não é possível deletar: esta placa possui defeitos ou inspeções vinculadas.', 400);
    }

    return fail('Erro interno ao tentar remover a placa', 500);
  }
}
