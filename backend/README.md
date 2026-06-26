# InspectAI Backend

Backend Next.js com Prisma e PostgreSQL usando o schema oficial:

`usuario -> relatorio -> relatorio_imagem`
`modelo -> placa -> defeito -> relatorio_defeito -> relatorio`

## Startup em Docker

```bash
npm run db:migrate:deploy
npm run start
```

O container executa essa sequência automaticamente via `backend/Dockerfile`.

## Prisma

```bash
npx prisma validate
npx prisma generate
npm run db:migrate:deploy
```

O fluxo oficial de banco é exclusivamente por migration.

O endpoint `/api/detection` realiza apenas a analise temporaria. A persistencia de placa, relatorio e defeitos acontece em `/api/detection/save`, somente depois de confirmacao explicita na interface. O endpoint `/api/detection/batch` cria o relatorio no inicio do lote e associa todas as imagens processadas a ele.
