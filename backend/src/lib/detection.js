import prisma from '@/lib/db';

function normalizeCodigo(value) {
  return String(value || '').trim();
}

function normalizeDetectionLabel(item) {
  return normalizeCodigo(item?.label || item?.classe || item?.class || '');
}

function normalizeTipo(item, sourceType) {
  if (sourceType === 'video') return 'video';
  if (item?.frame !== undefined && item?.frame !== null) return 'video';
  return 'imagem';
}

function normalizeDataHora(item, tipo) {
  if (tipo !== 'video') return null;

  const rawValue = item?.data_hora || item?.dataHora || null;
  if (!rawValue) return undefined;

  const dataHora = new Date(rawValue);
  if (Number.isNaN(dataHora.getTime())) {
    throw new Error('data_hora invalida na deteccao');
  }

  return dataHora;
}

export async function ensureModeloExiste(modeloCodigo, client = prisma) {
  const codigo = normalizeCodigo(modeloCodigo);
  if (!codigo) {
    throw new Error('modelo_codigo e obrigatorio');
  }

  const modelo = await client.modelo.findUnique({ where: { codigo } });
  if (!modelo) {
    throw new Error('Modelo nao encontrado');
  }

  return modelo;
}

export async function criarPlacaParaModelo(modeloCodigo, client = prisma) {
  const codigo = normalizeCodigo(modeloCodigo);
  if (!codigo) {
    throw new Error('modelo_codigo e obrigatorio');
  }

  await ensureModeloExiste(codigo, client);

  return client.placa.create({
    data: { modeloCodigo: codigo },
    include: { modelo: true },
  });
}

export async function persistirDeteccoesConfirmadas({ modeloCodigo, detections, sourceType = 'imagem' }) {
  const codigo = normalizeCodigo(modeloCodigo);
  if (!codigo) {
    throw new Error('modelo_codigo e obrigatorio');
  }

  if (!Array.isArray(detections) || detections.length === 0) {
    return { placa: null, defeitos: [] };
  }

  return prisma.$transaction(async (client) => {
    const placa = await criarPlacaParaModelo(codigo, client);
    const defeitos = [];

    for (const item of detections) {
      const classeDefeito = normalizeDetectionLabel(item);
      if (!classeDefeito) {
        throw new Error('Deteccao sem classe valida');
      }

      const tipo = normalizeTipo(item, sourceType);
      const dataHora = normalizeDataHora(item, tipo);

      const defeito = await client.defeito.create({
        data: {
          placaId: placa.id,
          classeDefeito,
          statusConfirmacao: 'confirmado',
          tipo,
          ...(tipo === 'imagem' ? { dataHora: null } : {}),
          ...(tipo === 'video' && dataHora ? { dataHora } : {}),
        },
        include: {
          placa: true,
        },
      });

      defeitos.push(defeito);
    }

    return { placa, defeitos };
  });
}
