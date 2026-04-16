import prisma from '@/lib/db';

function buildDefectCode() {
  const randomPart = Math.random().toString(36).slice(2, 8).toUpperCase();
  return `DEF-${Date.now().toString().slice(-6)}-${randomPart}`;
}

async function getOrCreateDefaultPlaca() {
  const codigo = 'PCB-AUTO-DEFAULT';

  return prisma.placa.upsert({
    where: { codigo },
    update: {},
    create: {
      codigo,
      descricao: 'Placa criada automaticamente para ingestao de deteccoes',
      localizacao: 'Pipeline IA',
    },
  });
}

export async function resolvePlaca({ placaId, placaCodigo }) {
  if (placaId) {
    const byId = await prisma.placa.findUnique({ where: { id: placaId } });
    if (byId) return byId;
  }

  if (placaCodigo) {
    const byCode = await prisma.placa.findUnique({ where: { codigo: placaCodigo } });
    if (byCode) return byCode;

    return prisma.placa.create({
      data: {
        codigo: placaCodigo,
        descricao: 'Placa criada automaticamente a partir da deteccao',
        localizacao: 'Pipeline IA',
      },
    });
  }

  return getOrCreateDefaultPlaca();
}

export async function persistDetections({ detections, placa, imageName }) {
  if (!Array.isArray(detections) || detections.length === 0) {
    return [];
  }

  const created = [];

  for (const item of detections) {
    const tipo = String(item.label || 'defeito-nao-classificado');
    const confidence = Number(item.confidence || 0);
    const bbox = Array.isArray(item.bbox) ? item.bbox : null;

    const defeito = await prisma.defeito.create({
      data: {
        codigoInterno: buildDefectCode(),
        placaId: placa.id,
        tipo,
        componente: imageName || 'imagem',
        origem: 'automatico',
        severidade: confidence >= 0.9 ? 'alta' : confidence >= 0.7 ? 'media' : 'baixa',
        descricao: `Detectado por IA com confianca ${Math.round(confidence * 100)}%`,
        status: 'aberto',
      },
      include: {
        placa: true,
        usuario: true,
      },
    });

    if (bbox) {
      await prisma.imagemDefeito.create({
        data: {
          defeitoId: defeito.id,
          url: imageName || 'upload',
          tipo: 'anotada',
          metadados: {
            confidence,
            bbox,
          },
        },
      });
    }

    created.push(defeito);
  }

  return created;
}
