import jwt from 'jsonwebtoken';
import { POST as salvarDeteccoes } from '../../backend/src/app/api/detection/save/route';
import { PATCH as atualizarRelatorio } from '../../backend/src/app/api/relatorios/[id]/route';

const JWT_SECRET = process.env.JWT_SECRET || 'inspectai-chave-super-secreta-2026';

jest.mock('@/lib/db', () => {
  const db = {
    $transaction: jest.fn(),
    relatorio: {
      update: jest.fn(),
    },
  };

  return {
    __esModule: true,
    default: db,
    prisma: db,
  };
});

const mockPrisma = jest.requireMock('@/lib/db').default;

function makeToken(payload) {
  return jwt.sign(payload, JWT_SECRET);
}

function makeJsonRequest(url, body, payload = { id: 7, nome: 'Operador', cargo: 'FUNCIONARIO' }) {
  return new Request(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${makeToken(payload)}`,
    },
    body: JSON.stringify(body),
  });
}

describe('Relatorios gerados por lote', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('cria relatorio com placa e usuario criador preenchidos automaticamente', async () => {
    const client = {
      modelo: {
        findUnique: jest.fn().mockResolvedValue({ codigo: 'ABC-123' }),
      },
      placa: {
        create: jest.fn().mockResolvedValue({ id: 11, modeloCodigo: 'ABC-123' }),
      },
      relatorio: {
        create: jest.fn().mockResolvedValue({
          id: 31,
          placaId: 11,
          idUsuarioCriador: 7,
          idUsuarioUltimoAcesso: null,
          criadoEm: new Date('2026-05-30T10:00:00Z'),
          atualizadoEm: new Date('2026-05-30T10:00:00Z'),
          placa: { id: 11, modeloCodigo: 'ABC-123' },
          usuarioCriador: { id: 7, nome: 'Operador', email: 'operador@inspectai.test' },
          usuarioUltimoAcesso: null,
        }),
      },
      defeito: {
        create: jest.fn().mockResolvedValue({
          id: 51,
          classeDefeito: 'trinca',
          statusConfirmacao: 'confirmado',
          classificacao: 'real',
          tipo: 'imagem',
          dataHora: null,
          placaId: 11,
        }),
      },
      relatorioDefeito: {
        create: jest.fn().mockResolvedValue({ id: 71, relatorioId: 31, defeitoId: 51 }),
      },
    };

    mockPrisma.$transaction.mockImplementation((callback) => callback(client));

    const res = await salvarDeteccoes(
      makeJsonRequest('http://localhost:3000/api/detection/save', {
        modelo_codigo: 'ABC-123',
        detections: [{ label: 'trinca' }],
      })
    );
    const body = await res.json();

    expect(res.status).toBe(201);
    expect(client.relatorio.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: {
          placaId: 11,
          idUsuarioCriador: 7,
        },
      })
    );
    expect(client.relatorioDefeito.create).toHaveBeenCalledWith({
      data: {
        relatorioId: 31,
        defeitoId: 51,
      },
    });
    expect(client.defeito.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          statusConfirmacao: 'confirmado',
          classificacao: 'real',
        }),
      })
    );
    expect(body.data.relatorio).toMatchObject({
      id: 31,
      placa_id: 11,
      id_usuario_criador: 7,
      id_usuario_ultimo_acesso: null,
    });
  });

  it('salva deteccao marcada como falso positivo no banco de defeitos', async () => {
    const client = {
      modelo: {
        findUnique: jest.fn().mockResolvedValue({ codigo: 'ABC-123' }),
      },
      placa: {
        create: jest.fn().mockResolvedValue({ id: 11, modeloCodigo: 'ABC-123' }),
      },
      relatorio: {
        create: jest.fn().mockResolvedValue({
          id: 31,
          placaId: 11,
          idUsuarioCriador: 7,
          idUsuarioUltimoAcesso: null,
          criadoEm: new Date('2026-05-30T10:00:00Z'),
          atualizadoEm: new Date('2026-05-30T10:00:00Z'),
        }),
      },
      defeito: {
        create: jest.fn().mockResolvedValue({
          id: 52,
          classeDefeito: 'sombra',
          statusConfirmacao: 'falso_positivo',
          classificacao: 'falso_positivo',
          tipo: 'imagem',
          dataHora: null,
          placaId: 11,
        }),
      },
      relatorioDefeito: {
        create: jest.fn().mockResolvedValue({ id: 72, relatorioId: 31, defeitoId: 52 }),
      },
    };

    mockPrisma.$transaction.mockImplementation((callback) => callback(client));

    const res = await salvarDeteccoes(
      makeJsonRequest('http://localhost:3000/api/detection/save', {
        modelo_codigo: 'ABC-123',
        detections: [{ label: 'sombra', classificacao: 'falso_positivo' }],
      })
    );
    const body = await res.json();

    expect(res.status).toBe(201);
    expect(client.defeito.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          classeDefeito: 'sombra',
          statusConfirmacao: 'falso_positivo',
          classificacao: 'falso_positivo',
        }),
      })
    );
    expect(body.data.savedDefeitos[0]).toMatchObject({
      classe_defeito: 'sombra',
      status_confirmacao: 'falso_positivo',
      classificacao: 'falso_positivo',
    });
  });

  it('atualiza id_usuario_ultimo_acesso em modificacoes feitas por administradores sem alterar o criador', async () => {
    mockPrisma.relatorio.update.mockResolvedValue({
      id: 31,
      placaId: 12,
      idUsuarioCriador: 7,
      idUsuarioUltimoAcesso: 2,
      criadoEm: new Date('2026-05-30T10:00:00Z'),
      atualizadoEm: new Date('2026-05-30T10:05:00Z'),
      placa: { id: 12, modeloCodigo: 'ABC-123' },
      usuarioCriador: { id: 7, nome: 'Operador', email: 'operador@inspectai.test' },
      usuarioUltimoAcesso: { id: 2, nome: 'Admin', email: 'admin@inspectai.test' },
    });

    const req = makeJsonRequest(
      'http://localhost:3000/api/relatorios/31',
      {
        placa_id: 12,
        id_usuario_criador: 99,
      },
      { id: 2, nome: 'Admin', cargo: 'ADMINISTRADOR' }
    );

    const res = await atualizarRelatorio(req, { params: Promise.resolve({ id: '31' }) });
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(mockPrisma.relatorio.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 31 },
        data: {
          idUsuarioUltimoAcesso: 2,
          placaId: 12,
        },
      })
    );
    expect(mockPrisma.relatorio.update.mock.calls[0][0].data).not.toHaveProperty('idUsuarioCriador');
    expect(body.data).toMatchObject({
      id: 31,
      placa_id: 12,
      id_usuario_criador: 7,
      id_usuario_ultimo_acesso: 2,
    });
  });

  it('valida integridade referencial ao atualizar relacionamentos do relatorio', async () => {
    const error = new Error('Foreign key constraint failed');
    error.code = 'P2003';
    mockPrisma.relatorio.update.mockRejectedValue(error);

    const req = makeJsonRequest(
      'http://localhost:3000/api/relatorios/31',
      { placa_id: 999 },
      { id: 2, nome: 'Admin', cargo: 'ADMINISTRADOR' }
    );

    const res = await atualizarRelatorio(req, { params: Promise.resolve({ id: '31' }) });
    const body = await res.json();

    expect(res.status).toBe(400);
    expect(body.error).toMatchObject({
      code: 'REFERENTIAL_INTEGRITY',
      message: 'Relacionamento invalido para o relatorio',
    });
  });
});
