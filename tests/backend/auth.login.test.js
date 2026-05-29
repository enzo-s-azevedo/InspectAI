import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { POST } from '../../backend/src/app/api/auth/login/route';

let mockFindUnique;

jest.mock('@prisma/client', () => ({
  PrismaClient: jest.fn(() => ({
    usuario: {
      findUnique: (...args) => mockFindUnique(...args),
    },
  })),
}));

const JWT_SECRET = process.env.JWT_SECRET || 'inspectai-chave-super-secreta-2026';

function makeRequest(body) {
  return new Request('http://localhost:3000/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

describe('Login de usuários', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockFindUnique = jest.fn();
  });

  it('✅ Deve autenticar ADMINISTRADOR e retornar token com cargo e permissões', async () => {
    const senhaHash = bcrypt.hashSync('senha-admin', 10);
    mockFindUnique.mockResolvedValue({
      id: 7,
      nome: 'Admin InspectAI',
      email: 'admin@inspectai.com',
      senhaHash,
      cargo: 'ADMINISTRADOR',
    });

    const res = await POST(makeRequest({ email: 'admin@inspectai.com', senha: 'senha-admin' }));
    const body = await res.json();
    const tokenPayload = jwt.verify(body.data.token, JWT_SECRET);

    expect(res.status).toBe(200);
    expect(body.success).toBe(true);
    expect(body.data).toMatchObject({
      id: 7,
      nome: 'Admin InspectAI',
      email: 'admin@inspectai.com',
      cargo: 'ADMINISTRADOR',
      permissoes: ['ADMIN', 'RELATORIOS'],
    });
    expect(tokenPayload).toMatchObject({ id: 7, cargo: 'ADMINISTRADOR' });
  });

  it('✅ Deve autenticar FUNCIONARIO sem permissões administrativas', async () => {
    const senhaHash = bcrypt.hashSync('senha-funcionario', 10);
    mockFindUnique.mockResolvedValue({
      id: 8,
      nome: 'Funcionario InspectAI',
      email: 'funcionario@inspectai.com',
      senhaHash,
      cargo: 'FUNCIONARIO',
    });

    const res = await POST(makeRequest({ email: 'funcionario@inspectai.com', senha: 'senha-funcionario' }));
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.data.cargo).toBe('FUNCIONARIO');
    expect(body.data.permissoes).toEqual([]);
    expect(body.data.token).toEqual(expect.any(String));
  });

  it('🔒 Deve recusar senha incorreta', async () => {
    const senhaHash = bcrypt.hashSync('senha-correta', 10);
    mockFindUnique.mockResolvedValue({
      id: 9,
      nome: 'Usuario',
      email: 'usuario@inspectai.com',
      senhaHash,
      cargo: 'FUNCIONARIO',
    });

    const res = await POST(makeRequest({ email: 'usuario@inspectai.com', senha: 'senha-errada' }));
    const body = await res.json();

    expect(res.status).toBe(401);
    expect(body.success).toBe(false);
    expect(body.error).toBe('Credenciais inválidas');
  });
});
