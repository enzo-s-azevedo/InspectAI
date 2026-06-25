import jwt from 'jsonwebtoken';
import { POST as salvarDeteccoes } from '../../backend/src/app/api/detection/save/route';

const JWT_SECRET = process.env.JWT_SECRET || 'inspectai-chave-super-secreta-2026';

jest.mock('@/lib/db', () => {
  const db = {
    $transaction: jest.fn(),
  };

  return {
    __esModule: true,
    default: db,
    prisma: db,
  };
});

const prisma = jest.requireMock('@/lib/db').default;

function makeToken(payload = { id: 7, nome: 'Operador', cargo: 'FUNCIONARIO' }) {
  return jwt.sign(payload, JWT_SECRET);
}

function makeJsonRequest(body) {
  return new Request('http://localhost:3000/api/detection/save', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${makeToken()}`,
    },
    body: JSON.stringify(body),
  });
}

function setupTransactionClient() {
  const client = {
    modelo: {
      findUnique: jest.fn().mockResolvedValue({ codigo: 'PCB-001' }),
    },
    placa: {
      create: jest.fn().mockResolvedValue({
        id: 11,
        modeloCodigo: 'PCB-001',
        modelo: { codigo: 'PCB-001' },
      }),
    },
    relatorio: {
      create: jest.fn().mockResolvedValue({
        id: 31,
        placaId: 11,
        idUsuarioCriador: 7,
        idUsuarioUltimoAcesso: null,
        criadoEm: new Date('2026-05-30T10:00:00Z'),
        atualizadoEm: new Date('2026-05-30T10:00:00Z'),
        placa: { id: 11, modeloCodigo: 'PCB-001' },
        usuarioCriador: { id: 7, nome: 'Operador', email: 'operador@inspectai.test' },
        usuarioUltimoAcesso: null,
      }),
    },
    defeito: {
      create: jest.fn().mockResolvedValue({
        id: 51,
        classeDefeito: 'furo',
        statusConfirmacao: 'falso_positivo',
        classificacao: 'falso_positivo',
        tipo: 'imagem',
        dataHora: null,
        placaId: 11,
        placa: { id: 11, modeloCodigo: 'PCB-001' },
      }),
    },
    relatorioDefeito: {
      create: jest.fn().mockResolvedValue({
        id: 71,
        relatorioId: 31,
        defeitoId: 51,
      }),
    },
  };

  prisma.$transaction.mockImplementation((callback) => callback(client));

  return client;
}

describe('Salvar deteccoes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('salva falso positivo no banco de defeitos com status e classificacao corretos', async () => {
    const client = setupTransactionClient();

    const res = await salvarDeteccoes(
      makeJsonRequest({
        modelo_codigo: 'PCB-001',
        detections: [
          {
            label: 'furo',
            classificacao: 'falso_positivo',
            status_confirmacao: 'falso_positivo',
            confidence: 0.81,
          },
        ],
      })
    );
    const body = await res.json();

    expect(res.status).toBe(201);
    expect(client.defeito.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          placaId: 11,
          classeDefeito: 'furo',
          statusConfirmacao: 'falso_positivo',
          classificacao: 'falso_positivo',
          tipo: 'imagem',
          dataHora: null,
        }),
      })
    );
    expect(client.relatorioDefeito.create).toHaveBeenCalledWith({
      data: {
        relatorioId: 31,
        defeitoId: 51,
      },
    });
    expect(body.data.savedDefeitos).toHaveLength(1);
    expect(body.data.savedDefeitos[0]).toMatchObject({
      id: 51,
      classe_defeito: 'furo',
      status_confirmacao: 'falso_positivo',
      classificacao: 'falso_positivo',
      tipo: 'imagem',
      placa_id: 11,
    });
  });
});
