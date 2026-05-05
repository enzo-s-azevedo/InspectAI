import { NextResponse } from 'next/server';

export async function GET() {
  const swaggerSpec = {
    openapi: '3.0.0',
    info: {
      title: 'InspectAI API',
      version: '1.0.0',
      description: 'Documentação interativa da API do sistema InspectAI para análise de PCBs.',
    },
    servers: [
      {
        url: 'http://localhost:3001',
        description: 'Servidor Local (Docker)',
      },
    ],
    paths: {
      // ==========================================
      // HEALTH E DETECTION
      // ==========================================
      '/api/health': {
        get: {
          summary: 'Verifica o status do servidor backend',
          tags: ['Health & Detection'],
          responses: {
            200: {
              description: 'Servidor online',
              content: {
                'application/json': {
                  example: { status: 'ok', timestamp: '2026-05-04T12:00:00Z' }
                }
              }
            }
          }
        }
      },
      '/api/detection': {
        post: {
          summary: 'Envia uma imagem da PCB para análise na IA',
          tags: ['Health & Detection'],
          requestBody: {
            required: true,
            content: {
              'multipart/form-data': {
                schema: {
                  type: 'object',
                  properties: { file: { type: 'string', format: 'binary', description: 'Imagem da placa' } }
                }
              }
            }
          },
          responses: {
            200: {
              description: 'Análise concluída com sucesso',
              content: {
                'application/json': {
                  example: {
                    success: true,
                    detections: [
                      { type: 'curto-circuito', confidence: 0.89, bbox: [10, 20, 50, 60] }
                    ]
                  }
                }
              }
            }
          }
        },
      },
      // ==========================================
      // USUÁRIOS
      // ==========================================
      '/api/usuarios': {
        get: {
          summary: 'Lista todos os usuários do sistema',
          tags: ['Usuários'],
          parameters: [
            { name: 'papel', in: 'query', description: 'Filtrar por papel (admin, funcionario, inspetor)', schema: { type: 'string' } },
            { name: 'status', in: 'query', description: 'Filtrar por status (ativo, inativo)', schema: { type: 'string' } }
          ],
          responses: {
            200: {
              description: 'Lista de usuários',
              content: {
                'application/json': {
                  example: {
                    total: 2,
                    data: [
                      { id: 'clx123abc0000', email: 'felipe@inspectai.com', nome: 'Felipe Salazar', papel: 'admin', status: 'ativo' }
                    ]
                  }
                }
              }
            }
          }
        },
        post: {
          summary: 'Cria um novo usuário',
          tags: ['Usuários'],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                example: { email: 'novo@inspectai.com', nome: 'Novo Usuário', papel: 'funcionario', status: 'ativo' }
              }
            }
          },
          responses: {
            201: { description: 'Usuário criado com sucesso' },
            409: { description: 'Email já cadastrado' }
          }
        }
      },
      '/api/usuarios/{id}': {
        put: {
          summary: 'Edita um usuário existente',
          tags: ['Usuários'],
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
          requestBody: {
            content: {
              'application/json': {
                example: { nome: 'Nome Atualizado', papel: 'inspetor', status: 'ativo' }
              }
            }
          },
          responses: {
            200: { description: 'Usuário atualizado com sucesso' },
            404: { description: 'Usuário não encontrado' }
          }
        },
        delete: {
          summary: 'Exclui um usuário do sistema',
          tags: ['Usuários'],
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
          responses: {
            200: { description: 'Usuário removido com sucesso' },
            404: { description: 'Usuário não encontrado' }
          }
        }
      },
      // ==========================================
      // PLACAS
      // ==========================================
      '/api/placas': {
        get: {
          summary: 'Lista todas as placas com seus defeitos e inspeções associadas',
          tags: ['Placas'],
          responses: {
            200: {
              description: 'Lista de placas retornada com sucesso',
              content: {
                'application/json': {
                  example: {
                    total: 1,
                    data: [
                      {
                        id: 'clx789xyz0002',
                        codigo: 'PCB-AALLL-L1',
                        nomeClasse: 'placa-mae-v2',
                        defeitos: []
                      }
                    ]
                  }
                }
              }
            }
          }
        },
        post: {
          summary: 'Criar nova placa',
          tags: ['Placas'],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                example: {
                  codigo: 'PCB-AALLL-L2',
                  nomeClasse: 'placa-fonte',
                  descricao: 'Lote novo recebido',
                  localizacao: 'Estoque Central'
                }
              }
            }
          },
          responses: {
            201: { description: 'Placa criada com sucesso' },
            409: { description: 'Código de placa já existe' }
          }
        }
      },
      '/api/placas/{id}': {
        put: {
          summary: 'Edita uma placa existente',
          tags: ['Placas'],
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
          requestBody: {
            content: {
              'application/json': {
                example: { descricao: 'Descrição atualizada', localizacao: 'Bancada 05' }
              }
            }
          },
          responses: {
            200: { description: 'Placa atualizada com sucesso' },
            404: { description: 'Placa não encontrada' }
          }
        },
        delete: {
          summary: 'Exclui uma placa do sistema',
          tags: ['Placas'],
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
          responses: {
            200: { description: 'Placa removida com sucesso' },
            404: { description: 'Placa não encontrada' }
          }
        }
      },
      // ==========================================
      // DEFEITOS
      // ==========================================
      '/api/defeitos': {
        get: {
          summary: 'Lista todos os defeitos registrados',
          tags: ['Defeitos'],
          parameters: [
            { name: 'status', in: 'query', description: 'Filtrar por status', schema: { type: 'string' } },
            { name: 'severidade', in: 'query', description: 'Filtrar por severidade', schema: { type: 'string' } },
            { name: 'placaCodigo', in: 'query', description: 'Filtrar pelo código da placa', schema: { type: 'string' } }
          ],
          responses: {
            200: {
              description: 'Lista de defeitos retornada',
              content: {
                'application/json': {
                  example: {
                    total: 1,
                    data: [
                      { 
                        id: 'cld123def', 
                        codigoInterno: '#DEF-0001', 
                        tipo: 'oxidacao', 
                        status: 'em-analise',
                        placa: { codigo: 'PCB-A001-L1' }
                      }
                    ]
                  }
                }
              }
            }
          }
        },
        post: {
          summary: 'Registra um novo defeito manualmente',
          tags: ['Defeitos'],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                example: {
                  placaId: 'ID_DA_PLACA_AQUI',
                  tipo: 'rachadura',
                  classe: 'rachadura',
                  severidade: 'alta',
                  componente: 'Resistor R22'
                }
              }
            }
          },
          responses: {
            201: { description: 'Defeito registrado com sucesso' }
          }
        }
      },
      // ==========================================
      // RELATÓRIOS
      // ==========================================
      '/api/relatorios': {
        get: {
          summary: 'Lista os relatórios gerados',
          tags: ['Relatórios'],
          responses: {
            200: {
              description: 'Lista de relatórios',
              content: {
                'application/json': {
                  example: {
                    total: 1,
                    data: [
                      {
                        id: 'clr123rel0001',
                        codigoInterno: 'REL-001',
                        titulo: 'Relatório Diário',
                        status: 'finalizado'
                      }
                    ]
                  }
                }
              }
            }
          }
        }
      }
    }
  };

  return NextResponse.json(swaggerSpec);
}