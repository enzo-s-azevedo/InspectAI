# InspectAI Backend

Backend Next.js com Prisma e MySQL usando apenas o schema oficial:

`modelo -> placa -> defeito`

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
