import { fail, ok } from '@/lib/http';
import { resolvePlaca, persistDetections } from '@/lib/detection';
import { serializeDefeito } from '@/lib/serializers';

export async function POST(request) {
  try {
    const formData = await request.formData();
    const image = formData.get('image');
    const placaId = formData.get('placaId');
    const placaCodigo = formData.get('placaCodigo');

    if (!image) {
      return fail('Nenhuma imagem enviada', 400, 'VALIDATION_ERROR');
    }

    const aiFormData = new FormData();
    aiFormData.append('image', image, image.name || 'upload.jpg');

    const aiUrl = process.env.AI_SERVICE_URL || 'http://ai:5000';
    const aiResponse = await fetch(`${aiUrl}/predict`, {
      method: 'POST',
      body: aiFormData,
      cache: 'no-store',
    });

    if (!aiResponse.ok) {
      const text = await aiResponse.text();
      return fail('Falha ao processar imagem no servico de IA', 502, 'AI_SERVICE_ERROR', text);
    }

    const detections = await aiResponse.json();
    const placa = await resolvePlaca({
      placaId: placaId ? String(placaId) : null,
      placaCodigo: placaCodigo ? String(placaCodigo) : null,
    });

    const createdDefeitos = await persistDetections({
      detections,
      placa,
      imageName: image.name || 'upload.jpg',
    });

    return ok(
      {
        detections,
        savedDefeitos: createdDefeitos.map(serializeDefeito),
      },
      {
        totalDetections: Array.isArray(detections) ? detections.length : 0,
        totalPersisted: createdDefeitos.length,
      }
    );
  } catch (error) {
    console.error('Erro em /api/detection:', error);
    return fail('Erro no servidor durante deteccao', 500, 'DETECTION_ERROR');
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
    return ok(health);
  } catch (error) {
    console.error('Erro ao verificar IA:', error);
    return fail('Erro ao verificar servico de IA', 500, 'AI_HEALTH_ERROR');
  }
}