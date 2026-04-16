import prisma from '@/lib/db';
import { fail, ok } from '@/lib/http';

export async function GET() {
  try {
    await prisma.$queryRaw`SELECT 1`;

    const aiUrl = process.env.AI_SERVICE_URL || 'http://ai:5000';
    let ai = { status: 'unreachable' };

    try {
      const response = await fetch(`${aiUrl}/health`, { cache: 'no-store' });
      ai = response.ok ? await response.json() : { status: 'unhealthy' };
    } catch {
      ai = { status: 'unreachable' };
    }

    return ok({
      api: 'ok',
      database: 'ok',
      ai,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Erro no healthcheck:', error);
    return fail('Healthcheck falhou', 500, 'HEALTHCHECK_ERROR');
  }
}
