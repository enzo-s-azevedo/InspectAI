import { DELETE, PUT } from '../../backend/src/app/api/modelos/route';

jest.mock('@/lib/db', () => {
  const db = {
    modelo: {
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  };

  return {
    __esModule: true,
    default: db,
    prisma: db,
  };
});

const prisma = jest.requireMock('@/lib/db').default;

function makeJsonRequest(method, body) {
  return new Request('http://localhost:3000/api/modelos', {
    method,
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });
}

describe('CRUD de modelos', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('edita um modelo existente no banco', async () => {
    prisma.modelo.findUnique.mockResolvedValue(null);
    prisma.modelo.update.mockResolvedValue({
      codigo: 'PCB-EDITADO',
      placas: [{ id: 1, modeloCodigo: 'PCB-EDITADO' }],
    });

    const response = await PUT(
      makeJsonRequest('PUT', {
        codigo_atual: 'PCB-ANTIGO',
        novo_codigo: 'PCB-EDITADO',
      })
    );
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload.success).toBe(true);
    expect(payload.data).toEqual({
      codigo: 'PCB-EDITADO',
      placas: [{ id: 1, modelo_codigo: 'PCB-EDITADO' }],
    });
    expect(prisma.modelo.update).toHaveBeenCalledWith({
      where: { codigo: 'PCB-ANTIGO' },
      data: { codigo: 'PCB-EDITADO' },
      include: {
        placas: {
          select: {
            id: true,
            modeloCodigo: true,
          },
        },
      },
    });
  });

  it('exclui um modelo existente no banco', async () => {
    prisma.modelo.delete.mockResolvedValue({ codigo: 'PCB-REMOVER' });

    const response = await DELETE(
      makeJsonRequest('DELETE', {
        codigo: 'PCB-REMOVER',
      })
    );
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload.success).toBe(true);
    expect(payload.data).toEqual({
      codigo: 'PCB-REMOVER',
      message: 'Modelo removido com sucesso',
    });
    expect(prisma.modelo.delete).toHaveBeenCalledWith({
      where: { codigo: 'PCB-REMOVER' },
    });
  });
});
