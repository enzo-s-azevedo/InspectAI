# InspectAI API Contract

Contrato atual baseado no schema oficial minimalista.

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

Para `tipo: "imagem"`, `data_hora` é salvo como `null`. Para `tipo: "video"`, o MySQL preenche `data_hora` com `CURRENT_TIMESTAMP` quando o campo não é informado.

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

Cria uma nova placa vinculada ao modelo informado e persiste as deteccoes somente quando o usuario confirma o salvamento.
