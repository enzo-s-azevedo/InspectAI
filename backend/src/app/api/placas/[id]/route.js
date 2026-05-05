import prisma from '@/lib/db';
import { fail, ok, readJson } from '@/lib/http';
import { serializeUsuario } from '@/lib/serializers';

// GET: Busca um usuário específico
export async function GET(request, { params }) {
  const { id } = params;
  const usuario = await prisma.placas.findUnique({ where: { id } });
  return usuario ? ok(serializeUsuario(usuario)) : fail('Usuário não encontrado', 404);
}

// PUT: Edita o usuário
export async function PUT(request, { params }) {
  try {
    const resolvedParams = await params;
    const id = resolvedParams.id;
    const body = await readJson(request);

    const placaAtualizada = await prisma.placa.update({
      where: { id: String(id) },
      data: body
    });

    return ok(placaAtualizada);
  } catch (error) {
    console.error('ERRO NO PUT PLACA:', error);
    return fail('Erro ao atualizar placa: ' + error.message, 400);
  }
}

// DELETE: Remove o usuário
export async function DELETE(request, { params }) {
  try {
    // 1. Aguarda a resolução dos parâmetros da URL
    const resolvedParams = await params;
    const id = resolvedParams.id;

    if (!id) {
      return fail('ID da placa não identificado', 400);
    }

    // 2. Executa a exclusão no banco de dados
    await prisma.placa.delete({
      where: { id: String(id) },
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