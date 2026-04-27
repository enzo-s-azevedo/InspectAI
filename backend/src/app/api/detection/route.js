import { fail, ok } from '@/lib/http';
import { resolvePlaca, persistDetections } from '@/lib/detection';
import { serializeDefeito } from '@/lib/serializers';
import { extractImagesFromZip, normalizeDetections, readAndValidateUpload } from '@/lib/upload';

async function predictFromAi({ aiUrl, image }) {
  const aiFormData = new FormData();
  aiFormData.append('image', new Blob([image.buffer], { type: image.mimeType }), image.name || 'upload.jpg');

  const aiResponse = await fetch(`${aiUrl}/predict`, {
    method: 'POST',
    body: aiFormData,
    cache: 'no-store',
  });

  if (!aiResponse.ok) {
    const text = await aiResponse.text();
    throw new Error(`Falha da IA para ${image.name}: ${text}`);
  }

  const payload = await aiResponse.json();
  return normalizeDetections(payload);
}

function parseSelectedClasses(rawValue) {
  if (!rawValue) return [];

  try {
    const parsed = JSON.parse(String(rawValue));
    if (!Array.isArray(parsed)) return [];
    return parsed
      .map((item) => String(item || '').trim())
      .filter((item) => item.length > 0);
  } catch {
    return [];
  }
}

function filterDetectionsBySelectedClasses(detections, selectedClasses) {
  if (!Array.isArray(selectedClasses) || selectedClasses.length === 0) {
    return [];
  }

  const selected = new Set(selectedClasses.map((item) => String(item)));
  return detections.filter((item) => selected.has(String(item.label || item.class || '')));
}

export async function POST(request) {
  try {
    const formData = await request.formData();
    const uploadedFile = formData.get('image') || formData.get('file');
    const placaId = formData.get('placaId');
    const placaCodigo = formData.get('placaCodigo');
    const selectedClasses = parseSelectedClasses(formData.get('classes'));

    if (!uploadedFile) {
      return fail('Nenhum arquivo enviado', 400, 'VALIDATION_ERROR');
    }

    let uploadInfo;
    try {
      uploadInfo = await readAndValidateUpload(uploadedFile);
    } catch (error) {
      return fail(error.message || 'Arquivo invalido', 400, 'INVALID_UPLOAD');
    }

    const aiUrl = process.env.AI_SERVICE_URL || 'http://ai:5000';

    let images;
    try {
      images = uploadInfo.kind === 'zip' ? await extractImagesFromZip(uploadInfo.buffer) : [uploadInfo.image];
    } catch (error) {
      return fail(error.message || 'Arquivo .zip invalido', 400, 'INVALID_UPLOAD');
    }

    const placa = await resolvePlaca({
      placaId: placaId ? String(placaId) : null,
      placaCodigo: placaCodigo ? String(placaCodigo) : null,
    });

    const perImage = [];
    const flattenedDetections = [];
    const persisted = [];

    for (const image of images) {
      let detections;
      try {
        detections = await predictFromAi({ aiUrl, image });
      } catch (error) {
        return fail('Falha ao processar imagem no servico de IA', 502, 'AI_SERVICE_ERROR', error.message || null);
      }

      detections = filterDetectionsBySelectedClasses(detections, selectedClasses);

      flattenedDetections.push(...detections);

      const createdDefeitos = await persistDetections({
        detections,
        placa,
        imageName: image.name || 'upload.jpg',
      });

      persisted.push(...createdDefeitos);
      perImage.push({
        fileName: image.name,
        detections,
        savedDefeitos: createdDefeitos.map(serializeDefeito),
      });
    }

    return ok(
      {
        detections: flattenedDetections,
        savedDefeitos: persisted.map(serializeDefeito),
        itens: perImage,
      },
      {
        inputType: uploadInfo.kind,
        selectedClasses,
        totalFiles: images.length,
        totalDetections: flattenedDetections.length,
        totalPersisted: persisted.length,
      }
    );
  } catch (error) {
    console.error('Erro em /api/detection:', error);
    return fail('Erro no servidor durante deteccao', 500, 'DETECTION_ERROR', error.message || null);
  }
}

export async function GET() {
  try {
    const aiUrl = process.env.AI_SERVICE_URL || 'http://ai:5000';
    const healthResponse = await fetch(`${aiUrl}/health`, {
      cache: 'no-store',
    });

    if (!healthResponse.ok) {
      return fail('Servico de IA indisponivel', 503, 'AI_UNAVAILABLE');
    }

    const health = await healthResponse.json();
    if (health && health.model_loaded === false) {
      return fail('Servico de IA sem modelo carregado', 503, 'AI_UNAVAILABLE', health);
    }
    return ok(health);
  } catch (error) {
    console.error('Erro ao verificar IA:', error);
    return fail('Erro ao verificar servico de IA', 500, 'AI_HEALTH_ERROR');
  }
}