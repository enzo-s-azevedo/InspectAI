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

### 2. **modelo**
Modelos de placas usados como referência.
- `codigo`: Código único do modelo e chave primária
- `descricao`: Descrição do modelo
- `criado`, `atualizado`: Timestamps

### 3. **placas**
Placas eletrônicas a serem inspecionadas.
- `id`: Identificador único numérico
- `codigo`: Código único (ex: `PCB-A001-L1`)
- `modelo`: Código do modelo vinculado
- `nome_classe`: Classe/nome da placa usado pela aplicação
- `descricao`: Descrição da placa
- `localizacao`: Local de armazenamento
- `criado`, `atualizado`: Timestamps

### 4. **defeitos**
Defeitos encontrados em placas (rachadura, oxidação, solda-fria, etc).
- `id`: Identificador único numérico
- `id_placa`: Referência à placa
- `classe_defeito`: Classe do defeito detectado
- `nome_arquivo_origem`: Arquivo/imagem de origem da detecção
- `componente`: Componente afetado
- `origem`: manual | automatico | importado
- `confirmado`: verdadeiro por padrão; falso quando marcado como falso positivo
- `usuarioId`: Inspetor responsável
- `criado`, `atualizado`: Timestamps
- `resolvido`: Data de resolução (opcional)

### 5. **imagens_defeitos**
Imagens associadas aos defeitos.
- `id`: Identificador único (CUID)
- `defeitoId`: Referência ao defeito
- `url`: URL/caminho da imagem
- `tipo`: original | processada | anotada
- `metadados`: JSON com EXIF, coordenadas, etc

### 6. **defeitos_video**
Complemento para defeitos detectados em vídeo.
- `id`: Identificador único numérico
- `defeito_id`: Referência ao defeito
- `datahora`: Data/hora do evento no vídeo
- `frame`: Frame do vídeo, quando disponível
- `criado`, `atualizado`: Timestamps

### 7. **inspecoes**
Registros de inspeções realizadas.
- `id`: Identificador único (CUID)
- `placaId`: Placa inspecionada
- `usuarioId`: Inspetor
- `tipo`: manual | automatizado | resumida
- `status`: em-progresso | concluida | cancelada
- `concluido`: Data de conclusão (opcional)

### 8. **relatorios**
Relatórios de inspeção e análise.
- `id`: Identificador único (CUID)
- `codigoInterno`: Código unico (ex: `REL-001`)
- `titulo`: Título do relatório
- `usuarioId`: Responsável
- `origem`: inspecao | analise-manual
- `status`: rascunho | finalizado | arquivado

### 9. **relatorios_defeitos**
Relação muitos-para-muitos entre relatórios e defeitos.

## 🚀 Instalação Rápida

### 1. Instalar dependências
```bash
cd backend
npm install
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
npm run db:push
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
npm run db:reset:push

# Gerar tipos TypeScript (opcional)
npx prisma generate

# Ver status das migrations
npx prisma migrate status
```

## 🔌 Usar o Banco de Dados nas APIs

### Exemplo com Prisma Client

```javascript
// src/app/api/defeitos/route.js
import prisma from '@/lib/db';
import { fail, ok } from '@/lib/http';
import { serializeDefeito } from '@/lib/serializers';

export async function GET(request) {
  try {
    const defeitos = await prisma.defeito.findMany({
      include: {
        placa: true,
        usuario: true,
        imagens: true,
      },
    });

    return ok(defeitos.map(serializeDefeito), { total: defeitos.length });
  } catch (error) {
    return fail(error.message);
  }
}
```

## 📝 Padrões de Nomenclatura

| Entidade | Padrão | Exemplo |
|----------|--------|---------|
| IDs numéricos | auto-incremento | `1` |
| IDs textuais | CUID | `cljf3xj2g0000qz0h0q0q0q0q` |
| Códigos Internos - Relatórios | `REL-XXX` | `REL-024` |
| Códigos de Placas | `PCB-AALLL-LX` | `PCB-A001-L1` |
| Roles | kebab-case | `admin`, `funcionario`, `inspetor` |
| Status de relatórios/inspeções | kebab-case | `rascunho`, `finalizado`, `em-progresso` |

## 🔐 Restrições de Integridade

- **Usuários** não podem ser deletados se tiverem relatórios ou inspeções (RESTRICT)
- **Placas** são deletadas em cascata com seus defeitos e inspeções
- **Defeitos** são deletados em cascata com suas imagens e registros de vídeo
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
