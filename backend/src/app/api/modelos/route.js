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
