-- ============================================================
-- Script SQL Inicial - InspectAI Database
-- Banco de Dados: MySQL 8.0+
-- Descrição: Criar tabelas para armazenar defeitos, placas e usuários
-- ============================================================

-- ==================== CRIAR DATABASE ====================
CREATE DATABASE IF NOT EXISTS inspectai;
USE inspectai;

-- ==================== TABELA: USUÁRIOS ====================
CREATE TABLE IF NOT EXISTS usuarios (
  id VARCHAR(255) PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  nome VARCHAR(255) NOT NULL,
  papel VARCHAR(50) DEFAULT 'funcionario' COMMENT 'admin, funcionario, inspetor',
  status VARCHAR(50) DEFAULT 'ativo' COMMENT 'ativo, inativo',
  avatar VARCHAR(500),
  criado DATETIME DEFAULT CURRENT_TIMESTAMP,
  atualizado DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  INDEX idx_email (email),
  INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ==================== TABELA: PLACAS ====================
CREATE TABLE IF NOT EXISTS placas (
  id VARCHAR(255) PRIMARY KEY,
  codigo VARCHAR(50) UNIQUE NOT NULL COMMENT 'PCB-AALLL-LX',
  descricao TEXT,
  localizacao VARCHAR(255),
  criado DATETIME DEFAULT CURRENT_TIMESTAMP,
  atualizado DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  INDEX idx_codigo (codigo)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ==================== TABELA: DEFEITOS ====================
CREATE TABLE IF NOT EXISTS defeitos (
  id VARCHAR(255) PRIMARY KEY,
  codigoInterno VARCHAR(50) UNIQUE NOT NULL COMMENT '#DEF-XXXX',
  placaId VARCHAR(255) NOT NULL,
  tipo VARCHAR(100) NOT NULL COMMENT 'rachadura, oxidacao, solda-fria, etc',
  componente VARCHAR(255),
  origem VARCHAR(50) NOT NULL COMMENT 'manual, automatico, importado',
  severidade VARCHAR(50) DEFAULT 'media' COMMENT 'baixa, media, alta, critica',
  descricao LONGTEXT,
  
  status VARCHAR(50) DEFAULT 'aberto' COMMENT 'aberto, em-analise, resolvido, descartado',
  usuarioId VARCHAR(255),
  
  criado DATETIME DEFAULT CURRENT_TIMESTAMP,
  atualizado DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  resolvido DATETIME,
  
  FOREIGN KEY (placaId) REFERENCES placas(id) ON DELETE CASCADE,
  FOREIGN KEY (usuarioId) REFERENCES usuarios(id) ON DELETE SET NULL,
  
  INDEX idx_placaId (placaId),
  INDEX idx_usuarioId (usuarioId),
  INDEX idx_status (status),
  INDEX idx_criado (criado),
  INDEX idx_codigoInterno (codigoInterno)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ==================== TABELA: IMAGENS_DEFEITOS ====================
CREATE TABLE IF NOT EXISTS imagens_defeitos (
  id VARCHAR(255) PRIMARY KEY,
  defeitoId VARCHAR(255) NOT NULL,
  url VARCHAR(500) NOT NULL,
  tipo VARCHAR(50) DEFAULT 'original' COMMENT 'original, processada, anotada',
  metadados JSON,
  criado DATETIME DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (defeitoId) REFERENCES defeitos(id) ON DELETE CASCADE,
  
  INDEX idx_defeitoId (defeitoId)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ==================== TABELA: INSPEÇÕES ====================
CREATE TABLE IF NOT EXISTS inspecoes (
  id VARCHAR(255) PRIMARY KEY,
  placaId VARCHAR(255) NOT NULL,
  usuarioId VARCHAR(255) NOT NULL,
  
  tipo VARCHAR(50) DEFAULT 'manual' COMMENT 'manual, automatizado, resumida',
  descricao LONGTEXT,
  status VARCHAR(50) DEFAULT 'em-progresso' COMMENT 'em-progresso, concluida, cancelada',
  
  criado DATETIME DEFAULT CURRENT_TIMESTAMP,
  concluido DATETIME,
  atualizado DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  FOREIGN KEY (placaId) REFERENCES placas(id) ON DELETE CASCADE,
  FOREIGN KEY (usuarioId) REFERENCES usuarios(id) ON DELETE RESTRICT,
  
  INDEX idx_placaId (placaId),
  INDEX idx_usuarioId (usuarioId),
  INDEX idx_criado (criado),
  INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ==================== TABELA: RELATÓRIOS ====================
CREATE TABLE IF NOT EXISTS relatorios (
  id VARCHAR(255) PRIMARY KEY,
  codigoInterno VARCHAR(50) UNIQUE NOT NULL COMMENT 'REL-XXX',
  titulo VARCHAR(255) NOT NULL,
  descricao LONGTEXT,
  
  usuarioId VARCHAR(255) NOT NULL,
  origem VARCHAR(50) DEFAULT 'inspecao' COMMENT 'inspecao, analise-manual',
  status VARCHAR(50) DEFAULT 'rascunho' COMMENT 'rascunho, finalizado, arquivado',
  
  criado DATETIME DEFAULT CURRENT_TIMESTAMP,
  atualizado DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  FOREIGN KEY (usuarioId) REFERENCES usuarios(id) ON DELETE RESTRICT,
  
  INDEX idx_usuarioId (usuarioId),
  INDEX idx_criado (criado),
  INDEX idx_status (status),
  INDEX idx_codigoInterno (codigoInterno)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ==================== TABELA: RELATORIOS_DEFEITOS (Muitos-para-Muitos) ====================
CREATE TABLE IF NOT EXISTS relatorios_defeitos (
  id VARCHAR(255) PRIMARY KEY,
  relatorioId VARCHAR(255) NOT NULL,
  defeitoId VARCHAR(255) NOT NULL,
  
  notas LONGTEXT,
  criado DATETIME DEFAULT CURRENT_TIMESTAMP,
  
  UNIQUE KEY uk_relatorio_defeito (relatorioId, defeitoId),
  FOREIGN KEY (relatorioId) REFERENCES relatorios(id) ON DELETE CASCADE,
  FOREIGN KEY (defeitoId) REFERENCES defeitos(id) ON DELETE CASCADE,
  
  INDEX idx_defeitoId (defeitoId)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ==================== CONSTRAINTS DE INTEGRIDADE ====================
-- Verificar que defeitos e inspecoes estão na mesma placa
ALTER TABLE defeitos ADD CONSTRAINT chk_defeito_tipo CHECK (tipo IN ('rachadura', 'oxidacao', 'solda-fria', 'corrosao', 'dano-mecanico', 'outro'));
ALTER TABLE defeitos ADD CONSTRAINT chk_defeito_severidade CHECK (severidade IN ('baixa', 'media', 'alta', 'critica'));
ALTER TABLE defeitos ADD CONSTRAINT chk_defeito_origem CHECK (origem IN ('manual', 'automatico', 'importado'));
ALTER TABLE defeitos ADD CONSTRAINT chk_defeito_status CHECK (status IN ('aberto', 'em-analise', 'resolvido', 'descartado'));

ALTER TABLE usuarios ADD CONSTRAINT chk_usuario_papel CHECK (papel IN ('admin', 'funcionario', 'inspetor'));
ALTER TABLE usuarios ADD CONSTRAINT chk_usuario_status CHECK (status IN ('ativo', 'inativo'));

-- ==================== DADOS INICIAIS ====================
-- Usuário Admin padrão
INSERT IGNORE INTO usuarios (id, email, nome, papel, status)
VALUES (
  'admin-001',
  'admin@inspectai.local',
  'Administrador',
  'admin',
  'ativo'
);

-- Placas de exemplo para testes
INSERT IGNORE INTO placas (id, codigo, descricao)
VALUES 
  ('placa-001', 'PCB-A001-L1', 'Placa Mãe Linha A'),
  ('placa-002', 'PCB-B002-L2', 'Controladora Linha B'),
  ('placa-003', 'PCB-C003-L3', 'Power Supply Linha C');

-- ==================== CRIAÇÃO FINALIZADA ====================
SHOW TABLES;
SELECT VERSION() AS 'MySQL Version';
