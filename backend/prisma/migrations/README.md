-- prisma/migrations/0002_add_audit_logs.sql.example
-- Exemplo de adição de tabela de auditoria para versões futuras

CREATE TABLE IF NOT EXISTS audit_logs (
  id VARCHAR(255) PRIMARY KEY,
  tabela VARCHAR(100) NOT NULL,
  registro_id VARCHAR(255) NOT NULL,
  acao VARCHAR(50) NOT NULL COMMENT 'CREATE, UPDATE, DELETE',
  usuario_id VARCHAR(255),
  dados_antigos JSON,
  dados_novos JSON,
  criado DATETIME DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE SET NULL,
  
  INDEX idx_tabela_acao (tabela, acao),
  INDEX idx_usuario (usuario_id),
  INDEX idx_criado (criado)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
