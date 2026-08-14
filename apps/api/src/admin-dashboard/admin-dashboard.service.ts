import { Injectable } from '@nestjs/common';
import { CATEGORIES, LEVELS, READING_SESSION_STATUSES } from '@silence/shared';
import type {
  AdminDashboardMetrics,
  AdminQuestionCoverage,
  AdminTranslationCompleteness,
  Category,
  ContentMatrix,
  ContentMatrixCell,
  ImportType,
  Level,
  ReadingSessionStatus,
} from '@silence/shared';
import { PrismaService } from '../prisma/prisma.service';

/** Gemini falls back to this prefix instead of throwing — see gemini.service.ts `stub()`. */
const AI_FALLBACK_PREFIX = '[AI placeholder]';

@Injectable()
export class AdminDashboardService {
  constructor(private readonly prisma: PrismaService) {}

  /** Live counters for the admin overview — docs/API.md §7b. */
  async metrics(): Promise<AdminDashboardMetrics> {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekStart = new Date(todayStart);
    weekStart.setDate(weekStart.getDate() - 7);
    const monthStart = new Date(todayStart);
    monthStart.setDate(monthStart.getDate() - 30);

    const [
      totalUsers,
      newToday,
      newThisWeek,
      newThisMonth,
      totalSessions,
      sessionsByStatusRaw,
      totalQuestions,
      activeQuestions,
      totalAnswers,
      unreviewedAi,
      questions,
      reviewedAnswerQuestionIds,
      anyAnswerQuestionIds,
      totalRemedies,
      remedyCategoriesRaw,
      languages,
      questionTranslationCounts,
      answerTranslationCounts,
      remedyTranslationCounts,
      totalCharts,
      aiFallbackCount,
      totalImports,
      failedImports,
      recentFailures,
    ] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.user.count({ where: { createdAt: { gte: todayStart } } }),
      this.prisma.user.count({ where: { createdAt: { gte: weekStart } } }),
      this.prisma.user.count({ where: { createdAt: { gte: monthStart } } }),
      this.prisma.readingSession.count(),
      this.prisma.readingSession.groupBy({ by: ['status'], _count: { _all: true } }),
      this.prisma.question.count(),
      this.prisma.question.count({ where: { active: true } }),
      this.prisma.answer.count(),
      this.prisma.answer.count({ where: { source: 'ai', reviewed: false } }),
      this.prisma.question.findMany({ select: { id: true, level: true, category: true } }),
      this.prisma.answer.findMany({ where: { reviewed: true }, select: { questionId: true } }),
      this.prisma.answer.findMany({ select: { questionId: true } }),
      this.prisma.remedy.count(),
      this.prisma.remedy.groupBy({ by: ['category'] }),
      this.prisma.language.findMany({ where: { enabled: true }, orderBy: { code: 'asc' } }),
      this.prisma.questionTranslation.groupBy({ by: ['lang'], _count: { _all: true } }),
      this.prisma.answerTranslation.groupBy({ by: ['lang'], _count: { _all: true } }),
      this.prisma.remedyTranslation.groupBy({ by: ['lang'], _count: { _all: true } }),
      this.prisma.userChart.count(),
      this.prisma.userChart.count({ where: { interpretation: { startsWith: AI_FALLBACK_PREFIX } } }),
      this.prisma.importJob.count(),
      this.prisma.importJob.count({ where: { status: 'failed' } }),
      this.prisma.importJob.findMany({
        where: { status: 'failed' },
        orderBy: { createdAt: 'desc' },
        take: 5,
        select: { id: true, type: true, createdAt: true },
      }),
    ]);

    const byStatus = Object.fromEntries(READING_SESSION_STATUSES.map((s) => [s, 0])) as Record<
      ReadingSessionStatus,
      number
    >;
    for (const row of sessionsByStatusRaw as Array<{ status: ReadingSessionStatus; _count: { _all: number } }>) {
      byStatus[row.status] = row._count._all;
    }

    const questionCoverage = this.coverageByLevelCategory(questions, reviewedAnswerQuestionIds, anyAnswerQuestionIds);

    const remedyCategories = new Set(
      (remedyCategoriesRaw as Array<{ category: Category }>).map((r) => r.category),
    );
    const categoriesMissingRemedy = CATEGORIES.filter((c) => !remedyCategories.has(c));

    const qtMap = new Map(
      (questionTranslationCounts as Array<{ lang: string; _count: { _all: number } }>).map((r) => [r.lang, r._count._all]),
    );
    const atMap = new Map(
      (answerTranslationCounts as Array<{ lang: string; _count: { _all: number } }>).map((r) => [r.lang, r._count._all]),
    );
    const rtMap = new Map(
      (remedyTranslationCounts as Array<{ lang: string; _count: { _all: number } }>).map((r) => [r.lang, r._count._all]),
    );
    const translations: AdminTranslationCompleteness[] = languages.map((l) => ({
      lang: l.code,
      questionsTranslated: qtMap.get(l.code) ?? 0,
      questionsTotal: totalQuestions,
      answersTranslated: atMap.get(l.code) ?? 0,
      answersTotal: totalAnswers,
      remediesTranslated: rtMap.get(l.code) ?? 0,
      remediesTotal: totalRemedies,
    }));

    return {
      users: { total: totalUsers, newToday, newThisWeek, newThisMonth },
      sessions: { total: totalSessions, byStatus },
      questions: { total: totalQuestions, active: activeQuestions },
      answers: { total: totalAnswers, unreviewedAi },
      questionCoverage,
      remedies: { total: totalRemedies, categoriesMissingRemedy },
      translations,
      chart: { total: totalCharts, aiFallbackCount },
      imports: {
        total: totalImports,
        failed: failedImports,
        recentFailures: recentFailures.map((j) => ({
          id: j.id,
          type: j.type as ImportType,
          createdAt: j.createdAt.toISOString(),
        })),
      },
    };
  }

  /** Levels x categories x questions-with-answers x per-language translations x remedies — docs/API.md §7b. */
  async contentMatrix(): Promise<ContentMatrix> {
    const [questions, reviewedAnswers, allAnswers, remedies, languages, questionTranslations, answerTranslations] =
      await Promise.all([
        this.prisma.question.findMany({ select: { id: true, level: true, category: true } }),
        this.prisma.answer.findMany({ where: { reviewed: true }, select: { questionId: true } }),
        this.prisma.answer.findMany({ select: { id: true, questionId: true, level: true, category: true } }),
        this.prisma.remedy.findMany({ select: { category: true, linkedLevel: true } }),
        this.prisma.language.findMany({ where: { enabled: true }, orderBy: { code: 'asc' } }),
        this.prisma.questionTranslation.findMany({ select: { questionId: true, lang: true } }),
        this.prisma.answerTranslation.findMany({ select: { answerId: true, lang: true } }),
      ]);

    const langCodes = languages.map((l) => l.code);
    const cells = new Map<string, ContentMatrixCell>();
    for (const level of LEVELS) {
      for (const category of CATEGORIES) {
        cells.set(`${level}:${category}`, {
          level,
          category,
          questionsTotal: 0,
          questionsWithAnswer: 0,
          questionsWithReviewedAnswer: 0,
          remedyCount: 0,
          languages: langCodes.map((lang) => ({ lang, questionsTranslated: 0, answersTranslated: 0 })),
        });
      }
    }

    const anyAnsweredSet = new Set(allAnswers.map((a) => a.questionId));
    const reviewedAnsweredSet = new Set(reviewedAnswers.map((a) => a.questionId));

    const questionLangs = new Map<string, Set<string>>();
    for (const t of questionTranslations) {
      const set = questionLangs.get(t.questionId) ?? new Set<string>();
      set.add(t.lang);
      questionLangs.set(t.questionId, set);
    }

    for (const q of questions) {
      const cell = cells.get(`${q.level}:${q.category}`);
      if (!cell) continue;
      cell.questionsTotal++;
      if (anyAnsweredSet.has(q.id)) cell.questionsWithAnswer++;
      if (reviewedAnsweredSet.has(q.id)) cell.questionsWithReviewedAnswer++;

      const langsForQ = questionLangs.get(q.id);
      if (langsForQ) {
        for (const coverage of cell.languages) {
          if (langsForQ.has(coverage.lang)) coverage.questionsTranslated++;
        }
      }
    }

    const answerLevelCategory = new Map(allAnswers.map((a) => [a.id, { level: a.level, category: a.category }]));
    const answerLangs = new Map<string, Set<string>>();
    for (const t of answerTranslations) {
      const set = answerLangs.get(t.answerId) ?? new Set<string>();
      set.add(t.lang);
      answerLangs.set(t.answerId, set);
    }
    for (const [answerId, langs] of answerLangs) {
      const owner = answerLevelCategory.get(answerId);
      if (!owner) continue;
      const cell = cells.get(`${owner.level}:${owner.category}`);
      if (!cell) continue;
      for (const coverage of cell.languages) {
        if (langs.has(coverage.lang)) coverage.answersTranslated++;
      }
    }

    for (const r of remedies as Array<{ category: Category; linkedLevel: Level | null }>) {
      const levelsToCount = r.linkedLevel ? [r.linkedLevel] : LEVELS;
      for (const level of levelsToCount) {
        const cell = cells.get(`${level}:${r.category}`);
        if (cell) cell.remedyCount++;
      }
    }

    return { cells: Array.from(cells.values()), languages: langCodes };
  }

  private coverageByLevelCategory(
    questions: Array<{ id: string; level: Level; category: Category }>,
    reviewedAnswers: Array<{ questionId: string }>,
    anyAnswers: Array<{ questionId: string }>,
  ): AdminQuestionCoverage[] {
    const anyAnsweredSet = new Set(anyAnswers.map((a) => a.questionId));
    const reviewedAnsweredSet = new Set(reviewedAnswers.map((a) => a.questionId));
    const cells = new Map<string, AdminQuestionCoverage>();
    for (const level of LEVELS) {
      for (const category of CATEGORIES) {
        cells.set(`${level}:${category}`, {
          level,
          category,
          questionsTotal: 0,
          questionsWithAnswer: 0,
          questionsWithReviewedAnswer: 0,
        });
      }
    }
    for (const q of questions) {
      const cell = cells.get(`${q.level}:${q.category}`);
      if (!cell) continue;
      cell.questionsTotal++;
      if (anyAnsweredSet.has(q.id)) cell.questionsWithAnswer++;
      if (reviewedAnsweredSet.has(q.id)) cell.questionsWithReviewedAnswer++;
    }
    return Array.from(cells.values());
  }
}
