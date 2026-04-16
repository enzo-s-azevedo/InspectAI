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

## Notas

- A migracao Prisma eh aplicada automaticamente no startup do backend.
- O seed eh idempotente e pode rodar mais de uma vez sem duplicar registros base.
