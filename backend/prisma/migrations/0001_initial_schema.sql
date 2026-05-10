-- ============================================================
-- Script SQL Inicial - InspectAI Database
-- Banco de Dados: MySQL 8.0+
-- Descricao: Criar tabelas atuais para modelos, placas, defeitos e relatorios
-- ============================================================
-- Observacao: este script representa o schema limpo atual. Para bancos locais
-- antigos, prefira recriar o volume Docker ou rode `npm run db:push:force`
-- somente quando for aceitavel perder dados.

CREATE DATABASE IF NOT EXISTS inspectai;
USE inspectai;

CREATE TABLE IF NOT EXISTS usuarios (
  id VARCHAR(255) PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  nome VARCHAR(255) NOT NULL,
  papel VARCHAR(50) DEFAULT 'funcionario',
  status VARCHAR(50) DEFAULT 'ativo',
  avatar VARCHAR(500),
  criado DATETIME DEFAULT CURRENT_TIMESTAMP,
  atualizado DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_email (email),
  INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS modelo (
  codigo VARCHAR(120) PRIMARY KEY,
  descricao TEXT,
  criado DATETIME DEFAULT CURRENT_TIMESTAMP,
  atualizado DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS placas (
  id INT AUTO_INCREMENT PRIMARY KEY,
  codigo VARCHAR(191) UNIQUE,
  modelo VARCHAR(120) NOT NULL,
  nome_classe VARCHAR(191) NOT NULL DEFAULT 'desconhecida',
  descricao TEXT,
  localizacao VARCHAR(255),
  criado DATETIME DEFAULT CURRENT_TIMESTAMP,
  atualizado DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (modelo) REFERENCES modelo(codigo) ON DELETE RESTRICT,
  INDEX idx_codigo (codigo),
  INDEX idx_modelo (modelo)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS defeitos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  codigoInterno VARCHAR(191) UNIQUE NOT NULL,
  id_placa INT NOT NULL,
  classe_defeito VARCHAR(191) NOT NULL DEFAULT 'defeito-nao-classificado',
  data_hora DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  nome_arquivo_origem VARCHAR(500) NOT NULL DEFAULT 'desconhecido',
  componente VARCHAR(255),
  origem VARCHAR(50) NOT NULL DEFAULT 'manual',
  severidade VARCHAR(50) DEFAULT 'media',
  descricao LONGTEXT,
  confirmado BOOLEAN NOT NULL DEFAULT TRUE,
  usuarioId VARCHAR(255),
  criado DATETIME DEFAULT CURRENT_TIMESTAMP,
  atualizado DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  resolvido DATETIME,
  FOREIGN KEY (id_placa) REFERENCES placas(id) ON DELETE CASCADE,
  FOREIGN KEY (usuarioId) REFERENCES usuarios(id) ON DELETE SET NULL,
  INDEX idx_id_placa (id_placa),
  INDEX idx_usuarioId (usuarioId),
  INDEX idx_criado (criado),
  INDEX idx_codigoInterno (codigoInterno)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS imagens_defeitos (
  id VARCHAR(255) PRIMARY KEY,
  defeitoId INT NOT NULL,
  url VARCHAR(500) NOT NULL,
  tipo VARCHAR(50) DEFAULT 'original',
  metadados JSON,
  criado DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (defeitoId) REFERENCES defeitos(id) ON DELETE CASCADE,
  INDEX idx_defeitoId (defeitoId)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS defeitos_video (
  id INT AUTO_INCREMENT PRIMARY KEY,
  defeito_id INT NOT NULL,
  id_placa INT NOT NULL,
  classe_defeito VARCHAR(191) NOT NULL DEFAULT 'defeito-nao-classificado',
  datahora DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  nome_arquivo_origem VARCHAR(500) NOT NULL DEFAULT 'desconhecido',
  frame INT,
  componente VARCHAR(255),
  origem VARCHAR(50) NOT NULL DEFAULT 'video',
  severidade VARCHAR(50) DEFAULT 'media',
  descricao LONGTEXT,
  confirmado BOOLEAN NOT NULL DEFAULT TRUE,
  criado DATETIME DEFAULT CURRENT_TIMESTAMP,
  atualizado DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (defeito_id) REFERENCES defeitos(id) ON DELETE CASCADE,
  FOREIGN KEY (id_placa) REFERENCES placas(id) ON DELETE CASCADE,
  INDEX idx_defeito_id (defeito_id),
  INDEX idx_id_placa (id_placa),
  INDEX idx_datahora (datahora)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS inspecoes (
  id VARCHAR(255) PRIMARY KEY,
  placaId INT NOT NULL,
  usuarioId VARCHAR(255) NOT NULL,
  tipo VARCHAR(50) DEFAULT 'manual',
  descricao LONGTEXT,
  status VARCHAR(50) DEFAULT 'em-progresso',
  criado DATETIME DEFAULT CURRENT_TIMESTAMP,
  concluido DATETIME,
  atualizado DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (placaId) REFERENCES placas(id) ON DELETE CASCADE,
  FOREIGN KEY (usuarioId) REFERENCES usuarios(id) ON DELETE RESTRICT,
  INDEX idx_placaId (placaId),
  INDEX idx_usuarioId (usuarioId),
  INDEX idx_criado (criado)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS relatorios (
  id VARCHAR(255) PRIMARY KEY,
  codigoInterno VARCHAR(191) UNIQUE NOT NULL,
  titulo VARCHAR(255) NOT NULL,
  descricao LONGTEXT,
  usuarioId VARCHAR(255) NOT NULL,
  origem VARCHAR(50) DEFAULT 'inspecao',
  status VARCHAR(50) DEFAULT 'rascunho',
  criado DATETIME DEFAULT CURRENT_TIMESTAMP,
  atualizado DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (usuarioId) REFERENCES usuarios(id) ON DELETE RESTRICT,
  INDEX idx_usuarioId (usuarioId),
  INDEX idx_criado (criado),
  INDEX idx_codigoInterno (codigoInterno)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS relatorios_defeitos (
  id VARCHAR(255) PRIMARY KEY,
  relatorioId VARCHAR(255) NOT NULL,
  defeitoId INT NOT NULL,
  notas LONGTEXT,
  criado DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uk_relatorio_defeito (relatorioId, defeitoId),
  FOREIGN KEY (relatorioId) REFERENCES relatorios(id) ON DELETE CASCADE,
  FOREIGN KEY (defeitoId) REFERENCES defeitos(id) ON DELETE CASCADE,
  INDEX idx_defeitoId (defeitoId)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS _DefeitoToInspecao (
  A INT NOT NULL,
  B VARCHAR(255) NOT NULL,
  UNIQUE KEY _DefeitoToInspecao_AB_unique (A, B),
  INDEX _DefeitoToInspecao_B_index (B),
  FOREIGN KEY (A) REFERENCES defeitos(id) ON DELETE CASCADE,
  FOREIGN KEY (B) REFERENCES inspecoes(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT IGNORE INTO usuarios (id, email, nome, papel, status)
VALUES ('admin-001', 'admin@inspectai.local', 'Administrador', 'admin', 'ativo');

INSERT IGNORE INTO modelo (codigo, descricao)
VALUES
  ('PCB-A001-L1', 'Modelo Placa Mae Linha A'),
  ('PCB-B002-L2', 'Modelo Controladora Linha B'),
  ('PCB-C003-L3', 'Modelo Power Supply Linha C');

INSERT IGNORE INTO placas (codigo, modelo, nome_classe, descricao)
VALUES
  ('PCB-A001-L1', 'PCB-A001-L1', 'PCB-A001-L1', 'Placa Mae Linha A'),
  ('PCB-B002-L2', 'PCB-B002-L2', 'PCB-B002-L2', 'Controladora Linha B'),
  ('PCB-C003-L3', 'PCB-C003-L3', 'PCB-C003-L3', 'Power Supply Linha C');

SHOW TABLES;
SELECT VERSION() AS 'MySQL Version';
