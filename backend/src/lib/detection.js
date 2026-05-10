import prisma from '@/lib/db';

function buildDefectCode() {
  const randomPart = Math.random().toString(36).slice(2, 8).toUpperCase();
  return `DEF-${Date.now().toString().slice(-6)}-${randomPart}`;
}

async function ensureModelo(codigo, descricao) {
  return prisma.modelo.upsert({
    where: { codigo },
    update: {},
    create: {
      codigo,
      descricao: descricao || `Modelo ${codigo}`,
    },
  });
}

async function getOrCreateDefaultPlaca() {
  const codigo = 'PCB-AUTO-DEFAULT';
  await ensureModelo(codigo, 'Modelo criado automaticamente para ingestao de deteccoes');

  return prisma.placa.upsert({
    where: { codigo },
    update: {},
    create: {
      codigo,
      modeloCodigo: codigo,
      nomeClasse: codigo,
      descricao: 'Placa criada automaticamente para ingestao de deteccoes',
      localizacao: 'Pipeline IA',
    },
  });
}

export async function resolvePlaca({ placaId, placaCodigo }) {
  if (placaId) {
    const id = Number(placaId);
    const byId = Number.isInteger(id) ? await prisma.placa.findUnique({ where: { id } }) : null;
    if (byId) return byId;
  }

  if (placaCodigo) {
    const byCode = await prisma.placa.findUnique({ where: { codigo: placaCodigo } });
    if (byCode) return byCode;

    await ensureModelo(placaCodigo, 'Modelo criado automaticamente a partir da deteccao');
    return prisma.placa.create({
      data: {
        codigo: placaCodigo,
        modeloCodigo: placaCodigo,
        nomeClasse: placaCodigo,
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
    const classeDefeito = String(item.label || 'defeito-nao-classificado');
    const confidence = Number(item.confidence || 0);
    const bbox = Array.isArray(item.bbox) ? item.bbox : null;
    const detectedAt = item.data_hora ? new Date(item.data_hora) : null;
    const dataHora = detectedAt && !Number.isNaN(detectedAt.getTime()) ? detectedAt : undefined;
    const severidade = confidence >= 0.9 ? 'alta' : confidence >= 0.7 ? 'media' : 'baixa';
    const videoFrame = item.frame !== undefined && item.frame !== null ? Number(item.frame) : null;

    const defeito = await prisma.defeito.create({
      data: {
        codigoInterno: buildDefectCode(),
        idPlaca: placa.id,
        classeDefeito,
        dataHora,
        nomeArquivoOrigem: imageName || 'upload.jpg',
        componente: imageName || 'imagem',
        origem: 'automatico',
        severidade,
        descricao: `Detectado por IA com confianca ${Math.round(confidence * 100)}%`,
        confirmado: true,
        ...(videoFrame !== null
          ? {
              videos: {
                create: {
                  idPlaca: placa.id,
                  classeDefeito,
                  dataHora,
                  nomeArquivoOrigem: imageName || 'upload',
                  frame: Number.isInteger(videoFrame) ? videoFrame : null,
                  componente: imageName || 'video',
                  severidade,
                  descricao: `Detectado em video por IA com confianca ${Math.round(confidence * 100)}%`,
                  confirmado: true,
                },
              },
            }
          : {}),
      },
      include: {
        placa: true,
        usuario: true,
        videos: true,
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
