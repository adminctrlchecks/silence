-- CreateEnum
CREATE TYPE "ReadingSessionStatus" AS ENUM ('draft', 'in_progress', 'chart_ready', 'remedy_ready', 'complete');

-- AlterTable
ALTER TABLE "UserChart" ADD COLUMN     "sessionId" TEXT;

-- AlterTable
ALTER TABLE "UserResponse" ADD COLUMN     "sessionId" TEXT;

-- CreateTable
CREATE TABLE "ReadingSession" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "status" "ReadingSessionStatus" NOT NULL DEFAULT 'draft',
    "category" "Category" NOT NULL,
    "lang" TEXT NOT NULL,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ReadingSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RemedyResult" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "remedyId" TEXT,
    "title" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "linkedLevel" "Level",
    "linkedQuestionId" TEXT,
    "source" TEXT NOT NULL DEFAULT 'category',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RemedyResult_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ReadingSession_userId_status_idx" ON "ReadingSession"("userId", "status");

-- CreateIndex
CREATE INDEX "ReadingSession_userId_startedAt_idx" ON "ReadingSession"("userId", "startedAt");

-- CreateIndex
CREATE UNIQUE INDEX "RemedyResult_sessionId_key" ON "RemedyResult"("sessionId");

-- CreateIndex
CREATE INDEX "UserChart_sessionId_idx" ON "UserChart"("sessionId");

-- CreateIndex
CREATE INDEX "UserResponse_sessionId_idx" ON "UserResponse"("sessionId");

-- AddForeignKey
ALTER TABLE "UserResponse" ADD CONSTRAINT "UserResponse_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "ReadingSession"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserChart" ADD CONSTRAINT "UserChart_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "ReadingSession"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReadingSession" ADD CONSTRAINT "ReadingSession_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RemedyResult" ADD CONSTRAINT "RemedyResult_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "ReadingSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;
