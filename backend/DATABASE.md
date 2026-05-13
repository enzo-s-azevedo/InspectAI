# Database

Schema oficial:

```text
modelo.codigo
  -> placa.modelo_codigo
      -> defeito.placa_id
```

## Tabelas

### `modelo`

- `codigo VARCHAR(100) PRIMARY KEY`

### `placa`

- `id INT AUTO_INCREMENT PRIMARY KEY`
- `modelo_codigo VARCHAR(100) NOT NULL`

### `defeito`

- `id INT AUTO_INCREMENT PRIMARY KEY`
- `classe_defeito VARCHAR(255) NULL`
- `status_confirmacao VARCHAR(50) NOT NULL DEFAULT 'confirmado'`
- `tipo VARCHAR(50) NOT NULL DEFAULT 'imagem'`
- `data_hora TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP`
- `placa_id INT NOT NULL`
