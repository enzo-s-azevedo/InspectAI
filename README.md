# InspectAI

Sistema minimalista para inspeção de placas eletrônicas com frontend Next.js, backend Next.js/API, MySQL, Prisma ORM e serviço YOLO.

## Banco Oficial

O banco é criado exclusivamente pela migration:

`backend/prisma/migrations/0003_minimal_schema/migration.sql`

Modelo relacional:

`modelo -> placa -> defeito`

Tabelas oficiais:

- `modelo`
- `placa`
- `defeito`

## Execução

```bash
docker compose up --build
```

O backend executa `prisma migrate deploy` no startup.

## Endpoints

- `GET /api/health`
- `GET, POST /api/modelos`
- `GET, POST /api/placas`
- `GET, PUT, DELETE /api/placas/:id`
- `GET, POST /api/defeitos`
- `PUT /api/defeitos`
- `GET, POST /api/detection`
- `GET /api/swagger`

## Validação

```bash
npm run build
cd backend && npm run build
```
