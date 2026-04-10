# Database Setup - InspectAI

## 🗄️ Configuração do Banco de Dados MySQL

Este documento descreve como configurar e manter o banco de dados do projeto InspectAI.

## Pré-requisitos

- **MySQL 8.0+** instalado e rodando
- **Node.js 18+** instalado
- **npm** ou **yarn**

## 📋 Tabelas Criadas

### 1. **usuarios**
Armazena informações de usuários do sistema (admins, funcionários, inspetores).
- `id`: Identificador único (CUID)
- `email`: Email único
- `nome`: Nome completo
- `papel`: admin | funcionario | inspetor
- `status`: ativo | inativo
- `criado`, `atualizado`: Timestamps

### 2. **placas**
Placas eletrônicas a serem inspecionadas.
- `id`: Identificador único (CUID)
- `codigo`: Código único (ex: `PCB-A001-L1`)
- `descricao`: Descrição da placa
- `localizacao`: Local de armazenamento
- `criado`, `atualizado`: Timestamps

### 3. **defeitos**
Defeitos encontrados em placas (rachadura, oxidação, solda-fria, etc).
- `id`: Identificador único (CUID)
- `codigoInterno`: Código único interno (ex: `#DEF-0001`)
- `placaId`: Referência à placa
- `tipo`: Tipo de defeito
- `componente`: Componente afetado
- `origem`: manual | automatico | importado
- `severidade`: baixa | media | alta | critica
- `status`: aberto | em-analise | resolvido | descartado
- `usuarioId`: Inspetor responsável
- `criado`, `atualizado`: Timestamps
- `resolvido`: Data de resolução (opcional)

### 4. **imagens_defeitos**
Imagens associadas aos defeitos.
- `id`: Identificador único (CUID)
- `defeitoId`: Referência ao defeito
- `url`: URL/caminho da imagem
- `tipo`: original | processada | anotada
- `metadados`: JSON com EXIF, coordenadas, etc

### 5. **inspecoes**
Registros de inspeções realizadas.
- `id`: Identificador único (CUID)
- `placaId`: Placa inspecionada
- `usuarioId`: Inspetor
- `tipo`: manual | automatizado | resumida
- `status`: em-progresso | concluida | cancelada
- `concluido`: Data de conclusão (opcional)

### 6. **relatorios**
Relatórios de inspeção e análise.
- `id`: Identificador único (CUID)
- `codigoInterno`: Código unico (ex: `REL-001`)
- `titulo`: Título do relatório
- `usuarioId`: Responsável
- `origem`: inspecao | analise-manual
- `status`: rascunho | finalizado | arquivado

### 7. **relatorios_defeitos**
Relação muitos-para-muitos entre relatórios e defeitos.

## 🚀 Instalação Rápida

### 1. Instalar dependências
```bash
cd backend
npm install @prisma/client @prisma/cli mysql2 dotenv
```

### 2. Configurar variáveis de ambiente
```bash
# Copiar arquivo de exemplo
cp .env.example .env

# Editar com suas credenciais MySQL
# DATABASE_URL="mysql://user:password@localhost:3306/inspectai"
```

### 3. Criar o banco de dados
```bash
# Opção A: Usar script SQL direto
mysql -u user -p < prisma/migrations/0001_initial_schema.sql

# Opção B: Usar Prisma
npx prisma db push
```

### 4. Popular dados iniciais (desenvolvimento)
```bash
npm run db:seed
```

## 📊 Comandos Úteis

```bash
# Executar migrations
npm run db:migrate

# Executar migrations em produção
npm run db:migrate:deploy

# Abrir Prisma Studio (GUI)
npm run db:studio

# Recriar banco de dados (Desenvolvimento)
npx prisma migrate reset

# Gerar tipos TypeScript (opcional)
npx prisma generate

# Ver status das migrations
npx prisma migrate status
```

## 🔌 Usar o Banco de Dados nas APIs

### Exemplo com Prisma Client

```javascript
// src/app/api/defeitos/route.js
import { NextResponse } from 'next/server';
import prisma from '@/lib/db';

export async function GET(request) {
  try {
    const defeitos = await prisma.defeito.findMany({
      include: {
        placa: true,
        usuario: true,
        imagens: true,
      },
    });

    return NextResponse.json({ status: 'sucesso', data: defeitos });
  } catch (error) {
    return NextResponse.json(
      { status: 'erro', mensagem: error.message },
      { status: 500 }
    );
  }
}
```

## 📝 Padrões de Nomenclatura

| Entidade | Padrão | Exemplo |
|----------|--------|---------|
| IDs | CUID | `cljf3xj2g0000qz0h0q0q0q0q` |
| Códigos Internos - Defeitos | `DEF-XXXX` | `DEF-0001` |
| Códigos Internos - Relatórios | `REL-XXX` | `REL-024` |
| Códigos de Placas | `PCB-AALLL-LX` | `PCB-A001-L1` |
| Roles | kebab-case | `admin`, `funcionario`, `inspetor` |
| Status | kebab-case | `aberto`, `em-analise`, `resolvido` |

## 🔐 Restrições de Integridade

- **Usuários** não podem ser deletados se tiverem relatórios ou inspeções (RESTRICT)
- **Placas** são deletadas em cascata com seus defeitos e inspeções
- **Defeitos** são deletados em cascata com suas imagens
- **Relatórios** são deletados em cascata com seus defeitos associados

## 🗑️ Fazer Reset Completo (Desenvolvimento)

```bash
# Apagar banco de dados (CUIDADO!)
mysql -u user -p -e "DROP DATABASE inspectai;"

# Recriar do zero
mysql -u user -p < prisma/migrations/0001_initial_schema.sql

# Repopular com dados de teste
npm run db:seed
```

## 📚 Documentação Oficial

- [Prisma Docs](https://www.prisma.io/docs/)
- [MySQL Connector](https://www.prisma.io/docs/orm/overview/databases/mysql)
- [Data Modeling](https://www.prisma.io/docs/orm/prisma-schema/data-model)

## 🚨 Troubleshooting

### Erro: "connect ECONNREFUSED 127.0.0.1:3306"
MySQL não está rodando. Inicie o MySQL:
```bash
# Windows (Command Prompt)
net start MySQL80

# Linux/Mac
brew services start mysql-server
# ou
sudo systemctl start mysql
```

### Erro: "Access denied for user"
Verifique credenciais em `.env`:
```bash
DATABASE_URL="mysql://user:password@localhost:3306/inspectai"
```

### Erro: "Unknown database 'inspectai'"
Execute o script SQL para criar o banco:
```bash
mysql -u user -p < prisma/migrations/0001_initial_schema.sql
```

## 👤 Responsável

- **Diogo Achiles Alves Paz** - Estrutura e setup inicial
