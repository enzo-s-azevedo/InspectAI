CREATE TABLE IF NOT EXISTS "modelo" (
    "codigo" VARCHAR(100) NOT NULL,

    CONSTRAINT "modelo_pkey" PRIMARY KEY ("codigo")
);

CREATE TABLE IF NOT EXISTS "placa" (
    "id" SERIAL NOT NULL,
    "modelo_codigo" VARCHAR(100) NOT NULL,

    CONSTRAINT "placa_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "fk_placa_modelo"
        FOREIGN KEY ("modelo_codigo") REFERENCES "modelo"("codigo")
        ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX IF NOT EXISTS "idx_placa_modelo_codigo" ON "placa"("modelo_codigo");

CREATE TABLE IF NOT EXISTS "defeito" (
    "id" SERIAL NOT NULL,
    "classe_defeito" VARCHAR(255),
    "status_confirmacao" VARCHAR(50) NOT NULL DEFAULT 'confirmado',
    "classificacao" VARCHAR(50) NOT NULL DEFAULT 'real',
    "tipo" VARCHAR(50) NOT NULL DEFAULT 'imagem',
    "data_hora" TIMESTAMP(0) DEFAULT CURRENT_TIMESTAMP,
    "placa_id" INTEGER NOT NULL,

    CONSTRAINT "defeito_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "fk_defeito_placa"
        FOREIGN KEY ("placa_id") REFERENCES "placa"("id")
        ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX IF NOT EXISTS "idx_defeito_placa_id" ON "defeito"("placa_id");
CREATE INDEX IF NOT EXISTS "idx_defeito_status_confirmacao" ON "defeito"("status_confirmacao");
CREATE INDEX IF NOT EXISTS "idx_defeito_classificacao" ON "defeito"("classificacao");
CREATE INDEX IF NOT EXISTS "idx_defeito_tipo" ON "defeito"("tipo");

CREATE TABLE IF NOT EXISTS "usuario" (
    "id" SERIAL NOT NULL,
    "nome" VARCHAR(100) NOT NULL,
    "email" VARCHAR(150) NOT NULL,
    "senha_hash" VARCHAR(255) NOT NULL,
    "cargo" VARCHAR(32) NOT NULL,
    "criado_em" TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "usuario_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "usuario_email_key" ON "usuario"("email");

CREATE TABLE IF NOT EXISTS "relatorio" (
    "id" SERIAL NOT NULL,
    "placa_id" INTEGER NOT NULL,
    "id_usuario_criador" INTEGER NOT NULL,
    "id_usuario_ultimo_acesso" INTEGER,
    "criado_em" TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizado_em" TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "relatorio_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "fk_relatorio_placa"
        FOREIGN KEY ("placa_id") REFERENCES "placa"("id")
        ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "fk_relatorio_usuario_criador"
        FOREIGN KEY ("id_usuario_criador") REFERENCES "usuario"("id")
        ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "fk_relatorio_usuario_ultimo_acesso"
        FOREIGN KEY ("id_usuario_ultimo_acesso") REFERENCES "usuario"("id")
        ON DELETE SET NULL ON UPDATE CASCADE
);

CREATE INDEX IF NOT EXISTS "idx_relatorio_placa" ON "relatorio"("placa_id");
CREATE INDEX IF NOT EXISTS "idx_relatorio_usuario_criador" ON "relatorio"("id_usuario_criador");
CREATE INDEX IF NOT EXISTS "idx_relatorio_usuario_ultimo_acesso" ON "relatorio"("id_usuario_ultimo_acesso");

CREATE TABLE IF NOT EXISTS "relatorio_defeito" (
    "id" SERIAL NOT NULL,
    "relatorio_id" INTEGER NOT NULL,
    "defeito_id" INTEGER NOT NULL,
    "status_validacao" VARCHAR(50) NOT NULL DEFAULT 'pendente',
    "observacao" TEXT,
    "criado_em" TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "relatorio_defeito_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "fk_relatorio_defeito_relatorio"
        FOREIGN KEY ("relatorio_id") REFERENCES "relatorio"("id")
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "fk_relatorio_defeito_defeito"
        FOREIGN KEY ("defeito_id") REFERENCES "defeito"("id")
        ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX IF NOT EXISTS "idx_relatorio_defeito_relatorio" ON "relatorio_defeito"("relatorio_id");
CREATE INDEX IF NOT EXISTS "idx_relatorio_defeito_defeito" ON "relatorio_defeito"("defeito_id");

CREATE TABLE IF NOT EXISTS "relatorio_imagem" (
    "id" SERIAL NOT NULL,
    "relatorio_id" INTEGER NOT NULL,
    "caminho_imagem" VARCHAR(255) NOT NULL,
    "tipo" VARCHAR(30) NOT NULL DEFAULT 'original',
    "criado_em" TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "relatorio_imagem_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "fk_relatorio_imagem_relatorio"
        FOREIGN KEY ("relatorio_id") REFERENCES "relatorio"("id")
        ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX IF NOT EXISTS "idx_relatorio_imagem_relatorio" ON "relatorio_imagem"("relatorio_id");
