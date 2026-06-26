import { ensureModeloExiste } from '@/lib/detection';
import { fail, ok } from '@/lib/http';
import { normalizeDetections, readAndValidateBatchImage } from '@/lib/upload';

class AiServiceError extends Error {
  constructor(message, status, code, details = null) {
    super(message);
    this.name = 'AiServiceError';
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

async function readAiError(response) {
  const text = await response.text();
  if (!text) {
    return {
      message: `Servico de IA retornou HTTP ${response.status}`,
      code: 'AI_SERVICE_ERROR',
      details: null,
    };
  }

  try {
    const payload = JSON.parse(text);
    const aiError = payload?.error || payload;
    return {
      message: aiError?.message || `Servico de IA retornou HTTP ${response.status}`,
      code: aiError?.code || 'AI_SERVICE_ERROR',
      details: payload,
    };
  } catch {
    return {
      message: text,
      code: 'AI_SERVICE_ERROR',
      details: text,
    };
  }
}

async function predictFromAi({ aiUrl, image }) {
  const aiFormData = new FormData();
  aiFormData.append('image', new Blob([image.buffer], { type: image.mimeType }), image.name);

  const aiResponse = await fetch(`${aiUrl}/predict`, {
    method: 'POST',
    body: aiFormData,
    cache: 'no-store',
  });

  if (!aiResponse.ok) {
    const error = await readAiError(aiResponse);
    throw new AiServiceError(
      `Falha da IA para ${image.name}: ${error.message}`,
      aiResponse.status,
      error.code,
      error.details
    );
  }

  const payload = await aiResponse.json();
  return normalizeDetections(payload);
}

function parseModeloCodigo(formData) {
  const values = [formData.get('modelo_codigo'), formData.get('modeloCodigo'), formData.get('placaCodigo')];
  for (const value of values) {
    const codigo = String(value || '').trim();
    if (codigo) return codigo;
  }
  return '';
}

function parseSelectedClasses(rawValue) {
  if (!rawValue) return [];

  try {
    const parsed = JSON.parse(String(rawValue));
    return Array.isArray(parsed) ? parsed.map((item) => String(item || '').trim()).filter(Boolean) : [];
  } catch {
    return String(rawValue)
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean);
  }
}

function filterDetectionsBySelectedClasses(detections, selectedClasses) {
  if (!Array.isArray(selectedClasses) || selectedClasses.length === 0) return detections;

  const selected = new Set(selectedClasses.map((item) => String(item)));
  return detections.filter((item) => selected.has(String(item.label || item.class || '')));
}

function getFiles(formData) {
  return [
    ...formData.getAll('files'),
    ...formData.getAll('files[]'),
    ...formData.getAll('images'),
    ...formData.getAll('images[]'),
    ...formData.getAll('file'),
  ].filter((item) => item && typeof item.arrayBuffer === 'function');
}

export async function POST(request) {
  try {
    const formData = await request.formData();
    const modeloCodigo = parseModeloCodigo(formData);
    const selectedClasses = parseSelectedClasses(formData.get('classes'));
    const files = getFiles(formData);

    if (!modeloCodigo) {
      return fail('modelo_codigo e obrigatorio', 400, 'VALIDATION_ERROR');
    }

    if (files.length === 0) {
      return fail('Nenhuma imagem valida selecionada. A pasta pode estar vazia.', 400, 'EMPTY_BATCH');
    }

    try {
      await ensureModeloExiste(modeloCodigo);
    } catch (error) {
      return fail(error.message || 'Modelo nao encontrado', 404, 'NOT_FOUND');
    }

    const images = [];
    const itens = [];
    for (const file of files) {
      try {
        images.push(await readAndValidateBatchImage(file));
      } catch (error) {
        itens.push({
          fileName: file?.name || 'arquivo',
          status: 'erro',
          error: error.message || 'Arquivo invalido',
          detections: [],
          savedDefeitos: [],
        });
      }
    }

    let hasFailure = itens.length > 0;

    if (images.length > 0) {
      const aiUrl = process.env.AI_SERVICE_URL || 'http://ai:5000';

      for (const image of images) {
        try {
          const detections = filterDetectionsBySelectedClasses(
            await predictFromAi({ aiUrl, image }),
            selectedClasses
          );
          itens.push({
            fileName: image.name,
            status: 'processado',
            detections,
            savedDefeitos: [],
          });
        } catch (error) {
          hasFailure = true;
          itens.push({
            fileName: image.name,
            status: 'erro',
            error: error.message || 'Falha ao processar imagem',
            detections: [],
            savedDefeitos: [],
          });
        }
      }
    }

    const data = {
      modelo: { codigo: modeloCodigo },
      imagens: images.map((image) => ({ fileName: image.name })),
      itens,
      savedDefeitos: [],
    };

    const meta = {
      modeloCodigo,
      selectedClasses,
      totalFiles: images.length,
      totalProcessed: itens.filter((item) => item.status === 'processado').length,
      totalFailed: itens.filter((item) => item.status === 'erro').length,
      totalDetections: itens.reduce((total, item) => total + item.detections.length, 0),
      totalPersisted: 0,
    };

    return ok(data, meta, { status: hasFailure ? 207 : 201 });
  } catch (error) {
    console.error('Erro em /api/detection/batch:', error);
    return fail('Erro no servidor durante processamento em lote', 500, 'BATCH_DETECTION_ERROR', error.message || null);
  }
}
