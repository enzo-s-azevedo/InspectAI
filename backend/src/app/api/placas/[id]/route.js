import prisma from '@/lib/db';
import { fail, ok, readJson } from '@/lib/http';
import { serializePlaca } from '@/lib/serializers';

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
          classeDefeito: true,
        },
      },
    },
  });
  return placa ? ok(serializePlaca(placa)) : fail('Placa nao encontrada', 404);
}

export async function PUT(request, { params }) {
  try {
    const resolvedParams = await params;
    const id = Number(resolvedParams.id);
    if (!Number.isInteger(id)) return fail('ID da placa invalido', 400);

    const body = await readJson(request);
    const modeloCodigo = String(body?.modelo_codigo || body?.modelo || '').trim();

    if (!modeloCodigo) {
      return fail('modelo_codigo e obrigatorio', 400, 'VALIDATION_ERROR');
    }

    await prisma.modelo.upsert({
      where: { codigo: modeloCodigo },
      update: {},
      create: { codigo: modeloCodigo },
    });

    const placaAtualizada = await prisma.placa.update({
      where: { id },
      data: { modeloCodigo },
      include: {
        modelo: true,
        defeitos: true,
      },
    });

    return ok(serializePlaca(placaAtualizada));
  } catch (error) {
    console.error('Erro ao atualizar placa:', error);
    return fail('Erro ao atualizar placa', 400);
  }
}

export async function DELETE(request, { params }) {
  try {
    const resolvedParams = await params;
    const id = Number(resolvedParams.id);

    if (!Number.isInteger(id)) {
      return fail('ID da placa invalido', 400);
    }

    await prisma.placa.delete({
      where: { id },
    });

    return ok({ message: 'Placa removida com sucesso' });
  } catch (error) {
    if (error.code === 'P2025') {
      return fail('Placa nao encontrada', 404);
    }

    if (error.code === 'P2003') {
      return fail('Nao e possivel deletar: esta placa possui defeitos vinculados.', 400);
    }

    console.error('Erro ao remover placa:', error);
    return fail('Erro interno ao tentar remover a placa', 500);
  }
}
