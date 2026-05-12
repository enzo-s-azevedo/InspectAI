# Validation Checklist

- [ ] `docker compose up --build` sobe MySQL, IA, backend e frontend.
- [ ] Backend executa `prisma migrate deploy`.
- [ ] Existe somente `backend/prisma/migrations/0003_minimal_schema/migration.sql`.
- [ ] Tabelas criadas: `modelo`, `placa`, `defeito`.
- [ ] Fluxo `modelo -> placa -> defeito` persiste com foreign keys válidas.
- [ ] `GET /api/health` retorna banco `ok`.
- [ ] `POST /api/modelos` cria modelo.
- [ ] `POST /api/placas` cria placa vinculada ao modelo.
- [ ] `POST /api/defeitos` cria defeito vinculado à placa.
- [ ] `POST /api/defeitos` com `tipo = imagem` salva `data_hora` como `null`.
- [ ] `POST /api/defeitos` com `tipo = video` deixa o MySQL preencher `data_hora`.
- [ ] `PUT /api/defeitos` atualiza `status_confirmacao`.
- [ ] Startup do backend usa apenas `prisma migrate deploy`.
