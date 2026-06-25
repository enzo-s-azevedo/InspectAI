# Manual do Usuário - InspectAI

Este manual de uso descreve de forma prática todas as funcionalidades disponíveis na interface do InspectAI, orientando operadores e administradores na realização de suas atividades diárias.

---

## 1. Login e Perfis de Acesso

O acesso ao InspectAI exige autenticação. Acesse a tela de login na raiz da aplicação.

### Perfis de Usuário:
1. **Administrador (`ADMINISTRADOR`)**:
   - Perfil de gestão completo.
   - Acesso exclusivo ao gerenciamento de usuários (criar, ler, editar e excluir funcionários).
   - Capacidade de criar, atualizar e excluir modelos de placas.
   - Permissão para alterar metadados administrativos e vincular outras placas a relatórios na tela de edição de relatórios.
   - Exportação de dados do banco de defeitos (CSV).
2. **Funcionário (`FUNCIONARIO`)**:
   - Perfil essencialmente operacional.
   - Executa detecções de imagem individual e em lote.
   - Consulta o Banco de Defeitos e filtra os registros.
   - Visualiza e realiza o download de Relatórios em PDF.
   - Não possui permissão para gerenciar usuários, cadastrar/deletar modelos ou alterar dados imutáveis de relatórios (como o operador criador do relatório).

---

## 2. Processamento e Detecção de Defeitos

A tela principal do sistema (**Imagens / Inspeção**) é onde ocorre o processamento de imagens de placas para detecção de falhas de montagem.

### Detecção Individual:
1. Navegue até a tela **Imagens**.
2. Selecione o **Modelo de Placa** correspondente no menu de seleção.
3. Carregue um arquivo de imagem (`.jpg`, `.png`).
4. Clique em **Detectar**. O sistema enviará o arquivo ao serviço de inteligência artificial.
5. As bounding boxes das falhas detectadas serão exibidas diretamente sobrepostas à placa eletrônica na tela.
6. A tabela mostrará as classes de defeitos (ex: `solda-fria`, `componente-faltante`).
7. **Opção de Salvar**: Se você marcar a opção de persistência no banco de dados e clicar em **Salvar**, as detecções serão salvas definitivamente. Uma nova placa será gerada e um novo relatório de inspeção será registrado e vinculado ao seu usuário criador.

### Detecção em Lote (Batch):
1. Na mesma tela de Inspeção, selecione a aba ou opção de **Lote de Imagens**.
2. Selecione o modelo correspondente.
3. Arraste ou selecione múltiplos arquivos de imagem ao mesmo tempo (ou uma pasta).
4. O sistema cria um relatório de lote unificado vinculando todas as imagens.
5. O processamento ocorre sequencialmente e exibe um resumo estatístico das detecções nas placas do lote.
6. Assim como na detecção individual, a persistência no banco neon ocorre ao clicar em **Salvar**.

---

## 3. Banco de Defeitos (Filtros e Feedback)

O banco de defeitos lista todas as anomalias históricas persistidas no banco PostgreSQL.

### Filtros Disponíveis:
- **Busca Rápida**: Digite no campo de texto para filtrar registros por ID do defeito, ID da placa ou código do modelo.
- **Filtro por Classe**: Clique nos botões categorizados na barra superior (ex: `Todos`, `curto`, `componente_invertido`) para focar apenas nas falhas correspondentes.

### Feedback e Falso Positivo:
Se a inteligência artificial marcar uma área normal da placa como defeito, o operador pode corrigir o registro:
1. Localize o defeito correspondente na tabela da tela **Defeitos**.
2. Clique no seletor da coluna **Confirmação** da linha do defeito.
3. Mude o valor de **Confirmado** para **Falso Positivo**.
4. O status de classificação do defeito será atualizado automaticamente em segundo plano no banco de dados, recalculando os relatórios.

---

## 4. Consulta e Exportação de Relatórios (PDF)

Navegue até a tela **Relatórios** para consultar e exportar análises consolidadas de inspeções anteriores.

### Ações em Relatórios:
- **Listagem Geral**: Veja todos os relatórios gerados por ID, placa associada, criador original e data de atualização.
- **Visualização de Detalhes**: Clique em um relatório para ver as imagens e a lista consolidada de defeitos que o compõem.
- **Exportação para PDF**:
  1. Na listagem ou na visualização detalhada, clique em **Exportar PDF**.
  2. Um documento PDF completo será gerado pelo backend contendo o cabeçalho oficial do InspectAI, rastreabilidade de quem realizou a inspeção, data/hora e o sumário de defeitos encontrados.
- **Edição Administrativa (Somente Administradores)**:
  1. Permite modificar a placa à qual o relatório pertence.
  2. Ao efetuar a atualização, o backend atualiza automaticamente o campo `id_usuario_ultimo_acesso` para o ID do administrador logado, preservando o `id_usuario_criador` original.

---

## 5. Cadastro de Modelos de Placas (Configurações)

A tela **Configurações** gerencia as assinaturas de placas suportadas pelo sistema.

1. Acesse **Configurações**.
2. **Adicionar Modelo**: Insira o código identificador único da placa (ex: `PCB-A001`) e clique em cadastrar. Ele estará imediatamente disponível no seletor da tela de detecção.
3. **Deleção / Edição**:
   - Um modelo só pode ser editado ou excluído se não tiver histórico de inspeções ou defeitos associados.
   - Caso tente remover um modelo com registros vinculados, o sistema emitirá um erro de integridade de banco de dados para evitar perda de dados históricos.
