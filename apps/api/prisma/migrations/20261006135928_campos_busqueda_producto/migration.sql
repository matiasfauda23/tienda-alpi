-- AlterTable
ALTER TABLE "productos" ADD COLUMN     "precio_desde" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "texto_busqueda" TEXT NOT NULL DEFAULT '';

-- CreateIndex
CREATE INDEX "productos_activo_precio_desde_idx" ON "productos"("activo", "precio_desde");
