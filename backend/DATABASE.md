# Database

Schema oficial:

```text
modelo.codigo
  -> placa.modelo_codigo
      -> defeito.placa_id
      -> relatorio.placa_id
usuario.id
  -> relatorio.id_usuario_criador
  -> relatorio.id_usuario_ultimo_acesso
```

## Tabelas

### `modelo`

- `codigo VARCHAR(100) PRIMARY KEY`

### `placa`

- `id SERIAL PRIMARY KEY`
- `modelo_codigo VARCHAR(100) NOT NULL`

### `defeito`

- `id SERIAL PRIMARY KEY`
- `classe_defeito VARCHAR(255) NULL`
- `status_confirmacao VARCHAR(50) NOT NULL DEFAULT 'confirmado'`
- `classificacao VARCHAR(50) NOT NULL DEFAULT 'real'`
- `tipo VARCHAR(50) NOT NULL DEFAULT 'imagem'`
- `data_hora TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP`
- `placa_id INTEGER NOT NULL`

### `usuario`

- `id SERIAL PRIMARY KEY`
- `nome VARCHAR(100) NOT NULL`
- `email VARCHAR(150) UNIQUE NOT NULL`
- `senha_hash VARCHAR(255) NOT NULL`
- `cargo VARCHAR(32) NOT NULL`
- `criado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP`

### `relatorio`

- `id SERIAL PRIMARY KEY`
- `placa_id INTEGER NOT NULL`
- `id_usuario_criador INTEGER NOT NULL`
- `id_usuario_ultimo_acesso INTEGER NULL`
- `criado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP`
- `atualizado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP`

#### Regras de Rastreabilidade (Issue #28)

1. **`id_usuario_criador`**:
   - Identifica o usuário (operador) que executou o lote ou salvou a detecção.
   - Deve ser preenchido **automaticamente** no momento da criação.
   - **Nunca** deve ser alterado em operações subsequentes (imutabilidade).
2. **`id_usuario_ultimo_acesso`**:
   - Registra o ID do último administrador que realizou modificações manuais no relatório.
   - Pode ser `NULL` se o relatório nunca foi editado após a criação.
   - Deve ser atualizado automaticamente em qualquer `UPDATE` via API administrativa.
3. **Remoção de Campos Legados**:
   - Os campos `usuario_id` e `status` foram removidos desta tabela para evitar redundância e centralizar a rastreabilidade nos novos campos de FK.


Relacionamentos:

- `relatorio.placa_id -> placa.id`
- `relatorio.id_usuario_criador -> usuario.id`
- `relatorio.id_usuario_ultimo_acesso -> usuario.id`

### `relatorio_defeito`

- `id SERIAL PRIMARY KEY`
- `relatorio_id INTEGER NOT NULL`
- `defeito_id INTEGER NOT NULL`
- `status_validacao VARCHAR(50) NOT NULL DEFAULT 'pendente'`
- `observacao TEXT NULL`
- `criado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP`

### `relatorio_imagem`

- `id SERIAL PRIMARY KEY`
- `relatorio_id INTEGER NOT NULL`
- `caminho_imagem VARCHAR(255) NOT NULL`
- `tipo VARCHAR(30) NOT NULL DEFAULT 'original'`
- `criado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP`
