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

function normalizeClassificacao(item) {
  const raw = String(item?.classificacao || item?.classification || '').trim();
  if (raw === 'falso_positivo') return 'falso_positivo';

  const status = String(item?.status_confirmacao || item?.statusConfirmacao || '').trim();
  return status === 'falso_positivo' ? 'falso_positivo' : 'real';
}

function statusFromClassificacao(classificacao) {
  return classificacao === 'falso_positivo' ? 'falso_positivo' : 'confirmado';
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

export async function persistirDeteccoesConfirmadas({ modeloCodigo, detections, sourceType = 'imagem', idUsuarioCriador }) {
  const codigo = normalizeCodigo(modeloCodigo);
  if (!codigo) {
    throw new Error('modelo_codigo e obrigatorio');
  }

  const usuarioCriadorId = Number(idUsuarioCriador);
  if (!Number.isInteger(usuarioCriadorId) || usuarioCriadorId <= 0) {
    throw new Error('id_usuario_criador e obrigatorio');
  }

  if (!Array.isArray(detections) || detections.length === 0) {
    return { placa: null, relatorio: null, defeitos: [] };
  }

  return prisma.$transaction(async (client) => {
    const placa = await criarPlacaParaModelo(codigo, client);
    const relatorio = await client.relatorio.create({
      data: {
        placaId: placa.id,
        idUsuarioCriador: usuarioCriadorId,
      },
      include: {
        placa: true,
        usuarioCriador: true,
        usuarioUltimoAcesso: true,
      },
    });
    const defeitos = [];

    for (const item of detections) {
      const classeDefeito = normalizeDetectionLabel(item);
      if (!classeDefeito) {
        throw new Error('Deteccao sem classe valida');
      }

      const tipo = normalizeTipo(item, sourceType);
      const dataHora = normalizeDataHora(item, tipo);
      const classificacao = normalizeClassificacao(item);

      const defeito = await client.defeito.create({
        data: {
          placaId: placa.id,
          classeDefeito,
          statusConfirmacao: statusFromClassificacao(classificacao),
          classificacao,
          tipo,
          ...(tipo === 'imagem' ? { dataHora: null } : {}),
          ...(tipo === 'video' && dataHora ? { dataHora } : {}),
        },
        include: {
          placa: true,
        },
      });

      defeitos.push(defeito);

      await client.relatorioDefeito.create({
        data: {
          relatorioId: relatorio.id,
          defeitoId: defeito.id,
        },
      });
    }

    return { placa, relatorio, defeitos };
  });
}

export async function criarRelatorioParaLote({ modeloCodigo, idUsuarioCriador, imagens = [] }) {
  const codigo = normalizeCodigo(modeloCodigo);
  if (!codigo) {
    throw new Error('modelo_codigo e obrigatorio');
  }

  const usuarioCriadorId = Number(idUsuarioCriador);
  if (!Number.isInteger(usuarioCriadorId) || usuarioCriadorId <= 0) {
    throw new Error('id_usuario_criador e obrigatorio');
  }

  return prisma.$transaction(async (client) => {
    const placa = await criarPlacaParaModelo(codigo, client);
    const relatorio = await client.relatorio.create({
      data: {
        placaId: placa.id,
        idUsuarioCriador: usuarioCriadorId,
      },
      include: {
        placa: true,
        usuarioCriador: true,
        usuarioUltimoAcesso: true,
      },
    });

    for (const imagem of imagens) {
      await client.relatorioImagem.create({
        data: {
          relatorioId: relatorio.id,
          caminhoImagem: imagem.name,
          tipo: 'original',
        },
      });
    }

    return { placa, relatorio };
  });
}

export async function persistirDeteccoesEmRelatorio({ relatorioId, placaId, detections, sourceType = 'imagem' }) {
  const parsedRelatorioId = Number(relatorioId);
  const parsedPlacaId = Number(placaId);

  if (!Number.isInteger(parsedRelatorioId) || parsedRelatorioId <= 0) {
    throw new Error('relatorio_id e obrigatorio');
  }

  if (!Number.isInteger(parsedPlacaId) || parsedPlacaId <= 0) {
    throw new Error('placa_id e obrigatorio');
  }

  if (!Array.isArray(detections) || detections.length === 0) {
    return [];
  }

  return prisma.$transaction(async (client) => {
    const defeitos = [];

    for (const item of detections) {
      const classeDefeito = normalizeDetectionLabel(item);
      if (!classeDefeito) {
        throw new Error('Deteccao sem classe valida');
      }

      const tipo = normalizeTipo(item, sourceType);
      const dataHora = normalizeDataHora(item, tipo);
      const classificacao = normalizeClassificacao(item);

      const defeito = await client.defeito.create({
        data: {
          placaId: parsedPlacaId,
          classeDefeito,
          statusConfirmacao: statusFromClassificacao(classificacao),
          classificacao,
          tipo,
          ...(tipo === 'imagem' ? { dataHora: null } : {}),
          ...(tipo === 'video' && dataHora ? { dataHora } : {}),
        },
        include: {
          placa: true,
        },
      });

      await client.relatorioDefeito.create({
        data: {
          relatorioId: parsedRelatorioId,
          defeitoId: defeito.id,
        },
      });

      defeitos.push(defeito);
    }

    return defeitos;
  });
}
