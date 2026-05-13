ALTER TABLE defeito
  ADD COLUMN status_confirmacao VARCHAR(50) NOT NULL DEFAULT 'confirmado' AFTER classe_defeito,
  ADD COLUMN tipo VARCHAR(50) NOT NULL DEFAULT 'imagem' AFTER status_confirmacao,
  ADD COLUMN data_hora TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP AFTER tipo;

CREATE INDEX idx_defeito_status_confirmacao ON defeito (status_confirmacao);
CREATE INDEX idx_defeito_tipo ON defeito (tipo);
