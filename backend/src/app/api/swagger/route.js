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
                  example: {
                    success: true,
                    data: {
                      api: 'ok',
                      database: 'ok',
                      ai: { status: 'healthy', model_loaded: true },
                      timestamp: '2026-05-04T12:00:00Z'
                    },
                    meta: {},
                    error: null
                  }
                }
              }
            }
          }
        }
      },
      '/api/detection': {
        post: {
          summary: 'Envia imagem, lote ZIP ou vídeo da PCB para análise na IA',
          tags: ['Health & Detection'],
          requestBody: {
            required: true,
            content: {
              'multipart/form-data': {
                schema: {
                  type: 'object',
                  properties: {
                    file: { type: 'string', format: 'binary', description: 'Imagem, ZIP ou vídeo da placa' },
                    placaCodigo: { type: 'string', description: 'Código opcional da placa' },
                    classes: { type: 'string', description: 'JSON array ou lista separada por vírgula' },
                  }
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
                    data: {
                      detections: [
                        { label: 'curto-circuito', confidence: 0.89, bbox: [10, 20, 50, 60] }
                      ],
                      savedDefeitos: [
                        {
                          id: 1,
                          classe_defeito: 'curto-circuito',
                          data_hora: '2026-05-06T21:46:10.935Z',
                          nome_arquivo_origem: 'upload.png',
                          id_placa: 1,
                          origem: 'automatico',
                          confirmado: true
                        }
                      ],
                      itens: []
                    },
                    meta: {
                      inputType: 'image',
                      selectedClasses: [],
                      totalFiles: 1,
                      totalDetections: 1,
                      totalPersisted: 1
                    },
                    error: null
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
                    success: true,
                    data: [
                      {
                        id: 'clx123abc0000',
                        nome: 'Felipe Salazar',
                        email: 'felipe@inspectai.com',
                        papel: 'admin',
                        status: 'ativo',
                        avatar: null,
                        criado: '2026-05-06T21:46:10.892Z',
                        atualizado: '2026-05-06T21:46:10.892Z'
                      }
                    ],
                    meta: { total: 1 },
                    error: null
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
      // MODELOS
      // ==========================================
      '/api/modelos': {
        get: {
          summary: 'Lista modelos de placas',
          tags: ['Modelos'],
          responses: {
            200: {
              description: 'Lista de modelos retornada com sucesso',
              content: {
                'application/json': {
                  example: {
                    success: true,
                    data: [
                      {
                        codigo: 'PCB-A001-L1',
                        descricao: 'Modelo Placa Mae Linha A',
                        criado: '2026-05-06T21:46:10.917Z',
                        atualizado: '2026-05-06T21:46:10.917Z',
                        placas: [
                          { id: 1, codigo: 'PCB-A001-L1', nome_classe: 'PCB-A001-L1' }
                        ]
                      }
                    ],
                    meta: { total: 1 },
                    error: null
                  }
                }
              }
            }
          }
        },
        post: {
          summary: 'Cria um modelo de placa',
          tags: ['Modelos'],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                example: {
                  codigo: 'PCB-A001-L1',
                  descricao: 'Modelo Placa Mae Linha A'
                }
              }
            }
          },
          responses: {
            201: { description: 'Modelo criado com sucesso' },
            409: { description: 'Código de modelo já existe' }
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
                    success: true,
                    data: [
                      {
                        id: 1,
                        codigo: 'PCB-A001-L1',
                        modelo: 'PCB-A001-L1',
                        modelo_dados: {
                          codigo: 'PCB-A001-L1',
                          descricao: 'Modelo Placa Mae Linha A'
                        },
                        nome_classe: 'PCB-A001-L1',
                        descricao: 'Placa Mae Linha A',
                        localizacao: 'Setor 01 - Prateleira 01',
                        criado: '2026-05-06T21:46:10.917Z',
                        atualizado: '2026-05-06T21:46:10.917Z',
                        defeitos: [
                          { id: 1, classe_defeito: 'rachadura', confirmado: true }
                        ]
                      }
                    ],
                    meta: { total: 1 },
                    error: null
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
                  nome_classe: 'placa-fonte',
                  modelo: 'PCB-A001-L1',
                  codigo: 'PCB-AALLL-L2',
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
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
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
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
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
            { name: 'confirmado', in: 'query', description: 'Filtrar defeitos verdadeiros ou falsos positivos', schema: { type: 'boolean' } },
            { name: 'origem', in: 'query', description: 'Filtrar por origem', schema: { type: 'string' } },
            { name: 'classe_defeito', in: 'query', description: 'Filtrar por classe do defeito', schema: { type: 'string' } },
            { name: 'id_placa', in: 'query', description: 'Filtrar pelo ID numerico da placa', schema: { type: 'integer' } },
            { name: 'placaCodigo', in: 'query', description: 'Filtrar pelo código da placa', schema: { type: 'string' } }
          ],
          responses: {
            200: {
              description: 'Lista de defeitos retornada',
              content: {
                'application/json': {
                  example: {
                    success: true,
                    data: [
                      {
                        id: 1,
                        classe_defeito: 'oxidacao',
                        data_hora: '2026-05-06T21:46:10.935Z',
                        nome_arquivo_origem: 'upload.png',
                        id_placa: 1,
                        componente: 'Trilha de cobre',
                        origem: 'manual',
                        descricao: 'Oxidacao visivel na trilha',
                        confirmado: true,
                        criado: '2026-05-06T21:46:10.935Z',
                        atualizado: '2026-05-06T21:46:10.935Z',
                        resolvido: null,
                        placa: {
                          id: 1,
                          codigo: 'PCB-A001-L1',
                          modelo: 'PCB-A001-L1',
                          descricao: 'Placa Mae Linha A'
                        },
                        usuario: {
                          id: 'cmoul70p80002ttzwz3nk4vtt',
                          nome: 'Maria Santos',
                          email: 'inspetor@inspectai.local'
                        },
                        imagens: [],
                        videos: []
                      }
                    ],
                    meta: { total: 1 },
                    error: null
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
                  classe_defeito: 'rachadura',
                  data_hora: '2026-05-06T21:46:10.935Z',
                  nome_arquivo_origem: 'upload.png',
                  id_placa: 1,
                  confirmado: true
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
                    success: true,
                    data: [
                      {
                        id: 'clr123rel0001',
                        codigoInterno: 'REL-001',
                        titulo: 'Relatorio Diario',
                        descricao: 'Inspecao de qualidade',
                        origem: 'inspecao',
                        status: 'finalizado',
                        criado: '2026-05-06T21:46:10.945Z',
                        atualizado: '2026-05-06T21:46:10.945Z',
                        usuario: {
                          id: 'cmoul70p10001ttzwmem9npoy',
                          nome: 'Joao Silva',
                          email: 'funcionario@inspectai.local'
                        },
                        defeitos: []
                      }
                    ],
                    meta: { total: 1 },
                    error: null
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
