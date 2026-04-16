# InspectAI

Aplicacao completa para inspeção de placas eletronicas com frontend, backend, banco MySQL e servico de inferencia YOLO.

## Arquitetura

- Frontend Next.js: interface de operacao e dashboards
- Backend Next.js: API REST e persistencia com Prisma
- Database: MySQL 8
- IA: Flask + Ultralytics YOLO
- Orquestracao: Docker Compose

## Contrato JSON padronizado

Todas as rotas do backend respondem no formato:

```json
{
  "success": true,
  "data": {},
  "meta": {},
  "error": null
}
```

Em erro:

```json
{
  "success": false,
  "data": null,
  "meta": {},
  "error": {
    "code": "ERROR_CODE",
    "message": "Mensagem"
  }
}
```

## Rotas principais

- GET, POST /api/usuarios
- GET, POST /api/placas
- GET, POST /api/defeitos
- GET, POST /api/relatorios
- GET, POST /api/detection
- GET /api/health

## Execucao com um comando

Requisito: Docker + Docker Compose instalados.

```bash
docker compose up --build
```

Servicos disponiveis:

- Frontend: http://localhost:3000
- Backend API: http://localhost:3001
- AI Service: http://localhost:5005
- MySQL: localhost:3307

## Observacoes de runtime

- O backend executa migracoes e seed no startup do container.
- O frontend consome backend por rewrite interna /backend-api, evitando CORS no browser.
- O servico de IA continua operacional mesmo sem arquivo .pt; nesse caso retorna deteccoes vazias.

## Testes de integracao

Este projeto possui uma suite de testes de integracao de ponta a ponta com geracao automatica de relatorio.

### Execucao local (com stack ja em execucao)

```bash
npm test
```

### Execucao em Docker (reprodutivel)

```bash
docker compose --profile test run --rm integration-tests
```

### Relatorio automatico

Ao final da execucao, o arquivo abaixo e atualizado automaticamente:

- integration-report.md

O relatorio inclui:

- resumo dos pontos de integracao testados
- status pass/fail por ponto
- endpoints/fluxos com falha
- analise de causa raiz
- sugestoes de correcao
- score geral de saude do sistema (0-100)
