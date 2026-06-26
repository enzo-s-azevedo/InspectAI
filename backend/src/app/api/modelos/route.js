import prisma from '@/lib/db';
import { fail, ok, readJson } from '@/lib/http';
import { serializeModelo } from '@/lib/serializers';

export async function GET() {
  try {
    const modelos = await prisma.modelo.findMany({
      include: {
        placas: {
          select: {
            id: true,
            modeloCodigo: true,
          },
        },
      },
      orderBy: { codigo: 'asc' },
    });

    return ok(modelos.map(serializeModelo), { total: modelos.length });
  } catch (error) {
    console.error('Erro ao listar modelos:', error);
    return fail('Erro ao listar modelos');
  }
}

export async function POST(request) {
  try {
    const body = await readJson(request);
    const { codigo } = body || {};
    const codigoModelo = String(codigo || '').trim();

    if (!codigoModelo) {
      return fail('codigo do modelo e obrigatorio', 400, 'VALIDATION_ERROR');
    }

    const existente = await prisma.modelo.findUnique({
      where: { codigo: codigoModelo },
      select: { codigo: true },
    });

    if (existente) {
      return fail('Codigo de modelo ja existe', 409, 'UNIQUE_CONSTRAINT');
    }

    const modelo = await prisma.modelo.create({
      data: {
        codigo: codigoModelo,
      },
    });

    return ok(serializeModelo(modelo), { created: true }, { status: 201 });
  } catch (error) {
    if (error.code === 'P2002') {
      return fail('Codigo de modelo ja existe', 409, 'UNIQUE_CONSTRAINT');
    }
    console.error('Erro ao criar modelo:', error);
    return fail('Erro ao criar modelo');
  }
}

export async function PUT(request) {
  try {
    const body = await readJson(request);
    const codigoAtual = String(body?.codigo_atual || body?.codigoAtual || body?.codigo || '').trim();
    const novoCodigo = String(body?.novo_codigo || body?.novoCodigo || '').trim();

    if (!codigoAtual) {
      return fail('codigo atual do modelo e obrigatorio', 400, 'VALIDATION_ERROR');
    }

    if (!novoCodigo) {
      return fail('novo codigo do modelo e obrigatorio', 400, 'VALIDATION_ERROR');
    }

    if (codigoAtual !== novoCodigo) {
      const existente = await prisma.modelo.findUnique({
        where: { codigo: novoCodigo },
        select: { codigo: true },
      });

      if (existente) {
        return fail('Codigo de modelo ja existe', 409, 'UNIQUE_CONSTRAINT');
      }
    }

    const modelo = await prisma.modelo.update({
      where: { codigo: codigoAtual },
      data: { codigo: novoCodigo },
      include: {
        placas: {
          select: {
            id: true,
            modeloCodigo: true,
          },
        },
      },
    });

    return ok(serializeModelo(modelo));
  } catch (error) {
    if (error.code === 'P2025') {
      return fail('Modelo nao encontrado', 404, 'NOT_FOUND');
    }

    if (error.code === 'P2002') {
      return fail('Codigo de modelo ja existe', 409, 'UNIQUE_CONSTRAINT');
    }

    console.error('Erro ao atualizar modelo:', error);
    return fail('Erro ao atualizar modelo');
  }
}

export async function DELETE(request) {
  try {
    const body = await readJson(request);
    const codigoModelo = String(body?.codigo || body?.codigoModelo || '').trim();

    if (!codigoModelo) {
      return fail('codigo do modelo e obrigatorio', 400, 'VALIDATION_ERROR');
    }

    await prisma.modelo.delete({
      where: { codigo: codigoModelo },
    });

    return ok({ codigo: codigoModelo, message: 'Modelo removido com sucesso' });
  } catch (error) {
    if (error.code === 'P2025') {
      return fail('Modelo nao encontrado', 404, 'NOT_FOUND');
    }

    if (error.code === 'P2003') {
      return fail('Nao e possivel deletar: este modelo possui registros vinculados.', 400, 'RELATION_CONSTRAINT');
    }

    console.error('Erro ao remover modelo:', error);
    return fail('Erro ao remover modelo');
  }
}
