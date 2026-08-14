import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { SessionsService } from './sessions.service';
import { createPrismaMock, PrismaMock } from '../test-utils/prisma-mock';

const USER = {
  id: 'u1',
  name: 'Asha',
  category: 'female' as const,
  dob: '1998-04-21',
  timeOfBirth: '07:35',
  placeCity: 'Chennai',
  placeCountry: 'IN',
  placeLat: 13.08,
  placeLng: 80.27,
  placeTimezone: 'Asia/Kolkata',
  contact: 'asha@example.com',
  passwordHash: 'hash',
  lang: 'en',
  consent: true,
  createdAt: new Date(),
  updatedAt: new Date(),
};

function sessionRow(overrides: Partial<Record<string, unknown>> = {}) {
  return {
    id: 's1',
    userId: 'u1',
    status: 'draft',
    category: 'female',
    lang: 'en',
    startedAt: new Date('2026-01-01T00:00:00Z'),
    completedAt: null,
    updatedAt: new Date('2026-01-01T00:00:00Z'),
    responses: [],
    charts: [],
    remedyResult: null,
    ...overrides,
  };
}

describe('SessionsService', () => {
  let prisma: PrismaMock;
  let service: SessionsService;

  beforeEach(() => {
    prisma = createPrismaMock();
    service = new SessionsService(prisma as never);
    prisma.question.groupBy.mockResolvedValue([
      { level: 'common', _count: { _all: 2 } },
      { level: 'level1', _count: { _all: 1 } },
      { level: 'level2', _count: { _all: 3 } },
    ]);
  });

  describe('profileCompleteness()', () => {
    it('is 100% when every field is present, including exact coordinates', () => {
      const result = service.profileCompleteness(USER);
      expect(result).toEqual({ percent: 100, missingFields: [] });
    });

    it('flags missing coordinates without requiring them at registration', () => {
      const result = service.profileCompleteness({ ...USER, placeLat: null, placeLng: null });
      expect(result.missingFields).toEqual(['placeCoordinates']);
      expect(result.percent).toBeLessThan(100);
    });
  });

  describe('startOrResume()', () => {
    it('returns the existing non-complete session instead of creating a new one', async () => {
      prisma.readingSession.findFirst.mockResolvedValue(sessionRow());

      const result = await service.startOrResume('u1');

      expect(prisma.readingSession.create).not.toHaveBeenCalled();
      expect(result).toMatchObject({ id: 's1', status: 'draft' });
    });

    it('creates a new draft session from the user profile when none exists', async () => {
      prisma.readingSession.findFirst.mockResolvedValue(null);
      prisma.user.findUnique.mockResolvedValue(USER);
      prisma.readingSession.create.mockResolvedValue(sessionRow({ id: 's2' }));

      const result = await service.startOrResume('u1');

      expect(prisma.readingSession.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: { userId: 'u1', category: 'female', lang: 'en', status: 'draft' },
        }),
      );
      expect(result.id).toBe('s2');
    });

    it('throws NotFound when the user does not exist', async () => {
      prisma.readingSession.findFirst.mockResolvedValue(null);
      prisma.user.findUnique.mockResolvedValue(null);
      await expect(service.startOrResume('missing')).rejects.toBeInstanceOf(NotFoundException);
    });
  });

  describe('findOwned()', () => {
    it('throws NotFound for an unknown session', async () => {
      prisma.readingSession.findUnique.mockResolvedValue(null);
      await expect(service.findOwned('u1', 's1')).rejects.toBeInstanceOf(NotFoundException);
    });

    it('throws Forbidden when the session belongs to another user', async () => {
      prisma.readingSession.findUnique.mockResolvedValue(sessionRow({ userId: 'someone-else' }));
      await expect(service.findOwned('u1', 's1')).rejects.toBeInstanceOf(ForbiddenException);
    });

    it('returns the session when owned by the caller', async () => {
      prisma.readingSession.findUnique.mockResolvedValue(sessionRow());
      const result = await service.findOwned('u1', 's1');
      expect(result.id).toBe('s1');
    });
  });

  describe('question progress', () => {
    it('counts distinct answered questions per level from responses', async () => {
      prisma.readingSession.findFirst.mockResolvedValue(
        sessionRow({
          responses: [
            { level: 'common', questionId: 'q1', value: 'yes' },
            { level: 'common', questionId: 'q1', value: 'yes again' }, // same question re-answered
            { level: 'level2', questionId: 'q9', value: '  ' }, // blank, doesn't count
          ],
        }),
      );

      const result = await service.getActive('u1');

      expect(result?.questionProgress).toEqual({
        common: { answered: 1, total: 2 },
        level1: { answered: 0, total: 1 },
        level2: { answered: 0, total: 3 },
      });
    });
  });

  describe('markResponsesSaved()', () => {
    it('moves a draft session to in_progress', async () => {
      await service.markResponsesSaved('s1');
      expect(prisma.readingSession.updateMany).toHaveBeenCalledWith({
        where: { id: 's1', status: 'draft' },
        data: { status: 'in_progress' },
      });
    });
  });

  describe('markChartReady()', () => {
    it('moves draft/in_progress sessions to chart_ready', async () => {
      await service.markChartReady('s1');
      expect(prisma.readingSession.updateMany).toHaveBeenCalledWith({
        where: { id: 's1', status: { in: ['draft', 'in_progress'] } },
        data: { status: 'chart_ready' },
      });
    });
  });

  describe('remedy snapshot', () => {
    it('getRemedySnapshot() returns null when nothing was recorded yet', async () => {
      prisma.remedyResult.findUnique.mockResolvedValue(null);
      const result = await service.getRemedySnapshot('s1');
      expect(result).toBeNull();
    });

    it('getRemedySnapshot() replays the stored remedy using the session category', async () => {
      prisma.remedyResult.findUnique.mockResolvedValue({
        id: 'r1', sessionId: 's1', remedyId: 'remedy-1', title: 'Sleep hygiene', text: 'Keep a bedtime.',
        linkedLevel: 'level2', linkedQuestionId: 'q1', source: 'category', createdAt: new Date(),
      });
      prisma.readingSession.findUniqueOrThrow.mockResolvedValue(sessionRow());

      const result = await service.getRemedySnapshot('s1');

      expect(result).toEqual({
        id: 'remedy-1',
        category: 'female',
        title: 'Sleep hygiene',
        text: 'Keep a bedtime.',
        linkedLevel: 'level2',
        linkedQuestionId: 'q1',
        source: 'category',
        matchDetail: undefined,
      });
    });

    it('recordRemedy() snapshots the remedy and marks the session complete', async () => {
      await service.recordRemedy('s1', {
        id: 'remedy-1',
        category: 'female',
        title: 'Sleep hygiene',
        text: 'Keep a bedtime.',
        linkedLevel: 'level2',
        linkedQuestionId: 'q1',
      });

      expect(prisma.remedyResult.create).toHaveBeenCalledWith({
        data: {
          sessionId: 's1',
          remedyId: 'remedy-1',
          title: 'Sleep hygiene',
          text: 'Keep a bedtime.',
          linkedLevel: 'level2',
          linkedQuestionId: 'q1',
          source: 'category',
        },
      });
      expect(prisma.readingSession.update).toHaveBeenCalledWith({
        where: { id: 's1' },
        data: { status: 'complete', completedAt: expect.any(Date) },
      });
    });
  });

  describe('dashboard()', () => {
    it('computes nextStep=start_reading when there is no active session', async () => {
      prisma.user.findUnique.mockResolvedValue(USER);
      prisma.readingSession.findFirst.mockResolvedValue(null);
      prisma.readingSession.count.mockResolvedValue(2);

      const result = await service.dashboard('u1');

      expect(result.nextStep).toBe('start_reading');
      expect(result.activeSession).toBeNull();
      expect(result.totalSessions).toBe(2);
      expect(result.profile.percent).toBe(100);
    });

    it('computes nextStep=continue_questions when level2 is incomplete', async () => {
      prisma.user.findUnique.mockResolvedValue(USER);
      prisma.readingSession.findFirst.mockResolvedValue(
        sessionRow({ responses: [{ level: 'level2', questionId: 'q1', value: 'a' }] }),
      );
      prisma.readingSession.count.mockResolvedValue(1);

      const result = await service.dashboard('u1');
      expect(result.nextStep).toBe('continue_questions'); // 1 of 3 level2 questions answered
    });

    it('computes nextStep=view_chart once level2 is complete but no chart exists', async () => {
      prisma.user.findUnique.mockResolvedValue(USER);
      prisma.readingSession.findFirst.mockResolvedValue(
        sessionRow({
          responses: [
            { level: 'common', questionId: 'c1', value: 'a' },
            { level: 'common', questionId: 'c2', value: 'a' },
            { level: 'level1', questionId: 'l1', value: 'a' },
            { level: 'level2', questionId: 'q1', value: 'a' },
            { level: 'level2', questionId: 'q2', value: 'a' },
            { level: 'level2', questionId: 'q3', value: 'a' },
          ],
        }),
      );
      prisma.readingSession.count.mockResolvedValue(1);

      const result = await service.dashboard('u1');
      expect(result.nextStep).toBe('view_chart');
    });

    it('computes nextStep=view_remedy once a chart exists but no remedy yet', async () => {
      prisma.user.findUnique.mockResolvedValue(USER);
      prisma.readingSession.findFirst.mockResolvedValue(
        sessionRow({
          responses: [
            { level: 'common', questionId: 'c1', value: 'a' },
            { level: 'common', questionId: 'c2', value: 'a' },
            { level: 'level1', questionId: 'l1', value: 'a' },
            { level: 'level2', questionId: 'q1', value: 'a' },
            { level: 'level2', questionId: 'q2', value: 'a' },
            { level: 'level2', questionId: 'q3', value: 'a' },
          ],
          charts: [{ id: 'c1' }],
        }),
      );
      prisma.readingSession.count.mockResolvedValue(1);

      const result = await service.dashboard('u1');
      expect(result.nextStep).toBe('view_remedy');
    });
  });
});
