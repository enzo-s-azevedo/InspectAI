import { fail, ok, readJson } from '@/lib/http';
import { persistirDeteccoesConfirmadas } from '@/lib/detection';
import { serializeDefeito, serializePlaca } from '@/lib/serializers';

function normalizeModeloCodigo(body) {
  const values = [body?.modelo_codigo, body?.modeloCodigo, body?.placaCodigo];
  for (const value of values) {
    const codigo = String(value || '').trim();
    if (codigo) return codigo;
  }
  return '';
}

function normalizeSourceType(body) {
  const tipo = String(body?.source_type || body?.sourceType || body?.tipo || 'imagem').trim();
  return tipo === 'video' ? 'video' : 'imagem';
}

export async function POST(request) {
  try {
    const body = await readJson(request);
    const modeloCodigo = normalizeModeloCodigo(body);
    const detections = Array.isArray(body?.detections) ? body.detections : [];
    const sourceType = normalizeSourceType(body);

    if (!modeloCodigo) {
      return fail('modelo_codigo e obrigatorio', 400, 'VALIDATION_ERROR');
    }

    if (detections.length === 0) {
      return fail('Nenhuma deteccao para salvar', 400, 'VALIDATION_ERROR');
    }

    const persisted = await persistirDeteccoesConfirmadas({
      modeloCodigo,
      detections,
      sourceType,
    });

    return ok(
      {
        modelo: { codigo: modeloCodigo },
        placa: serializePlaca(persisted.placa),
        savedDefeitos: persisted.defeitos.map(serializeDefeito),
      },
      {
        totalPersisted: persisted.defeitos.length,
      },
      { status: 201 }
    );
  } catch (error) {
    if (error.message === 'Modelo nao encontrado') {
      return fail(error.message, 404, 'NOT_FOUND');
    }

    if (error.message === 'Deteccao sem classe valida' || error.message === 'modelo_codigo e obrigatorio') {
      return fail(error.message, 400, 'VALIDATION_ERROR');
    }

    console.error('Erro ao salvar deteccoes:', error);
    return fail('Erro ao salvar deteccoes', 500, 'PERSISTENCE_ERROR', error.message || null);
  }
}