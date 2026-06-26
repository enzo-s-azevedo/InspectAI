import jwt from 'jsonwebtoken';
import { PATCH as atualizarRelatorio } from '../../backend/src/app/api/relatorios/[id]/route';

const JWT_SECRET = process.env.JWT_SECRET || 'inspectai-chave-super-secreta-2026';

jest.mock('@/lib/db', () => {
  const db = {
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

function makeRequest(url, body, payload) {
  return new Request(url, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${makeToken(payload)}`,
    },
    body: JSON.stringify(body),
  });
}

describe('Issue #28: Integridade e Rastreabilidade do Relatório', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('Garante que id_usuario_criador NUNCA é alterado, mesmo se enviado no body', async () => {
    const adminPayload = { id: 2, nome: 'Admin', cargo: 'ADMINISTRADOR' };
    
    mockPrisma.relatorio.update.mockResolvedValue({
      id: 100,
      placaId: 10,
      idUsuarioCriador: 5, // Mantém o original
      idUsuarioUltimoAcesso: 2, // Atualiza para o admin que está editando
      criadoEm: new Date(),
      atualizadoEm: new Date(),
    });

    const req = makeRequest(
      'http://localhost:3000/api/relatorios/100',
      {
        id_usuario_criador: 999, // Tentativa maliciosa de mudar o criador
        placa_id: 10
      },
      adminPayload
    );

    await atualizarRelatorio(req, { params: Promise.resolve({ id: '100' }) });

    // Verifica que o Prisma recebeu apenas os campos permitidos
    const updateCall = mockPrisma.relatorio.update.mock.calls[0][0];
    expect(updateCall.data).toHaveProperty('idUsuarioUltimoAcesso', 2);
    expect(updateCall.data).toHaveProperty('placaId', 10);
    expect(updateCall.data).not.toHaveProperty('idUsuarioCriador');
    expect(updateCall.data).not.toHaveProperty('id_usuario_criador');
  });

  it('Garante que id_usuario_ultimo_acesso é registrado corretamente em modificações', async () => {
    const adminPayload = { id: 3, nome: 'Supervisor', cargo: 'ADMINISTRADOR' };
    
    mockPrisma.relatorio.update.mockResolvedValue({
      id: 100,
      idUsuarioUltimoAcesso: 3,
    });

    const req = makeRequest(
      'http://localhost:3000/api/relatorios/100',
      { placa_id: 11 },
      adminPayload
    );

    await atualizarRelatorio(req, { params: Promise.resolve({ id: '100' }) });

    const updateCall = mockPrisma.relatorio.update.mock.calls[0][0];
    expect(updateCall.data).toHaveProperty('idUsuarioUltimoAcesso', 3);
  });
});
