-- AlterTable
ALTER TABLE "registros_auditoria" ADD COLUMN     "ruta" VARCHAR(200) NOT NULL DEFAULT '';

-- CreateIndex
CREATE INDEX "registros_auditoria_creado_en_idx" ON "registros_auditoria"("creado_en");
