# InspectAI

Sistema minimalista para inspeção de placas eletrônicas com frontend Next.js, backend Next.js/API, PostgreSQL Neon, Prisma ORM e serviço YOLO.

## Banco Oficial

O banco em nuvem é o Neon, configurado pela variável `DATABASE_URL`.

Para sincronizar o schema:

```bash
cd backend
npm run db:push
```

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
- `POST /api/detection/save`
- `GET /api/swagger`

## Validação

```bash
npm run build
cd backend && npm run build
```
