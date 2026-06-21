import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { POST } from '../../backend/src/app/api/auth/login/route';

jest.mock('bcryptjs', () => ({
  compare: jest.fn().mockImplementation((senha, hash) => {
    return Promise.resolve(senha === 'senha-admin' || senha === 'senha-funcionario' || senha === 'senha-correta');
  }),
  hashSync: jest.fn((senha) => senha),
}));

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
  return {
    json: jest.fn().mockResolvedValue(body),
    headers: new Headers(),
  };
}

describe('Login de usuários', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockFindUnique = jest.fn();
  });

  it('✅ Deve autenticar ADMINISTRADOR e retornar token com cargo e permissões', async () => {
    mockFindUnique.mockResolvedValue({
      id: 7,
      nome: 'Admin InspectAI',
      email: 'admin@inspectai.com',
      senhaHash: 'senha-admin',
      cargo: 'ADMINISTRADOR',
    });

    const res = await POST(makeRequest({ email: 'admin@inspectai.com', senha: 'senha-admin' }));
    
    // Convertendo a string JSON do mock para um objeto real
    const body = await res.json(); 

    const tokenPayload = jwt.verify(body.data.token, JWT_SECRET);

    expect(res.status).toBe(200);
    expect(body.success).toBe(true);
    expect(body.data).toMatchObject({
      id: 7,
      cargo: 'ADMINISTRADOR',
      permissoes: ['ADMIN', 'RELATORIOS'],
    });
    expect(tokenPayload).toMatchObject({ id: 7, cargo: 'ADMINISTRADOR' });
  });

  it('✅ Deve autenticar FUNCIONARIO sem permissões administrativas', async () => {
    mockFindUnique.mockResolvedValue({
      id: 8,
      nome: 'Funcionario InspectAI',
      email: 'funcionario@inspectai.com',
      senhaHash: 'senha-funcionario',
      cargo: 'FUNCIONARIO',
    });

    const res = await POST(makeRequest({ email: 'funcionario@inspectai.com', senha: 'senha-funcionario' }));
    
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.data.cargo).toBe('FUNCIONARIO');
    expect(body.data.permissoes).toEqual([]);
    expect(body.data.token).toBeDefined();
  });

  it('🔒 Deve recusar senha incorreta', async () => {
    mockFindUnique.mockResolvedValue({
      id: 9,
      nome: 'Usuario',
      email: 'usuario@inspectai.com',
      senhaHash: 'senha-correta',
      cargo: 'FUNCIONARIO',
    });

    const res = await POST(makeRequest({ email: 'usuario@inspectai.com', senha: 'senha-errada' }));
    
    const body = await res.json();

    expect(res.status).toBe(401);
    expect(body.success).toBe(false);
    expect(body.error).toBe('Credenciais inválidas');
  });
});