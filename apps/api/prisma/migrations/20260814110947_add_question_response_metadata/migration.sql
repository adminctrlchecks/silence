-- AlterTable
ALTER TABLE "Question" ADD COLUMN     "active" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "branchingTags" TEXT,
ADD COLUMN     "helpText" TEXT,
ADD COLUMN     "inputType" TEXT NOT NULL DEFAULT 'textarea',
ADD COLUMN     "required" BOOLEAN NOT NULL DEFAULT true;

-- AlterTable
ALTER TABLE "QuestionTranslation" ADD COLUMN     "helpText" TEXT;

-- AlterTable
ALTER TABLE "UserResponse" ADD COLUMN     "answerId" TEXT,
ADD COLUMN     "answerTextShown" TEXT;

-- CreateIndex
CREATE INDEX "UserResponse_sessionId_questionId_idx" ON "UserResponse"("sessionId", "questionId");
