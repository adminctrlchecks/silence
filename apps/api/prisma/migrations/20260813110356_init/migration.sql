-- CreateEnum
CREATE TYPE "Category" AS ENUM ('male', 'female', 'other');

-- CreateEnum
CREATE TYPE "Level" AS ENUM ('common', 'level1', 'level2');

-- CreateEnum
CREATE TYPE "AnswerSource" AS ENUM ('admin', 'ai');

-- CreateEnum
CREATE TYPE "ChartStyle" AS ENUM ('north_indian', 'south_indian', 'western');

-- CreateEnum
CREATE TYPE "ImportType" AS ENUM ('questions', 'answers_level1', 'answers_level2', 'remedies');

-- CreateEnum
CREATE TYPE "ImportStatus" AS ENUM ('processing', 'done', 'failed');

-- CreateTable
CREATE TABLE "Admin" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Admin_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Language" (
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "rtl" BOOLEAN NOT NULL DEFAULT false,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Language_pkey" PRIMARY KEY ("code")
);

-- CreateTable
CREATE TABLE "Question" (
    "id" TEXT NOT NULL,
    "level" "Level" NOT NULL,
    "category" "Category" NOT NULL,
    "text" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Question_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "QuestionTranslation" (
    "id" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "lang" TEXT NOT NULL,
    "text" TEXT NOT NULL,

    CONSTRAINT "QuestionTranslation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Answer" (
    "id" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "level" "Level" NOT NULL,
    "category" "Category" NOT NULL,
    "text" TEXT NOT NULL,
    "source" "AnswerSource" NOT NULL DEFAULT 'admin',
    "reviewed" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Answer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AnswerTranslation" (
    "id" TEXT NOT NULL,
    "answerId" TEXT NOT NULL,
    "lang" TEXT NOT NULL,
    "text" TEXT NOT NULL,

    CONSTRAINT "AnswerTranslation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Remedy" (
    "id" TEXT NOT NULL,
    "category" "Category" NOT NULL,
    "title" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "linkedLevel" "Level",
    "linkedQuestionId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Remedy_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RemedyTranslation" (
    "id" TEXT NOT NULL,
    "remedyId" TEXT NOT NULL,
    "lang" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "text" TEXT NOT NULL,

    CONSTRAINT "RemedyTranslation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ChartConfig" (
    "category" "Category" NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'astrology',
    "style" "ChartStyle" NOT NULL DEFAULT 'north_indian',
    "source" TEXT NOT NULL DEFAULT 'level2',
    "requires" TEXT[] DEFAULT ARRAY['dob', 'timeOfBirth', 'placeOfBirth']::TEXT[],
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ChartConfig_pkey" PRIMARY KEY ("category")
);

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" "Category" NOT NULL,
    "dob" TEXT NOT NULL,
    "timeOfBirth" TEXT NOT NULL,
    "placeCity" TEXT NOT NULL,
    "placeCountry" TEXT NOT NULL,
    "placeLat" DOUBLE PRECISION,
    "placeLng" DOUBLE PRECISION,
    "contact" TEXT NOT NULL,
    "passwordHash" TEXT,
    "lang" TEXT NOT NULL DEFAULT 'en',
    "consent" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserResponse" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "level" "Level" NOT NULL,
    "category" "Category" NOT NULL,
    "value" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserResponse_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserChart" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "category" "Category" NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'astrology',
    "style" TEXT NOT NULL DEFAULT 'north_indian',
    "data" JSONB NOT NULL,
    "interpretation" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserChart_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ImportJob" (
    "id" TEXT NOT NULL,
    "type" "ImportType" NOT NULL,
    "status" "ImportStatus" NOT NULL DEFAULT 'processing',
    "created" INTEGER NOT NULL DEFAULT 0,
    "updated" INTEGER NOT NULL DEFAULT 0,
    "errors" JSONB NOT NULL DEFAULT '[]',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ImportJob_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Admin_email_key" ON "Admin"("email");

-- CreateIndex
CREATE INDEX "Question_level_category_idx" ON "Question"("level", "category");

-- CreateIndex
CREATE UNIQUE INDEX "QuestionTranslation_questionId_lang_key" ON "QuestionTranslation"("questionId", "lang");

-- CreateIndex
CREATE INDEX "Answer_level_category_idx" ON "Answer"("level", "category");

-- CreateIndex
CREATE INDEX "Answer_questionId_idx" ON "Answer"("questionId");

-- CreateIndex
CREATE INDEX "Answer_source_reviewed_idx" ON "Answer"("source", "reviewed");

-- CreateIndex
CREATE UNIQUE INDEX "AnswerTranslation_answerId_lang_key" ON "AnswerTranslation"("answerId", "lang");

-- CreateIndex
CREATE INDEX "Remedy_category_idx" ON "Remedy"("category");

-- CreateIndex
CREATE UNIQUE INDEX "RemedyTranslation_remedyId_lang_key" ON "RemedyTranslation"("remedyId", "lang");

-- CreateIndex
CREATE UNIQUE INDEX "User_contact_key" ON "User"("contact");

-- CreateIndex
CREATE INDEX "User_category_idx" ON "User"("category");

-- CreateIndex
CREATE INDEX "UserResponse_userId_level_idx" ON "UserResponse"("userId", "level");

-- CreateIndex
CREATE INDEX "UserChart_userId_idx" ON "UserChart"("userId");

-- AddForeignKey
ALTER TABLE "QuestionTranslation" ADD CONSTRAINT "QuestionTranslation_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "Question"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Answer" ADD CONSTRAINT "Answer_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "Question"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AnswerTranslation" ADD CONSTRAINT "AnswerTranslation_answerId_fkey" FOREIGN KEY ("answerId") REFERENCES "Answer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RemedyTranslation" ADD CONSTRAINT "RemedyTranslation_remedyId_fkey" FOREIGN KEY ("remedyId") REFERENCES "Remedy"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserResponse" ADD CONSTRAINT "UserResponse_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserResponse" ADD CONSTRAINT "UserResponse_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "Question"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserChart" ADD CONSTRAINT "UserChart_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
