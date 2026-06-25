# Checklist de Validação Manual de Requisitos

## Informações da Execução

- **Responsável pela Validação:** Enzo da Silva Azevedo


---

## 1. Autenticação e Controle de Acesso

- [X] Verificar login com perfil de Administrador.
- [X] Verificar login com perfil de Funcionário.
- [X] Verificar se o Funcionário não consegue acessar áreas restritas do sistema.
- [X] Verificar se o Administrador consegue acessar áreas restritas do sistema.

---

## 2. Gestão de Usuários

### Administrador

- [X] Verificar cadastro de Administrador.
- [X] Verificar consulta de Administrador.
- [X] Verificar edição de Administrador.
- [X] Verificar exclusão de Administrador.

### Funcionário

- [X] Verificar cadastro de Funcionário.
- [X] Verificar consulta de Funcionário.
- [X] Verificar edição de Funcionário.
- [X] Verificar exclusão de Funcionário.

---

## 3. Gestão de Modelos de Placas

- [X] Verificar cadastro de novo modelo de placa.
- [X] Verificar se o modelo cadastrado fica disponível para uso no sistema.

---

## 4. Processamento e Detecção de Defeitos

### Imagem Individual

- [X] Verificar se a detecção de defeitos é realizada corretamente para uma única imagem.
- [X] Verificar se os resultados são armazenados corretamente no banco de dados.

### Lote de Imagens

- [X] Verificar se a detecção de defeitos é realizada corretamente para um lote de imagens.
- [X] Verificar se os resultados do lote são armazenados corretamente no banco de dados.

### Persistência dos Dados

- [X] Verificar se os resultados não são enviados ao banco de dados quando a opção de salvamento não estiver habilitada.

---

## 5. Relatórios

### Imagem

- [X] Verificar a geração correta do relatório.

### Exportação

- [X] Verificar o download do relatório em formato PDF.

---

## 6. Banco de Dados de Defeitos

- [X] Verificar a exibição das informações registradas.
- [X] Verificar o funcionamento dos filtros de pesquisa.

---

# Conclusão

## Resultado Geral

- [X] Todos os requisitos foram aprovados.
- [X] Existiam requisitos que necessitavam de correção e nova validação.

## Observações

- Não havia nenhuma funcionalidade que permitisse classificar uma detecção como falso positivo. Essa limitação foi corrigida por meio da implementação de um botão que permite marcar uma detecção como falso positivo após a análise dos defeitos identificados. Adicionalmente, passou a ser possível alterar posteriormente a confirmação de um defeito diretamente no banco de defeitos.

- O sistema não possuía operações completas de gerenciamento para os modelos cadastrados, permitindo apenas sua criação. Não era possível editar ou excluir modelos existentes. Essa funcionalidade foi implementada, incluindo operações de edição e exclusão. Também foi adicionada uma validação que impede a remoção de modelos que já possuam registros de defeitos associados no banco de dados, garantindo a integridade das informações armazenadas.
