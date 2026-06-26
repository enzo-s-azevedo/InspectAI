ALTER TABLE IF EXISTS "defeito"
ADD COLUMN IF NOT EXISTS "classificacao" VARCHAR(50) NOT NULL DEFAULT 'real';

UPDATE "defeito"
SET "classificacao" = CASE
    WHEN "status_confirmacao" = 'falso_positivo' THEN 'falso_positivo'
    ELSE 'real'
END
WHERE "classificacao" IS NULL
   OR "classificacao" = 'real';

CREATE INDEX IF NOT EXISTS "idx_defeito_classificacao" ON "defeito"("classificacao");
