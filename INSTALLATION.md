# Guia de Instalação e Configuração Local - InspectAI

Este guia detalha o processo passo a passo para configurar, instalar e executar a aplicação InspectAI em um ambiente local de desenvolvimento.

---

## Requisitos Prévios

Antes de começar, certifique-se de ter instalado em sua máquina:
1. **Node.js** (versão 18 ou superior).
2. **Docker** e **Docker Compose** (recomendado para simplificar a execução).
3. **Git** (para controle de versão e clone).
4. **Python 3.10+** (se optar por executar o serviço de IA localmente fora do Docker).

---

## 1. Clonando o Repositório

Clone o repositório oficial em sua máquina de desenvolvimento:

```bash
git clone https://github.com/enzo-s-azevedo/InspectAI.git
cd InspectAI
```

---

## 2. Configurando as Variáveis de Ambiente

Crie um arquivo `.env` na raiz do projeto (copiando do `.env.example`):

```bash
cp .env.example .env
```

Abra o arquivo `.env` e preencha as variáveis de ambiente necessárias:
- **`DATABASE_URL`**: A string de conexão oficial com o PostgreSQL no Neon Serverless (SSL obrigatório).
  - Exemplo: `DATABASE_URL="postgresql://user:password@host.neon.tech/dbname?sslmode=require"`
- **`JWT_SECRET`**: Uma chave secreta segura para criptografia de tokens JWT.
  - Exemplo: `JWT_SECRET="alguma_chave_secreta_e_segura_aqui"`

---

## 3. Instalação e Inicialização via Docker Compose (Recomendado)

O Docker Compose sobe automaticamente os três serviços configurados (`ai`, `backend`, `frontend`) e configura as portas e links internos.

Suba as imagens e os containers:

```bash
docker compose up --build
```

Ao rodar esse comando, ocorrerá o seguinte:
- O **Serviço de IA** subirá na porta `5005` (mapeada para a porta interna Flask `5000`).
- O **Backend** executará as migrações do Prisma (`prisma migrate deploy`) e subirá na porta `3001` (porta interna `3000`).
- O **Frontend** subirá na porta `3000`.

---

## 4. Inicialização Manual em Modo de Desenvolvimento (Sem Docker)

Se preferir rodar os serviços localmente no seu host nativo para depuração rápida:

### Passo A: Banco de Dados (Prisma)
1. Instale as dependências no diretório do backend:
   ```bash
   cd backend
   npm install
   ```
2. Sincronize o schema Prisma com o banco de dados oficial (Neon):
   ```bash
   npx prisma generate
   npm run db:migrate:deploy
   ```

### Passo B: Inicializar o Backend
Execute o servidor de desenvolvimento do Next.js para o backend:
```bash
npm run dev
# O backend escutará na porta 3000 por padrão.
```

### Passo C: Inicializar o Frontend
1. Abra um novo terminal, vá para a raiz do repositório e instale as dependências:
   ```bash
   npm install
   ```
2. Inicialize o servidor de desenvolvimento do frontend:
   ```bash
   npm run dev
   # O frontend Next.js escutará na porta 3001 por padrão devido à colisão de portas.
   ```

### Passo D: Inicializar o Serviço de IA YOLO
1. Certifique-se de que os pesos oficiais `best.pt` estão na pasta `yolo/INTERFACE/`.
2. Acesse a pasta do serviço de IA:
   ```bash
   cd yolo/INTERFACE
   ```
3. Crie um ambiente virtual Python e instale as dependências:
   ```bash
   python -m venv venv
   source venv/bin/activate  # No Windows use: venv\Scripts\activate
   pip install Flask ultralytics opencv-python
   ```
4. Execute o serviço Flask:
   ```bash
   python inference_service.py
   # O serviço de IA escutará na porta 5000 por padrão.
   ```

---

## 5. Validação e Execução de Testes

Para garantir que o ambiente foi configurado corretamente, execute os scripts de teste:

- **Testes Unitários e Integração (Frontend)**:
  ```bash
  npm test
  ```
- **Testes Unitários e Integração (Backend)**:
  ```bash
  cd backend && npm test
  ```
- **Testes de Integração de Fluxo de Dados (Docker)**:
  ```bash
  docker compose --profile test run --rm integration-tests
  ```
- **Testes de Ponta a Ponta (Playwright E2E)**:
  ```bash
  npx playwright test
  ```
