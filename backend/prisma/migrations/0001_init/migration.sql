CREATE TABLE IF NOT EXISTS `modelo` (
    `codigo` VARCHAR(100) NOT NULL,

    PRIMARY KEY (`codigo`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `placa` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `modelo_codigo` VARCHAR(100) NOT NULL,

    INDEX `idx_placa_modelo_codigo`(`modelo_codigo`),
    CONSTRAINT `fk_placa_modelo`
        FOREIGN KEY (`modelo_codigo`) REFERENCES `modelo`(`codigo`)
        ON DELETE CASCADE ON UPDATE CASCADE,
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `defeito` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `classe_defeito` VARCHAR(255) NULL,
    `status_confirmacao` VARCHAR(50) NOT NULL DEFAULT 'confirmado',
    `tipo` VARCHAR(50) NOT NULL DEFAULT 'imagem',
    `data_hora` TIMESTAMP(0) NULL DEFAULT CURRENT_TIMESTAMP(0),
    `placa_id` INTEGER NOT NULL,

    INDEX `idx_defeito_placa_id`(`placa_id`),
    INDEX `idx_defeito_status_confirmacao`(`status_confirmacao`),
    INDEX `idx_defeito_tipo`(`tipo`),
    CONSTRAINT `fk_defeito_placa`
        FOREIGN KEY (`placa_id`) REFERENCES `placa`(`id`)
        ON DELETE CASCADE ON UPDATE CASCADE,
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `usuario` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nome` VARCHAR(100) NOT NULL,
    `email` VARCHAR(150) NOT NULL,
    `senha_hash` VARCHAR(255) NOT NULL,
    `cargo` VARCHAR(32) NOT NULL,
    `criado_em` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),

    UNIQUE INDEX `usuario_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `relatorio` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `placa_id` INTEGER NOT NULL,
    `usuario_id` INTEGER NULL,
    `status` VARCHAR(30) NOT NULL DEFAULT 'processado',
    `criado_em` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `atualizado_em` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0) ON UPDATE CURRENT_TIMESTAMP(0),

    INDEX `idx_relatorio_placa`(`placa_id`),
    INDEX `idx_relatorio_usuario`(`usuario_id`),
    CONSTRAINT `fk_relatorio_placa`
        FOREIGN KEY (`placa_id`) REFERENCES `placa`(`id`)
        ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT `fk_relatorio_usuario`
        FOREIGN KEY (`usuario_id`) REFERENCES `usuario`(`id`)
        ON DELETE SET NULL ON UPDATE CASCADE,
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `relatorio_defeito` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `relatorio_id` INTEGER NOT NULL,
    `defeito_id` INTEGER NOT NULL,
    `status_validacao` VARCHAR(50) NOT NULL DEFAULT 'pendente',
    `observacao` TEXT NULL,
    `criado_em` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),

    INDEX `idx_relatorio_defeito_relatorio`(`relatorio_id`),
    INDEX `idx_relatorio_defeito_defeito`(`defeito_id`),
    CONSTRAINT `fk_relatorio_defeito_relatorio`
        FOREIGN KEY (`relatorio_id`) REFERENCES `relatorio`(`id`)
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT `fk_relatorio_defeito_defeito`
        FOREIGN KEY (`defeito_id`) REFERENCES `defeito`(`id`)
        ON DELETE CASCADE ON UPDATE CASCADE,
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `relatorio_imagem` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `relatorio_id` INTEGER NOT NULL,
    `caminho_imagem` VARCHAR(255) NOT NULL,
    `tipo` VARCHAR(30) NOT NULL DEFAULT 'original',
    `criado_em` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),

    INDEX `idx_relatorio_imagem_relatorio`(`relatorio_id`),
    CONSTRAINT `fk_relatorio_imagem_relatorio`
        FOREIGN KEY (`relatorio_id`) REFERENCES `relatorio`(`id`)
        ON DELETE CASCADE ON UPDATE CASCADE,
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
