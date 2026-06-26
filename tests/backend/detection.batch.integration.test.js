import jwt from 'jsonwebtoken';
import { POST } from '../../backend/src/app/api/detection/batch/route';

const JWT_SECRET = process.env.JWT_SECRET || 'inspectai-chave-super-secreta-2026';

jest.mock('@/lib/db', () => {
  const db = {
    modelo: {
      findUnique: jest.fn(),
    },
    $transaction: jest.fn(),
  };

  return {
    __esModule: true,
    default: db,
    prisma: db,
  };
});

const prisma = jest.requireMock('@/lib/db').default;

const PNG_BYTES = new Uint8Array([
  0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a,
  0x00, 0x00, 0x00, 0x0d,
]);

function token(payload = { id: 7, nome: 'Operador', cargo: 'FUNCIONARIO' }) {
  return jwt.sign(payload, JWT_SECRET);
}

function makePng(name) {
  return new Blob([PNG_BYTES], { type: 'image/png' });
}

function makeRequest(files, body = {}) {
  const formData = new FormData();
  formData.append('modelo_codigo', body.modelo_codigo || 'PCB-001');
  files.forEach((file) => formData.append('files', file.blob, file.name));

  return new Request('http://localhost:3000/api/detection/batch', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token(body.usuario)}`,
    },
    body: formData,
  });
}

function setupDb() {
  const client = {
    modelo: {
      findUnique: jest.fn().mockResolvedValue({ codigo: 'PCB-001' }),
    },
  };

  prisma.modelo.findUnique.mockResolvedValue({ codigo: 'PCB-001' });
  prisma.$transaction.mockImplementation((callback) => callback(client));

  return { client };
}

describe('Processamento em lote de imagens', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => [{ label: 'trinca', confidence: 0.92, bbox: [1, 2, 3, 4] }],
    });
  });

  it('processa multiplas imagens sem persistir resultados no banco', async () => {
    setupDb();

    const res = await POST(
      makeRequest([
        { name: 'placa-a.png', blob: makePng('placa-a.png') },
        { name: 'placa-b.jpg', blob: makePng('placa-b.jpg') },
      ])
    );
    const body = await res.json();

    expect(res.status).toBe(201);
    expect(body.data.itens).toHaveLength(2);
    expect(body.data.itens.every((item) => item.status === 'processado')).toBe(true);
    expect(body.data.itens.every((item) => Array.isArray(item.savedDefeitos) && item.savedDefeitos.length === 0)).toBe(true);
    expect(body.data.savedDefeitos).toEqual([]);
    expect(prisma.$transaction).not.toHaveBeenCalled();
  });

  it('bloqueia arquivos com extensoes nao suportadas', async () => {
    setupDb();

    const res = await POST(
      makeRequest([
        { name: 'placa.gif', blob: new Blob([PNG_BYTES], { type: 'image/gif' }) },
      ])
    );
    const body = await res.json();

    expect(res.status).toBe(207);
    expect(body.data.itens).toHaveLength(1);
    expect(body.data.itens[0]).toMatchObject({
      fileName: 'placa.gif',
      status: 'erro',
    });
    expect(body.data.itens[0].error).toContain('Formato invalido')
    expect(prisma.$transaction).not.toHaveBeenCalled();
  });

  it('aceita arquivos .jpeg no processamento em lote', async () => {
    setupDb();

    const res = await POST(
      makeRequest([
        { name: 'placa-c.jpeg', blob: makePng('placa-c.jpeg') },
      ])
    );
    const body = await res.json();

    expect(res.status).toBe(201);
    expect(body.data.itens).toHaveLength(1);
    expect(body.data.itens[0]).toMatchObject({
      fileName: 'placa-c.jpeg',
      status: 'processado',
    });
    expect(prisma.$transaction).not.toHaveBeenCalled();
  });

  it('processa os arquivos validos e retorna erro individual para os invalidos', async () => {
    setupDb();

    const res = await POST(
      makeRequest([
        { name: 'placa-a.png', blob: makePng('placa-a.png') },
        { name: 'placa-b.gif', blob: new Blob([PNG_BYTES], { type: 'image/gif' }) },
      ])
    );
    const body = await res.json();

    expect(res.status).toBe(207);
    expect(body.data.itens).toHaveLength(2);
    expect(body.data.itens.map((item) => item.status)).toEqual(expect.arrayContaining(['processado', 'erro']));
    expect(body.data.itens.find((item) => item.status === 'erro')?.error).toContain('Formato invalido');
    expect(prisma.$transaction).not.toHaveBeenCalled();
  });

  it('valida pasta vazia sem criar relatorio', async () => {
    setupDb();

    const res = await POST(makeRequest([]));
    const body = await res.json();

    expect(res.status).toBe(400);
    expect(body.error.code).toBe('EMPTY_BATCH');
    expect(prisma.$transaction).not.toHaveBeenCalled();
  });

  it('mantem apenas o resultado temporario quando uma imagem falha no processamento', async () => {
    setupDb();
    global.fetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => [{ label: 'trinca', confidence: 0.92, bbox: [1, 2, 3, 4] }],
      })
      .mockResolvedValueOnce({
        ok: false,
        status: 502,
        text: async () => JSON.stringify({ error: { message: 'IA indisponivel', code: 'AI_SERVICE_ERROR' } }),
      });

    const res = await POST(
      makeRequest([
        { name: 'placa-a.png', blob: makePng('placa-a.png') },
        { name: 'placa-b.png', blob: makePng('placa-b.png') },
      ])
    );
    const body = await res.json();

    expect(res.status).toBe(207);
    expect(body.data.itens.map((item) => item.status)).toEqual(['processado', 'erro']);
    expect(body.meta.totalFailed).toBe(1);
    expect(body.data.savedDefeitos).toEqual([]);
    expect(prisma.$transaction).not.toHaveBeenCalled();
  });
});
