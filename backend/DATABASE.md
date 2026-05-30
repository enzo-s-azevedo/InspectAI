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

`id_usuario_criador` identifica o usuario que executou o lote e deve ser preenchido automaticamente na criacao do relatorio. Esse campo nao deve ser alterado em atualizacoes. `id_usuario_ultimo_acesso` registra o ultimo administrador que modificou o relatorio.

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
