import prisma from '@/lib/db';
import { fail, ok, parseQuery, readJson } from '@/lib/http';
import { serializeDefeito } from '@/lib/serializers';

export async function GET(request) {
  try {
    const searchParams = parseQuery(request);
    const origem = searchParams.get('origem');
    const confirmado = searchParams.get('confirmado');
    const placaCodigo = searchParams.get('placaCodigo');
    const idPlaca = searchParams.get('id_placa');
    const classeDefeito = searchParams.get('classe_defeito');

    const where = {};
    if (origem) where.origem = origem;
    if (confirmado === 'true') where.confirmado = true;
    if (confirmado === 'false') where.confirmado = false;
    if (classeDefeito) where.classeDefeito = classeDefeito;
    if (idPlaca) {
      const placaIdNumber = Number(idPlaca);
      if (!Number.isInteger(placaIdNumber)) {
        return fail('id_placa invalido', 400, 'VALIDATION_ERROR');
      }
      where.idPlaca = placaIdNumber;
    }
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
      id_placa,
      classe_defeito,
      data_hora,
      nome_arquivo_origem,
      componente,
      origem = 'manual',
      descricao,
      confirmado,
      usuarioId,
    } = body || {};

    const placaOrigemId = Number(id_placa);
    const classeFinal = classe_defeito;
    if (!Number.isInteger(placaOrigemId) || !classeFinal) {
      return fail('id_placa e classe_defeito sao obrigatorios', 400, 'VALIDATION_ERROR');
    }
    const dataHora = data_hora ? new Date(data_hora) : null;
    if (dataHora && Number.isNaN(dataHora.getTime())) {
      return fail('data_hora invalida', 400, 'VALIDATION_ERROR');
    }
    const confirmadoFinal =
      confirmado === undefined
          ? true
          : confirmado === true || confirmado === 'true';

    const created = await prisma.defeito.create({
      data: {
        idPlaca: placaOrigemId,
        classeDefeito: String(classeFinal),
        dataHora: dataHora || undefined,
        nomeArquivoOrigem: nome_arquivo_origem || componente || 'upload-manual',
        componente: componente || nome_arquivo_origem || 'upload-manual',
        origem,
        descricao,
        confirmado: confirmadoFinal,
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
