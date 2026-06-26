# InspectAI

InspectAI é uma plataforma web moderna e robusta para inspeção visual automatizada de placas de circuito impresso (PCBs) utilizando inteligência artificial (YOLOv8) para identificação e classificação de falhas de montagem e soldagem.

---

## 🚀 Arquitetura e Componentes

O projeto é dividido em três serviços principais orquestrados via Docker Compose:

1. **Frontend (Next.js)**: Painel do operador e administração com autenticação, dashboards analíticos, tabelas de controle de acesso (RBAC), tela de detecção individual/lote e download de relatórios.
2. **Backend (Next.js API)**: API robusta com Prisma ORM, segurança de rotas com JWT e geração dinâmica de relatórios em PDF.
3. **Serviço de IA (YOLO Flask)**: Microsserviço responsável pela inferência direta das imagens utilizando o modelo YOLOv8 (`best.pt`).

Consulte [ARCHITECTURE.md](file:///c:/Users/Diogo/Desktop/PI/InspectAI/ARCHITECTURE.md) para detalhes detalhados da arquitetura.

---

## 🛠️ Instalação e Execução Rápida (Docker)

Certifique-se de preencher a variável `DATABASE_URL` no arquivo `.env` (baseado em `.env.example`). Em seguida, execute:

```bash
docker compose up --build
```

Para detalhes adicionais de setup ou execução nativa passo a passo, veja [INSTALLATION.md](file:///c:/Users/Diogo/Desktop/PI/InspectAI/INSTALLATION.md).

---

## 📂 Organização do Projeto

### 2. Banco de Dados de Defeitos

Para detalhes de regras de integridade relacional, regras de rastreabilidade (imutabilidade do criador vs histórico do editor administrador), veja [DATABASE.md](file:///c:/Users/Diogo/Desktop/PI/InspectAI/backend/DATABASE.md).

---

## 🔌 Contrato de APIs

### 3. Controle de Usuários

---

## 📘 Manual do Usuário

Instruções operacionais sobre como logar, cadastrar novos modelos, efetuar inspeções individuais e em lote, classificar falsos positivos e gerar relatórios estão disponíveis em [USER_MANUAL.md](file:///c:/Users/Diogo/Desktop/PI/InspectAI/USER_MANUAL.md).

---

## 🧪 Execução de Testes

### 4. Geração de Relatórios

### Testes do Frontend:
```bash
cmd.exe /c npm test
```

### Testes do Backend:
```bash
cmd.exe /c npm --prefix backend test
```

### Testes de Integração Ponta a Ponta (E2E Playwright):
```bash
cmd.exe /c npx playwright test
```
