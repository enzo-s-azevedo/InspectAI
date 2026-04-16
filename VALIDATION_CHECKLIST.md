# Validation Checklist

## Backend

- [x] GET /api/health retorna success=true
- [x] GET /api/usuarios retorna lista
- [x] POST /api/usuarios cria usuario
- [x] GET /api/placas retorna lista
- [x] POST /api/defeitos cria defeito
- [x] GET /api/relatorios retorna lista
- [x] POST /api/detection persiste defeitos quando houver deteccoes

## Frontend

- [x] Dashboard mostra contadores reais
- [x] Tela Defeitos carrega tabela do backend
- [x] Tela Usuarios lista e cadastra usuario
- [x] Tela Relatorios lista dados reais
- [x] Tela Imagens envia upload para deteccao
- [x] Tela Configuracoes mostra health

## Docker

- [x] docker compose up --build sobe sem falhas
- [x] frontend responde em 3000
- [x] backend responde em 3001
- [x] ai responde em 5005/health
- [x] db responde em 3307
