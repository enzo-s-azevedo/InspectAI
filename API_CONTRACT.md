# InspectAI API Contract

Contrato atual baseado no schema oficial com placas, defeitos e relatorios.

## Response Envelope

Todas as rotas JSON retornam:

```json
{
  "success": true,
  "data": {},
  "meta": {},
  "error": null
}
```

## Rotas

### `GET /api/health`

Valida backend, banco e serviço de IA.

### `GET /api/modelos`

Lista modelos.

### `POST /api/modelos`

Body:

```json
{ "codigo": "PCB-A001-L1" }
```

### `GET /api/placas`

Lista placas com modelo e defeitos vinculados.

### `POST /api/placas`

Body:

```json
{ "modelo_codigo": "PCB-A001-L1" }
```

### `GET /api/placas/:id`

Busca uma placa.

### `PUT /api/placas/:id`

Body:

```json
{ "modelo_codigo": "PCB-B002-L2" }
```

### `DELETE /api/placas/:id`

Remove placa sem defeitos vinculados.

### `GET /api/defeitos`

Filtros:

- `placa_id`
- `id_placa`
- `modelo_codigo`
- `placaCodigo`
- `classe_defeito`

### `POST /api/defeitos`

Body mínimo:

```json
{
  "placa_id": 1,
  "classe_defeito": "solda-fria",
  "status_confirmacao": "confirmado"
}
```

Com vídeo:

```json
{
  "placa_id": 1,
  "classe_defeito": "solda-fria",
  "status_confirmacao": "confirmado",
  "tipo": "video"
}
```

Para `tipo: "imagem"`, `data_hora` é salvo como `null`. Para `tipo: "video"`, o PostgreSQL preenche `data_hora` com `CURRENT_TIMESTAMP` quando o campo não é informado.

Valores aceitos para `status_confirmacao`:

- `confirmado`
- `falso_positivo`

### `PUT /api/defeitos`

Atualiza a confirmação do defeito.

```json
{
  "id": 1,
  "status_confirmacao": "falso_positivo"
}
```

### `POST /api/detection`

Multipart:

- `file`: imagem, ZIP ou vídeo
- `modelo_codigo`: obrigatorio para validar o modelo selecionado
- `classes`: opcional

Retorna apenas a analise temporaria, sem persistir no banco.

### `POST /api/detection/save`

Body JSON:

```json
{
  "modelo_codigo": "PCB-A001-L1",
  "source_type": "imagem",
  "detections": [
    {
      "class_id": 0,
      "label": "R/CFaltante",
      "confidence": 0.97,
      "bbox": [10, 20, 100, 120]
    }
  ]
}
```

Cria uma nova placa vinculada ao modelo informado, cria um relatorio associado ao usuario autenticado e persiste as deteccoes somente quando o usuario confirma o salvamento.

### `POST /api/detection/batch`

Multipart:

- `files`: pasta/arquivos de imagens `.jpg` ou `.png`

Retorna somente a analise temporaria do lote. Nenhuma deteccao e persistida no banco por esse endpoint; o salvamento definitivo ocorre apenas em `POST /api/detection/save`.
- `modelo_codigo`: obrigatorio
- `classes`: opcional

Cria o relatorio no inicio da execucao, associa o usuario autenticado como criador, vincula todas as imagens selecionadas ao relatorio e registra os defeitos detectados por imagem.

### `PATCH /api/relatorios/:id`

Atualiza dados administrativos do relatorio e registra `id_usuario_ultimo_acesso` sem alterar o criador original.

**Restrições:**
- Apenas usuários com cargo `ADMINISTRADOR` podem acessar esta rota.
- `id_usuario_criador` é imutável e será ignorado se enviado no body.
- `id_usuario_ultimo_acesso` é preenchido automaticamente com o ID do administrador autenticado.

**Body:**
```json
{
  "placa_id": 12
}
```

---

### `POST /api/auth/login`

Realiza a autenticação de usuários no sistema.

**Body:**
```json
{
  "email": "admin@inspectai.com",
  "senha": "senha-secreta"
}
```

**Retorno de sucesso (200):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "nome": "Admin",
    "email": "admin@inspectai.com",
    "cargo": "ADMINISTRADOR",
    "permissoes": ["dashboard:visualizar", "usuarios:gerenciar", "modelos:gerenciar", "relatorios:gerenciar"],
    "token": "JWT_TOKEN_STRING"
  }
}
```

---

### `GET /api/usuarios`

Lista todos os usuários cadastrados no sistema.

**Restrições:**
- Apenas usuários com cargo `ADMINISTRADOR` podem acessar esta rota.

**Retorno de sucesso (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "nome": "Admin",
      "email": "admin@inspectai.com",
      "cargo": "ADMINISTRADOR",
      "criadoEm": "2026-06-25T18:14:00.000Z"
    }
  ],
  "meta": { "total": 1 },
  "error": null
}
```

---

### `POST /api/usuarios`

Cadastra um novo usuário no sistema.

**Restrições:**
- Apenas usuários com cargo `ADMINISTRADOR` podem acessar esta rota.

**Body:**
```json
{
  "nome": "Funcionario Teste",
  "email": "func@inspectai.com",
  "senha": "senha-secreta-func",
  "cargo": "FUNCIONARIO"
}
```

**Retorno de sucesso (201):**
```json
{
  "success": true,
  "data": {
    "id": 2,
    "nome": "Funcionario Teste",
    "email": "func@inspectai.com",
    "cargo": "FUNCIONARIO",
    "criadoEm": "2026-06-25T18:14:00.000Z"
  },
  "meta": {},
  "error": null
}
```

---

### `GET /api/usuarios/:id`

Busca detalhes de um usuário específico por ID.

**Restrições:**
- Apenas usuários com cargo `ADMINISTRADOR` podem acessar esta rota.

---

### `PUT /api/usuarios/:id`

Atualiza dados ou cargo de um usuário existente.

**Restrições:**
- Apenas usuários com cargo `ADMINISTRADOR` podem acessar esta rota.

**Body:**
```json
{
  "nome": "Nome Atualizado",
  "email": "atualizado@inspectai.com",
  "cargo": "FUNCIONARIO"
}
```

---

### `DELETE /api/usuarios/:id`

Remove um usuário do sistema.

**Restrições:**
- Apenas usuários com cargo `ADMINISTRADOR` podem acessar esta rota.
