import prisma from '@/lib/db';
import { fail, ok, readJson } from '@/lib/http';
import { serializeUsuario } from '@/lib/serializers';

// GET: Busca um usuário específico
export async function GET(request, { params }) {
  const { id } = params;
  const usuario = await prisma.usuario.findUnique({ where: { id } });
  return usuario ? ok(serializeUsuario(usuario)) : fail('Usuário não encontrado', 404);
}

// PUT: Edita o usuário
export async function PUT(request, { params }) {
  try {
    const resolvedParams = await params;
    const id = resolvedParams.id;
    const body = await readJson(request); // Lê os novos dados

    const atualizado = await prisma.usuario.update({
      where: { id: String(id) },
      data: body
    });

    return ok(serializeUsuario(atualizado));
  } catch (error) {
    console.error('ERRO NO PUT USUARIO:', error);
    return fail('Erro ao atualizar usuário: ' + error.message, 400);
  }
}

// DELETE: Remove o usuário
export async function DELETE(request, { params }) {
  try {
    // 1. Aguarda o params (Obrigatório em versões novas do Next.js)
    const resolvedParams = await params;
    const id = resolvedParams.id;

    if (!id) {
      return fail('ID não reconhecido pela rota dinâmica', 400);
    }

    // 2. Tenta deletar
    await prisma.usuario.delete({
      where: { id: String(id) },
    });

    return ok({ message: 'Usuário removido com sucesso' });
  } catch (error) {
    console.error('ERRO NO DELETE USUARIO:', error);
    
    // Erro de integridade (usuário tem relatórios/inspeções)
    if (error.code === 'P2003') {
      return fail('Não é possível deletar: este usuário possui registros vinculados.', 400);
    }

    return fail('Erro interno: ' + error.message, 500);
  }
}