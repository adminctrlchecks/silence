-- AlterTable
ALTER TABLE "Remedy" ADD COLUMN     "enabled" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "houseFilter" TEXT,
ADD COLUMN     "keywordFilter" TEXT,
ADD COLUMN     "planetFilter" TEXT,
ADD COLUMN     "priority" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "signFilter" TEXT;

-- AlterTable
ALTER TABLE "RemedyResult" ADD COLUMN     "matchDetail" TEXT;

-- CreateIndex
CREATE INDEX "Remedy_category_enabled_idx" ON "Remedy"("category", "enabled");
