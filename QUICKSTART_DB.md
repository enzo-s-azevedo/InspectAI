# Setup Rápido - Database MySQL + Prisma

## ⚡ 5 Passos para Rodar o Banco de Dados

### Pré-requisitos
- ✅ MySQL 8.0+ rodando na máquina
- ✅ Node.js 18+ instalado
- ✅ npm instalado

### Passo 1: Criar arquivo `.env`
```bash
cd backend
cp .env.example .env
```

Editar `.env` com suas credenciais MySQL:
```
DATABASE_URL="mysql://root:sua_senha@localhost:3306/inspectai"
```

### Passo 2: Instalar dependências
```bash
npm install
```

### Passo 3: Criar banco de dados e tabelas

**Opção A - Usando SQL direto (recomendado para primeira vez):**
```bash
mysql -u root -p < prisma/migrations/0001_initial_schema.sql
```

**Opção B - Usando Prisma:**
```bash
npx prisma db push
```

### Passo 4: Popular banco com dados iniciais (opcional)
```bash
npm run db:seed
```

### Passo 5: Abrir Prisma Studio (opcional, para explorar dados)
```bash
npm run db:studio
```

---

## 📊 O que foi criado?

✅ **Tabelas:**
- `usuarios` - Admin, funcionários, inspetores
- `placas` - PCBs a inspecionar  
- `defeitos` - Problemas encontrados
- `imagens_defeitos` - Fotos dos defeitos
- `inspecoes` - Registros de inspeção
- `relatorios` - Relatórios de análise
- `relatorios_defeitos` - Vinculação muitos-para-muitos

✅ **APIs prontas:**
- `/api/defeitos` - GET/POST defeitos
- `/api/placas` - GET/POST placas
- `/api/usuarios` - GET/POST usuários

✅ **Dados iniciais:**
- Usuário Admin
- 3 Placas de exemplo
- 2 Defeitos de exemplo
- 1 Relatório de exemplo

---

## 🔧 Comandos Úteis

```bash
# Ver status do banco
npx prisma db execute --stdin < prisma/migrations/0001_initial_schema.sql

# Abrir GUI para explorar dados
npm run db:studio

# Executar migrações pendentes
npm run db:migrate

# Apagar e recriar (CUIDADO!)
npx prisma migrate reset

# Gerar tipos TypeScript (opcional)
npx prisma generate
```

---

## 🚨 Troubleshooting

### "Connection refused"
MySQL não está rodando:
```bash
# Windows
net start MySQL80

# Linux
sudo systemctl start mysql

# Mac
brew services start mysql-server
```

### "Access denied for user 'root'"
Editar `.env` com senha correta

### "Unknown database 'inspectai'"
Executar:
```bash
mysql -u root -p < prisma/migrations/0001_initial_schema.sql
```

---

## 📚 Próximos Passos

1. Alterar credenciais padrão no seed.js
2. Definir autenticação de usuários
3. Integrar YOLO com `/api/detection`
4. Criar migrations para novos campos

---

**Responsável:** Diogo Achiles Alves Paz  
**Data:** Abril 2026
