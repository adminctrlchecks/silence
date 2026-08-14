import { AdminDashboardService } from './admin-dashboard.service';
import { createPrismaMock, PrismaMock } from '../test-utils/prisma-mock';

describe('AdminDashboardService', () => {
  let prisma: PrismaMock;
  let service: AdminDashboardService;

  beforeEach(() => {
    prisma = createPrismaMock();
    service = new AdminDashboardService(prisma as never);
  });

  describe('metrics()', () => {
    function stubCounts() {
      // user.count is called 4x (total, today, week, month)
      prisma.user.count
        .mockResolvedValueOnce(10)
        .mockResolvedValueOnce(1)
        .mockResolvedValueOnce(3)
        .mockResolvedValueOnce(5);
      prisma.readingSession.count.mockResolvedValue(7);
      prisma.readingSession.groupBy.mockResolvedValue([
        { status: 'complete', _count: { _all: 4 } },
        { status: 'in_progress', _count: { _all: 3 } },
      ]);
      // question.count is called 2x (total, active)
      prisma.question.count.mockResolvedValueOnce(2).mockResolvedValueOnce(2);
      // answer.count is called 2x (total, unreviewed AI)
      prisma.answer.count.mockResolvedValueOnce(3).mockResolvedValueOnce(1);
      prisma.question.findMany.mockResolvedValue([
        { id: 'q1', level: 'level1', category: 'female' },
        { id: 'q2', level: 'level1', category: 'female' },
      ]);
      prisma.answer.findMany
        .mockResolvedValueOnce([{ questionId: 'q1' }]) // reviewed
        .mockResolvedValueOnce([{ questionId: 'q1' }, { questionId: 'q2' }]); // any
      prisma.remedy.count.mockResolvedValue(1);
      prisma.remedy.groupBy.mockResolvedValue([{ category: 'female' }]);
      prisma.language.findMany.mockResolvedValue([{ code: 'en' }, { code: 'hi' }]);
      prisma.questionTranslation.groupBy.mockResolvedValue([{ lang: 'en', _count: { _all: 2 } }]);
      prisma.answerTranslation.groupBy.mockResolvedValue([{ lang: 'en', _count: { _all: 1 } }]);
      prisma.remedyTranslation.groupBy.mockResolvedValue([]);
      prisma.userChart.count.mockResolvedValueOnce(5).mockResolvedValueOnce(2);
      prisma.importJob.count.mockResolvedValueOnce(4).mockResolvedValueOnce(1);
      prisma.importJob.findMany.mockResolvedValue([
        { id: 'imp1', type: 'questions', createdAt: new Date('2026-08-01T00:00:00Z') },
      ]);
    }

    it('assembles users/sessions/questions/answers/remedies/translations/chart/import counters', async () => {
      stubCounts();
      const res = await service.metrics();

      expect(res.users).toEqual({ total: 10, newToday: 1, newThisWeek: 3, newThisMonth: 5 });
      expect(res.sessions).toEqual({
        total: 7,
        byStatus: { draft: 0, in_progress: 3, chart_ready: 0, remedy_ready: 0, complete: 4 },
      });
      expect(res.questions).toEqual({ total: 2, active: 2 });
      expect(res.answers).toEqual({ total: 3, unreviewedAi: 1 });
      expect(res.questionCoverage).toContainEqual({
        level: 'level1',
        category: 'female',
        questionsTotal: 2,
        questionsWithAnswer: 2,
        questionsWithReviewedAnswer: 1,
      });
      expect(res.remedies).toEqual({ total: 1, categoriesMissingRemedy: ['male', 'other'] });
      expect(res.translations).toEqual([
        { lang: 'en', questionsTranslated: 2, questionsTotal: 2, answersTranslated: 1, answersTotal: 3, remediesTranslated: 0, remediesTotal: 1 },
        { lang: 'hi', questionsTranslated: 0, questionsTotal: 2, answersTranslated: 0, answersTotal: 3, remediesTranslated: 0, remediesTotal: 1 },
      ]);
      expect(res.chart).toEqual({ total: 5, aiFallbackCount: 2 });
      expect(res.imports).toEqual({
        total: 4,
        failed: 1,
        recentFailures: [{ id: 'imp1', type: 'questions', createdAt: '2026-08-01T00:00:00.000Z' }],
      });
    });
  });

  describe('contentMatrix()', () => {
    it('produces one cell per level/category with coverage, remedy, and translation counts', async () => {
      prisma.question.findMany.mockResolvedValue([
        { id: 'q1', level: 'level1', category: 'female' },
        { id: 'q2', level: 'level1', category: 'female' },
      ]);
      prisma.answer.findMany
        .mockResolvedValueOnce([{ questionId: 'q1' }]) // reviewed
        .mockResolvedValueOnce([
          { id: 'a1', questionId: 'q1', level: 'level1', category: 'female' },
          { id: 'a2', questionId: 'q2', level: 'level1', category: 'female' },
        ]); // all answers
      prisma.remedy.findMany.mockResolvedValue([{ category: 'female', linkedLevel: 'level1' }]);
      prisma.language.findMany.mockResolvedValue([{ code: 'en' }]);
      prisma.questionTranslation.findMany.mockResolvedValue([{ questionId: 'q1', lang: 'en' }]);
      prisma.answerTranslation.findMany.mockResolvedValue([{ answerId: 'a1', lang: 'en' }]);

      const res = await service.contentMatrix();

      expect(res.languages).toEqual(['en']);
      expect(res.cells).toHaveLength(9); // 3 levels x 3 categories
      const cell = res.cells.find((c) => c.level === 'level1' && c.category === 'female');
      expect(cell).toEqual({
        level: 'level1',
        category: 'female',
        questionsTotal: 2,
        questionsWithAnswer: 2,
        questionsWithReviewedAnswer: 1,
        remedyCount: 1,
        languages: [{ lang: 'en', questionsTranslated: 1, answersTranslated: 1 }],
      });
      const emptyCell = res.cells.find((c) => c.level === 'common' && c.category === 'male');
      expect(emptyCell).toEqual({
        level: 'common',
        category: 'male',
        questionsTotal: 0,
        questionsWithAnswer: 0,
        questionsWithReviewedAnswer: 0,
        remedyCount: 0,
        languages: [{ lang: 'en', questionsTranslated: 0, answersTranslated: 0 }],
      });
    });
  });
});
