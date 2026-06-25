# Final Structure

```text
InspectAI/
  .agents/                 # Customizações e Skills dos agentes (Neon Postgres, etc.)
  app/                     # Frontend Next.js Pages e API interna
    acesso-negado/
      page.js              # Página de acesso negado (RBAC)
    api/
      defect-classes/
        route.js           # Rota para obter classes de defeitos do data.yaml da IA
    configuracoes/
      page.js              # Página de configurações do sistema (cadastro de modelos)
    defeitos/
      page.js              # Página de consulta ao banco de defeitos com filtros
    imagens/
      page.js              # Tela principal para detecção (individual e lote)
    login/
      page.js              # Tela de autenticação de usuários
    relatorios/
      page.js              # Tela de listagem e visualização de relatórios gerados
    usuarios/
      page.js              # Tela administrativa de gestão de usuários (CRUD)
    favicon.ico
    globals.css
    layout.js
    page.js
  backend/                 # Backend Next.js API
    prisma/
      schema.prisma        # Definição do schema relacional do Prisma ORM
      migrations/          # Migrações oficiais do banco de dados (Neon PostgreSQL)
        0001_init/
        0002_add_defeito_classificacao/
    src/
      app/
        api/
          auth/
            login/
              route.js     # Endpoint de login com geração de JWT
          defeitos/
            route.js       # Endpoints para consulta e atualização de status de defeito
          detection/
            batch/
              route.js     # Endpoint para análise em lote de imagens
            save/
              route.js     # Endpoint para persistir detecções aprovadas
            route.js       # Endpoint para análise temporária individual
          health/
            route.js       # Endpoint de verificação de integridade do sistema
          modelos/
            route.js       # CRUD de modelos de placas
          placas/
            [id]/
              route.js     # Consulta, edição e deleção de placa individual
            route.js       # Listagem e criação de placas
          relatorios/
            [id]/
              pdf/
                route.js   # Geração e exportação do PDF do relatório
              route.js     # Consulta e edição de metadados do relatório
            route.js       # Listagem de relatórios
          swagger/
            route.js       # Rota que serve o Swagger UI
          usuarios/
            [id]/
              route.js     # Consulta, edição e exclusão de usuário
            route.js       # Listagem e criação de usuários
        api-docs/
          page.jsx         # Página visual da documentação das APIs via Swagger UI
        favicon.ico
        globals.css
        layout.js
        page.js
      lib/
        auth.js            # Funções de hashing de senha e manipulação de token JWT
        db.js              # Instanciação do Prisma Client
        detection.js       # Integração e chamadas HTTP ao serviço YOLO AI
        http.js            # Helpers para respostas HTTP envelopadas padrão
        permissions.js     # Validador de cargo e RBAC das rotas
        serializers.js     # Formatadores de respostas JSON
        upload.js          # Utilitários para decodificação multipart/form-data
      middleware.js        # Middleware de proteção das rotas de API do backend
  components/              # Componentes reutilizáveis do frontend
    AppShell.js            # Layout padrão com barra de navegação e controle de perfil
    Badge.js               # Componente de indicador visual de status/cargo
  lib/                     # Utilitários do frontend
    permissions.js         # Verificação de cargos e permissões no frontend
  services/                # Integração de chamadas à API do backend no frontend
    api.js                 # Cliente HTTP unificado da API
  yolo/                    # Módulo do modelo YOLO
    INTERFACE/             # Headless AI inference service via Flask
      best.pt              # Pesos treinados oficiais do YOLO
      data.yaml            # Mapeamento de classes de defeitos detectáveis
      Dockerfile
      inference_service.py # API Flask de inferência (/predict, /predict-video, /health)
      README.md
    TREINO/                # Notebooks e scripts de suporte ao treinamento
      Copy_of_Train_YOLO_Models.ipynb
      data.yaml
      data.zip
      README.md
      train.py
      train_val_split.py
  scripts/                 # Scripts utilitários de validação e testes
    run-integration-tests.js
    test-classes.js
  tests/                   # Suite de testes
    backend/               # Testes de integração, middleware e APIs do backend
    frontend/              # Testes unitários e de renderização do frontend
  e2e/                     # Testes de ponta a ponta (E2E) com Playwright
```
