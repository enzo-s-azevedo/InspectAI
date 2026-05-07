#  Contrato de API — InspectAI

> **Responsável:** José Leandro Correa Trivelato  
> **Sprint:** 2  
> **Versão:** 1.1.0  
> **Base URL Backend:** `http://localhost:3001/api`  
> **Base URL via Proxy (Docker):** `/backend-api`  
> **Validado em:** 06/05/2026

---

##  Sumário

- [Arquitetura](#arquitetura)
- [Padrão de Resposta](#padrão-de-resposta)
- [Códigos de Status HTTP](#códigos-de-status-http)
- [Padrão de Erros](#padrão-de-erros)
- [Rotas Validadas](#rotas-validadas)
  - [Health](#health)
  - [Placas](#placas)
  - [Defeitos](#defeitos)
  - [Relatórios](#relatórios)
  - [Usuários](#usuários)
  - [Detecção IA](#detecção-ia)

---

## Arquitetura

```
Frontend (porta 3000)
    └── /backend-api/* → proxy → Backend (porta 3001) /api/*
                                      └── MySQL (porta 3307)
                                      └── IA Flask/YOLO (porta 5005)
```

---

## Padrão de Resposta

Todas as respostas do backend seguem o envelope:

```json
{
  "success": true,
  "data": [...],
  "meta": { "total": 3 },
  "error": null
}
```

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `success` | boolean | `true` se a requisição foi bem-sucedida |
| `data` | array ou object | Dados retornados |
| `meta` | object | Metadados como total de registros |
| `error` | string ou null | Mensagem de erro se houver |

---

## Códigos de Status HTTP

| Código | Significado | Quando usar |
|--------|-------------|-------------|
| `200` | OK | Requisição bem-sucedida |
| `201` | Created | Recurso criado com sucesso |
| `400` | Bad Request | Dados inválidos ou ausentes |
| `404` | Not Found | Recurso não encontrado |
| `500` | Internal Server Error | Erro interno do servidor |

---

## Padrão de Erros

```json
{
  "success": false,
  "data": null,
  "meta": {},
  "error": "Descrição do erro"
}
```

---

## Rotas Validadas

### Health

#### `GET /api/health`

Verifica o status de todos os serviços.

**Resposta de sucesso `200`:**
```json
{
  "success": true,
  "data": {
    "api": "ok",
    "database": "ok",
    "ai": {
      "error": "Modelo indisponivel: Nenhum modelo .pt encontrado",
      "model": null,
      "model_loaded": false,
      "status": "degraded"
    }
  },
  "meta": {},
  "error": null
}
```

>  **Status atual:** IA degraded — arquivo `best.pt` não encontrado na pasta `yolo/`

---

### Placas

#### `GET /api/placas`

Retorna lista de placas com seus defeitos vinculados.

**Resposta de sucesso `200`:**
```json
{
  "success": true,
  "data": [
    {
      "id": "cmoul70px0005ttzwz270a709",
      "codigo": "PCB-C003-L3",
      "nome_classe": "PCB-C003-L3",
      "descricao": "Power Supply Linha C",
      "localizacao": "Setor 03 - Prateleira 03",
      "criado": "2026-05-06T21:46:10.917Z",
      "atualizado": "2026-05-06T21:46:10.917Z",
      "defeitos": []
    }
  ],
  "meta": { "total": 3 },
  "error": null
}
```

#### `POST /api/placas`

Cria uma nova placa.

**Payload de entrada:**
```json
{
  "codigo": "PCB-D001-L1",
  "nome_classe": "PCB-D001-L1",
  "descricao": "Placa de controle linha D",
  "localizacao": "Setor 04 - Prateleira 01"
}
```

#### `GET /api/placas/:id`

Retorna detalhes de uma placa específica.

#### `PUT /api/placas/:id`

Atualiza uma placa.

#### `DELETE /api/placas/:id`

Remove uma placa.

---

### Defeitos

#### `GET /api/defeitos`

Retorna lista de defeitos com placa e usuário vinculados.

**Resposta de sucesso `200`:**
```json
{
  "success": true,
  "data": [
    {
      "id": "cmoul70qf0009ttzwvifkq40m",
      "classe": "oxidacao",
      "data_hora": "2026-05-06T21:46:10.935Z",
      "nome_arquivo_origem": "seed-pcb-b002.png",
      "id_placa_origem": "cmoul70pr0004ttzwnxlcarqa",
      "codigoInterno": "DEF-0002",
      "tipo": "oxidacao",
      "componente": "Trilha de cobre",
      "origem": "manual",
      "severidade": "alta",
      "descricao": "Oxidação visível na trilha",
      "status": "em-analise",
      "criado": "2026-05-06T21:46:10.935Z",
      "atualizado": "2026-05-06T21:46:10.935Z",
      "resolvido": null,
      "placa": {
        "id": "cmoul70pr0004ttzwnxlcarqa",
        "codigo": "PCB-B002-L2",
        "descricao": "Controladora Linha B"
      },
      "usuario": {
        "id": "cmoul70p80002ttzwz3nk4vtt",
        "nome": "Maria Santos",
        "email": "inspetor@inspectai.local"
      },
      "imagens": []
    }
  ],
  "meta": { "total": 2 },
  "error": null
}
```

**Campos de status possíveis:**
| Valor | Significado |
|-------|-------------|
| `aberto` | Defeito detectado, aguardando análise |
| `em-analise` | Em processo de avaliação |
| `resolvido` | Defeito confirmado e tratado |
| `descartado` | Marcado como falso positivo |

**Campos de severidade:**
| Valor | Descrição |
|-------|-----------|
| `baixa` | Impacto mínimo |
| `media` | Impacto moderado |
| `alta` | Impacto significativo |
| `critica` | Impacto crítico na placa |

**Campos de origem:**
| Valor | Descrição |
|-------|-----------|
| `manual` | Inserido manualmente |
| `automatico` | Detectado pela IA |
| `importado` | Importado de arquivo externo |

#### `POST /api/defeitos`

Cria um defeito manualmente.

**Payload de entrada:**
```json
{
  "classe": "oxidacao",
  "tipo": "oxidacao",
  "componente": "Trilha de cobre",
  "origem": "manual",
  "severidade": "alta",
  "descricao": "Oxidação detectada na trilha principal",
  "id_placa_origem": "cmoul70pr0004ttzwnxlcarqa"
}
```

---

### Relatórios

#### `GET /api/relatorios`

Retorna lista de relatórios com defeitos vinculados.

**Resposta de sucesso `200`:**
```json
{
  "success": true,
  "data": [
    {
      "id": "cmoul70qp000bttzwpz5v1rgt",
      "codigoInterno": "REL-001",
      "titulo": "Inspeção PCB-A001-L1 - Abril 2026",
      "descricao": "Inspeção de qualidade realizada em 09/04/2026",
      "origem": "inspecao",
      "status": "finalizado",
      "criado": "2026-05-06T21:46:10.945Z",
      "atualizado": "2026-05-06T21:46:10.945Z",
      "usuario": {
        "id": "cmoul70p10001ttzwmem9npoy",
        "nome": "João Silva",
        "email": "funcionario@inspectai.local"
      },
      "defeitos": [...]
    }
  ],
  "meta": { "total": 1 },
  "error": null
}
```

**Campos de status:**
| Valor | Descrição |
|-------|-----------|
| `rascunho` | Em elaboração |
| `finalizado` | Concluído |
| `arquivado` | Arquivado |

#### `POST /api/relatorios`

Cria um novo relatório.

**Payload de entrada:**
```json
{
  "titulo": "Inspeção Lote B-047",
  "descricao": "Relatório de inspeção do lote B-047",
  "origem": "inspecao"
}
```

---

### Usuários

#### `GET /api/usuarios`

Retorna lista de usuários cadastrados.

**Resposta de sucesso `200`:**
```json
{
  "success": true,
  "data": [
    {
      "id": "cmoul70p80002ttzwz3nk4vtt",
      "nome": "Maria Santos",
      "email": "inspetor@inspectai.local",
      "papel": "inspetor",
      "status": "ativo",
      "avatar": null,
      "criado": "2026-05-06T21:46:10.892Z",
      "atualizado": "2026-05-06T21:46:10.892Z"
    }
  ],
  "meta": { "total": 3 },
  "error": null
}
```

**Papéis disponíveis:**
| Valor | Descrição |
|-------|-----------|
| `admin` | Acesso total ao sistema |
| `funcionario` | Acesso padrão |
| `inspetor` | Acesso de inspeção |

#### `POST /api/usuarios`

Cria um novo usuário.

**Payload de entrada:**
```json
{
  "nome": "João da Silva",
  "email": "joao@inspectai.local",
  "papel": "funcionario"
}
```

#### `PUT /api/usuarios/:id`

Atualiza um usuário existente.

#### `DELETE /api/usuarios/:id`

Remove um usuário.

>  **Bug conhecido:** `GET /api/usuarios/:id` retorna erro 500 — usa `prisma.placas` em vez de `prisma.usuario` (1 linha para corrigir)

---

### Detecção IA

#### `POST /api/detection`

Envia imagem para análise pelo modelo YOLO.

**Payload de entrada (`multipart/form-data`):**
| Campo | Tipo | Descrição |
|-------|------|-----------|
| `file` | file | Imagem JPG, PNG ou ZIP |
| `placaCodigo` | string | Código da placa (ex: `PCB-A001-L1`) |
| `classes` | string | Classes a filtrar (opcional, ex: `rachadura,oxidacao`) |

**Resposta de sucesso `200`:**
```json
{
  "success": true,
  "data": {
    "deteccoes": [
      {
        "classe": "rachadura",
        "confianca": 0.71,
        "bbox": [x, y, largura, altura]
      }
    ],
    "total": 1,
    "imagemProcessada": "url-da-imagem"
  },
  "meta": {},
  "error": null
}
```

>  **Bug conhecido:** IA retorna detecções mas 0 são persistidas no banco de dados. A função `persistDetections()` não está sendo chamada corretamente.

---

## 🔗 Alinhamento Frontend — services/api.js

```javascript
const BASE_URL = '/backend-api'

export const api = {
  getHealth:       () => request('/health'),
  getPlacas:       () => request('/placas'),
  getDefeitos:     (params) => request(`/defeitos${params ? `?${new URLSearchParams(params)}` : ''}`),
  criarDefeito:    (body) => requestBody('POST', '/defeitos', body),
  analisarImagem:  (formData) => requestForm('/detection', formData),
  getRelatorios:   () => request('/relatorios'),
  criarRelatorio:  (body) => requestBody('POST', '/relatorios', body),
  getUsuarios:     () => request('/usuarios'),
  criarUsuario:    (body) => requestBody('POST', '/usuarios', body),
  editarUsuario:   (id, body) => requestBody('PUT', `/usuarios/${id}`, body),
  deletarUsuario:  (id) => requestBody('DELETE', `/usuarios/${id}`),
}
```

---

##  Status de Validação

| Rota | Método | Status | Observação |
|------|--------|--------|------------|
| `/api/health` | GET |  OK | IA degraded (sem modelo .pt) |
| `/api/placas` | GET |  OK | 3 registros retornados |
| `/api/placas` | POST |  OK | - |
| `/api/placas/:id` | GET |  Parcial | Pode ter issues |
| `/api/defeitos` | GET |  OK | 2 registros retornados |
| `/api/defeitos` | POST |  OK | - |
| `/api/relatorios` | GET |  OK | 1 registro retornado |
| `/api/relatorios` | POST |  OK | - |
| `/api/usuarios` | GET |  OK | 3 registros retornados |
| `/api/usuarios` | POST |  OK | - |
| `/api/usuarios/:id` | GET |  FAIL | Bug: usa `prisma.placas` em vez de `prisma.usuario` |
| `/api/detection` | POST |  FAIL | IA detecta mas não persiste no banco |

---

##  Bugs Identificados para o Time

### Bug #1 — GET /api/usuarios/:id
**Arquivo:** `backend/src/app/api/usuarios/[id]/route.js` linha 9  
**Fix:** Trocar `prisma.placas` por `prisma.usuario`

### Bug #2 — POST /api/detection não persiste
**Arquivo:** `backend/src/app/api/detection/route.js`  
**Sintoma:** IA retorna detecções mas banco recebe 0 defeitos  
**Fix:** Verificar chamada da função `persistDetections()` e o fluxo de `resolvePlaca()`
