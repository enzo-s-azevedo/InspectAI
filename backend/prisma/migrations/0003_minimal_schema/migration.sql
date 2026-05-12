SET FOREIGN_KEY_CHECKS = 0;

DROP TABLE IF EXISTS defeito_em_video;
DROP TABLE IF EXISTS defeito;
DROP TABLE IF EXISTS placa;
DROP TABLE IF EXISTS modelo;
DROP TABLE IF EXISTS relatorios_defeitos;
DROP TABLE IF EXISTS relatorios;
DROP TABLE IF EXISTS inspecoes;
DROP TABLE IF EXISTS imagens_defeitos;
DROP TABLE IF EXISTS defeitos_video;
DROP TABLE IF EXISTS defeitos;
DROP TABLE IF EXISTS placas;
DROP TABLE IF EXISTS usuarios;

SET FOREIGN_KEY_CHECKS = 1;

CREATE TABLE modelo (
    codigo VARCHAR(100) NOT NULL,
    PRIMARY KEY (codigo)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE placa (
    id INT NOT NULL AUTO_INCREMENT,
    modelo_codigo VARCHAR(100) NOT NULL,
    PRIMARY KEY (id),
    KEY idx_placa_modelo_codigo (modelo_codigo),
    CONSTRAINT fk_placa_modelo
        FOREIGN KEY (modelo_codigo)
        REFERENCES modelo (codigo)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE defeito (
    id INT NOT NULL AUTO_INCREMENT,
    classe_defeito VARCHAR(255) NULL,
    status_confirmacao VARCHAR(50) NOT NULL DEFAULT 'confirmado',
    tipo VARCHAR(50) NOT NULL DEFAULT 'imagem',
    data_hora TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
    placa_id INT NOT NULL,
    PRIMARY KEY (id),
    KEY idx_defeito_placa_id (placa_id),
    KEY idx_defeito_status_confirmacao (status_confirmacao),
    KEY idx_defeito_tipo (tipo),
    CONSTRAINT fk_defeito_placa
        FOREIGN KEY (placa_id)
        REFERENCES placa (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
