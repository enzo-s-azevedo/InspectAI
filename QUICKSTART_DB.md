# Quickstart DB and API

## 1. Subir stack completa

```bash
docker compose up --build
```

## 2. Validar saude dos servicos

```bash
curl http://localhost:3001/api/health
```

## 3. Consultar dados iniciais

```bash
curl http://localhost:3001/api/usuarios
curl http://localhost:3001/api/placas
curl http://localhost:3001/api/defeitos
curl http://localhost:3001/api/relatorios
```

## 4. Enviar uma deteccao por imagem

```bash
curl -X POST http://localhost:3001/api/detection \
  -F "placaCodigo=PCB-TESTE-001" \
  -F "image=@/caminho/para/imagem.jpg"
```

## 5. Banco MySQL

- Host: localhost
- Porta: 3307
- Database: inspectai
- Usuario: root
- Senha: root_password

## 6. Mudancas destrutivas de schema

Esta versao altera chaves e relacoes de `placas` e `defeitos`, entao volumes MySQL antigos podem impedir o `prisma db push` de subir o backend.

Em ambiente local, se nao houver dados importantes, recrie o banco:

```bash
docker compose down -v
docker compose up --build
```

Se precisar forcar o Prisma manualmente sabendo que pode perder dados:

```bash
cd backend
npm run db:push:force
```

Se o Prisma avisar que precisa recriar o banco inteiro:

```bash
cd backend
npm run db:reset:push
npm run db:seed
```

## Notas

- A migracao Prisma eh aplicada automaticamente no startup do backend.
- O seed eh idempotente e pode rodar mais de uma vez sem duplicar registros base.
