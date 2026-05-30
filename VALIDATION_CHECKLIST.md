# Validation Checklist

- [ ] `docker compose up --build` sobe IA, backend e frontend usando PostgreSQL Neon.
- [ ] Backend executa `prisma migrate deploy`.
- [ ] Existe somente `backend/prisma/migrations/0001_init/migration.sql`.
- [ ] Tabelas criadas: `modelo`, `placa`, `defeito`, `usuario`, `relatorio`, `relatorio_defeito`, `relatorio_imagem`.
- [ ] Fluxo de relatorios persiste com foreign keys válidas.
- [ ] `GET /api/health` retorna banco `ok`.
- [ ] `POST /api/modelos` cria modelo.
- [ ] `POST /api/placas` cria placa vinculada ao modelo.
- [ ] `POST /api/defeitos` cria defeito vinculado à placa.
- [ ] `POST /api/defeitos` com `tipo = imagem` salva `data_hora` como `null`.
- [ ] `POST /api/defeitos` com `tipo = video` deixa o PostgreSQL preencher `data_hora`.
- [ ] `PUT /api/defeitos` atualiza `status_confirmacao`.
- [ ] `POST /api/detection/batch` cria relatorio, vincula usuario, imagens e defeitos.
- [ ] Startup do backend usa apenas `prisma migrate deploy`.
