import prisma from '@/lib/db';

async function ensureModelo(codigo) {
  return prisma.modelo.upsert({
    where: { codigo },
    update: {},
    create: { codigo },
  });
}

async function getOrCreateDefaultPlaca() {
  const codigo = 'PCB-AUTO-DEFAULT';
  await ensureModelo(codigo);

  const existing = await prisma.placa.findFirst({
    where: { modeloCodigo: codigo },
  });
  if (existing) return existing;

  return prisma.placa.create({
    data: { modeloCodigo: codigo },
  });
}

export async function resolvePlaca({ placaId, placaCodigo }) {
  if (placaId) {
    const id = Number(placaId);
    const byId = Number.isInteger(id) ? await prisma.placa.findUnique({ where: { id } }) : null;
    if (byId) return byId;
  }

  if (placaCodigo) {
    const codigo = String(placaCodigo).trim();
    if (codigo) {
      await ensureModelo(codigo);
      const existing = await prisma.placa.findFirst({
        where: { modeloCodigo: codigo },
      });
      if (existing) return existing;

      return prisma.placa.create({
        data: { modeloCodigo: codigo },
      });
    }
  }

  return getOrCreateDefaultPlaca();
}

export async function persistDetections({ detections, placa, isVideo = false }) {
  if (!Array.isArray(detections) || detections.length === 0) {
    return [];
  }

  const created = [];

  for (const item of detections) {
    const classeDefeito = String(item.label || 'defeito-nao-classificado');
    const hasVideoFrame = item.frame !== undefined && item.frame !== null;
    const tipo = isVideo || hasVideoFrame ? 'video' : 'imagem';

    const defeito = await prisma.defeito.create({
      data: {
        placaId: placa.id,
        classeDefeito,
        statusConfirmacao: 'confirmado',
        tipo,
        ...(tipo === 'imagem' ? { dataHora: null } : {}),
      },
      include: {
        placa: true,
      },
    });

    created.push(defeito);
  }

  return created;
}
