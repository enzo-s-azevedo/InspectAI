# InspectAI Backend

Backend Next.js com Prisma para gerenciar usuarios, placas, defeitos, relatorios e pipeline de deteccao com IA.

## Endpoints

- GET, POST /api/usuarios
- GET, POST /api/placas
- GET, POST /api/defeitos
- GET, POST /api/relatorios
- GET, POST /api/detection
- GET /api/health

## Ambiente

Variaveis:

- DATABASE_URL=mysql://root:root_password@db:3306/inspectai
- AI_SERVICE_URL=http://ai:5000

## Desenvolvimento local

```bash
npm install
npm run dev
```

## Producao (container)

O container executa:

1. prisma migrate deploy
2. prisma seed
3. next start

## Contrato de resposta

Todas as rotas usam envelope padronizado com campos:

- success
- data
- meta
- error
