-- DropIndex
DROP INDEX "Commission_sourceIndicationId_key";

-- CreateIndex
CREATE INDEX "Commission_sourceIndicationId_idx" ON "Commission"("sourceIndicationId");
