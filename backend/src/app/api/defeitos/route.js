import prisma from '@/lib/db';
import { fail, ok, parseQuery, readJson } from '@/lib/http';
import { serializeDefeito } from '@/lib/serializers';

export async function GET(request) {
  try {
    const searchParams = parseQuery(request);
    const status = searchParams.get('status');
    const severidade = searchParams.get('severidade');
    const origem = searchParams.get('origem');
    const placaCodigo = searchParams.get('placaCodigo');

    const where = {};
    if (status) where.status = status;
    if (severidade) where.severidade = severidade;
    if (origem) where.origem = origem;
    if (placaCodigo) {
      where.placa = {
        codigo: placaCodigo,
      };
    }

    const defeitos = await prisma.defeito.findMany({
      where,
      include: {
        placa: true,
        usuario: true,
        imagens: {
          orderBy: {
            criado: 'desc',
          },
        },
        videos: {
          orderBy: {
            dataHora: 'desc',
          },
        },
      },
      orderBy: {
        criado: 'desc',
      },
    });

    return ok(defeitos.map(serializeDefeito), { total: defeitos.length });
  } catch (error) {
    console.error('Erro ao listar defeitos:', error);
    return fail('Erro ao listar defeitos');
  }
}

export async function POST(request) {
  try {
    const body = await readJson(request);
    const {
      placaId,
      id_placa,
      id_placa_origem,
      classe_defeito,
      classe,
      data_hora,
      nome_arquivo_origem,
      tipo,
      componente,
      origem = 'manual',
      severidade = 'media',
      descricao,
      status = 'aberto',
      usuarioId,
    } = body || {};

    const placaOrigemId = Number(id_placa || id_placa_origem || placaId);
    const classeFinal = classe_defeito || classe || tipo;
    if (!Number.isInteger(placaOrigemId) || !classeFinal) {
      return fail('id_placa e classe_defeito sao obrigatorios', 400, 'VALIDATION_ERROR');
    }
    const dataHora = data_hora ? new Date(data_hora) : null;
    if (dataHora && Number.isNaN(dataHora.getTime())) {
      return fail('data_hora invalida', 400, 'VALIDATION_ERROR');
    }

    const created = await prisma.defeito.create({
      data: {
        idPlaca: placaOrigemId,
        classeDefeito: String(classeFinal),
        dataHora: dataHora || undefined,
        nomeArquivoOrigem: nome_arquivo_origem || componente || 'upload-manual',
        tipo: String(classeFinal),
        componente: componente || nome_arquivo_origem || 'upload-manual',
        origem,
        severidade,
        descricao,
        status,
        usuarioId,
      },
      include: {
        placa: true,
        usuario: true,
        imagens: true,
        videos: true,
      },
    });

    return ok(serializeDefeito(created), { created: true }, { status: 201 });
  } catch (error) {
    console.error('Erro ao criar defeito:', error);
    return fail('Erro ao criar defeito');
  }
}
