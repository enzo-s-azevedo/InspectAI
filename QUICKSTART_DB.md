# Quickstart DB

Suba o projeto:

```bash
docker compose up --build
```

O banco MySQL é criado a partir da migration oficial:

`backend/prisma/migrations/0003_minimal_schema/migration.sql`

Validar endpoints:

```bash
curl http://localhost:3001/api/health
curl http://localhost:3001/api/modelos
curl http://localhost:3001/api/placas
curl http://localhost:3001/api/defeitos
```
