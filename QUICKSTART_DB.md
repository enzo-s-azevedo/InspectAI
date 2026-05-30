# Quickstart DB

Suba o projeto:

```bash
docker compose up --build
```

O banco PostgreSQL em nuvem é configurado via Neon pela variável `DATABASE_URL`.

`backend/prisma/migrations/0001_init/migration.sql`

Validar endpoints:

```bash
curl http://localhost:3001/api/health
curl http://localhost:3001/api/modelos
curl http://localhost:3001/api/placas
curl http://localhost:3001/api/defeitos
```
