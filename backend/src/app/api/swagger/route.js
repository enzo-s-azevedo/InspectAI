import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    openapi: '3.0.0',
    info: {
      title: 'InspectAI API',
      version: '1.0.0',
      description: 'API minimalista baseada no modelo oficial modelo -> placa -> defeito, com autenticação JWT.',
    },
    servers: [{ url: 'http://localhost:3001', description: 'Servidor Local Docker' }],
    paths: {
      '/api/health': {
        get: {
          summary: 'Verifica backend, banco e IA',
          tags: ['Health'],
          responses: { 200: { description: 'Servico online' } },
        },
      },
      // ==========================================
      // AUTENTICAÇÃO E USUÁRIOS
      // ==========================================
      '/api/usuarios': {
        get: {
          summary: 'Lista todos os usuários',
          tags: ['Usuários'],
          responses: { 200: { description: 'Lista de usuários retornada' } },
        },
        post: {
          summary: 'Cria novo usuário com senha criptografada',
          tags: ['Usuários'],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                example: {
                  nome: 'Admin Teste',
                  email: 'admin@teste.com',
                  senha: 'senha-segura-123',
                  cargo: 'ADMINISTRADOR'
                }
              }
            }
          },
          responses: { 
            201: { description: 'Usuário criado' },
            400: { description: 'Email já cadastrado ou campos ausentes' }
          },
        },
      },
      '/api/auth/login': {
        post: {
          summary: 'Autentica um usuário e retorna o token JWT',
          tags: ['Autenticação'],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                example: { 
                  email: 'admin@teste.com', 
                  senha: 'senha-segura-123' 
                }
              }
            }
          },
          responses: {
            200: { description: 'Login realizado com sucesso (Retorna o Token e salva no Cookie)' },
            400: { description: 'Dados ausentes' },
            401: { description: 'Credenciais inválidas' }
          }
        }
      },
      // ==========================================
      // DETECTION
      // ==========================================
      '/api/detection': {
        get: {
          summary: 'Verifica disponibilidade da IA',
          tags: ['Detection'],
          responses: { 200: { description: 'IA disponivel' } },
        },
        post: {
          summary: 'Processa imagem, ZIP ou video e retorna analise temporaria',
          tags: ['Detection'],
          requestBody: {
            required: true,
            content: {
              'multipart/form-data': {
                schema: {
                  type: 'object',
                  properties: {
                    file: { type: 'string', format: 'binary' },
                    modelo_codigo: { type: 'string' },
                    classes: { type: 'string' },
                  },
                },
              },
            },
          },
          responses: { 200: { description: 'Analise concluida' } },
        },
      },
      '/api/detection/save': {
        post: {
          summary: 'Salva placa e defeitos confirmados',
          tags: ['Detection'],
          requestBody: {
            content: {
              'application/json': {
                example: {
                  modelo_codigo: 'PCB-A001-L1',
                  source_type: 'imagem',
                  detections: [
                    {
                      class_id: 0,
                      label: 'R/CFaltante',
                      confidence: 0.97,
                      bbox: [10, 20, 100, 120],
                    },
                  ],
                },
              },
            },
          },
          responses: { 201: { description: 'Deteccoes salvas' } },
        },
      },
      // ==========================================
      // MODELOS, PLACAS E DEFEITOS
      // ==========================================
      '/api/modelos': {
        get: {
          summary: 'Lista modelos',
          tags: ['Modelo'],
          responses: { 200: { description: 'Lista de modelos' } },
        },
        post: {
          summary: 'Cria modelo',
          tags: ['Modelo'],
          requestBody: {
            content: {
              'application/json': {
                example: { codigo: 'PCB-A001-L1' },
              },
            },
          },
          responses: { 201: { description: 'Modelo criado' } },
        },
      },
      '/api/placas': {
        get: {
          summary: 'Lista placas',
          tags: ['Placa'],
          responses: { 200: { description: 'Lista de placas' } },
        },
        post: {
          summary: 'Cria placa vinculada a um modelo',
          tags: ['Placa'],
          requestBody: {
            content: {
              'application/json': {
                example: { modelo_codigo: 'PCB-A001-L1' },
              },
            },
          },
          responses: { 201: { description: 'Placa criada' } },
        },
      },
      '/api/placas/{id}': {
        get: {
          summary: 'Busca placa',
          tags: ['Placa'],
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
          responses: { 200: { description: 'Placa encontrada' } },
        },
        put: {
          summary: 'Atualiza modelo da placa',
          tags: ['Placa'],
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
          requestBody: {
            content: {
              'application/json': {
                example: { modelo_codigo: 'PCB-B002-L2' },
              },
            },
          },
          responses: { 200: { description: 'Placa atualizada' } },
        },
        delete: {
          summary: 'Remove placa sem defeitos vinculados',
          tags: ['Placa'],
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
          responses: { 200: { description: 'Placa removida' } },
        },
      },
      '/api/defeitos': {
        get: {
          summary: 'Lista defeitos',
          tags: ['Defeito'],
          parameters: [
            { name: 'classe_defeito', in: 'query', schema: { type: 'string' } },
            { name: 'placa_id', in: 'query', schema: { type: 'integer' } },
            { name: 'modelo_codigo', in: 'query', schema: { type: 'string' } },
          ],
          responses: { 200: { description: 'Lista de defeitos' } },
        },
        post: {
          summary: 'Cria defeito de imagem ou video',
          tags: ['Defeito'],
          requestBody: {
            content: {
              'application/json': {
                example: {
                  placa_id: 1,
	                  classe_defeito: 'solda-fria',
	                  status_confirmacao: 'confirmado',
	                  classificacao: 'real',
	                  tipo: 'video',
                },
              },
            },
          },
          responses: { 201: { description: 'Defeito criado' } },
        },
        put: {
          summary: 'Atualiza status de confirmação do defeito',
          tags: ['Defeito'],
          requestBody: {
            content: {
              'application/json': {
	                example: { id: 1, status_confirmacao: 'falso_positivo', classificacao: 'falso_positivo' },
              },
            },
          },
          responses: { 200: { description: 'Defeito atualizado' } },
        },
      },
    },
  });
}
