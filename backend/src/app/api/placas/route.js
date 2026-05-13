import prisma from '@/lib/db';
import { fail, ok, readJson } from '@/lib/http';
import { serializePlaca } from '@/lib/serializers';

export async function GET() {
  try {
    const placas = await prisma.placa.findMany({
      include: {
        modelo: true,
        defeitos: {
          select: {
            id: true,
            classeDefeito: true,
          },
        },
      },
      orderBy: { id: 'desc' },
    });

    return ok(placas.map(serializePlaca), { total: placas.length });
  } catch (error) {
    console.error('Erro ao listar placas:', error);
    return fail('Erro ao listar placas');
  }
}

export async function POST(request) {
  try {
    const body = await readJson(request);
    const modeloCodigo = String(body?.modelo_codigo || body?.modelo || body?.codigo || '').trim();

    if (!modeloCodigo) {
      return fail('modelo_codigo e obrigatorio', 400, 'VALIDATION_ERROR');
    }

    await prisma.modelo.upsert({
      where: { codigo: modeloCodigo },
      update: {},
      create: { codigo: modeloCodigo },
    });

    const novaPlaca = await prisma.placa.create({
      data: {
        modeloCodigo,
      },
      include: {
        modelo: true,
        defeitos: true,
      },
    });

    return ok(serializePlaca(novaPlaca), { created: true }, { status: 201 });
  } catch (error) {
    console.error('Erro ao criar placa:', error);
    return fail('Erro ao criar placa');
  }
}
