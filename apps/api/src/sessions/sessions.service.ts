import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import type {
  Category,
  DashboardSummary,
  Level,
  NextStep,
  QuestionProgress,
  ReadingSessionDetail,
  ReadingSessionSummary,
  Remedy,
} from '@silence/shared';
import { LEVELS } from '@silence/shared';
import type { ReadingSession, RemedyResult, User, UserChart, UserResponse } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { paginated, parsePageParams } from '../common/pagination';

const PROFILE_FIELDS: Array<{ key: string; present: (u: User) => boolean }> = [
  { key: 'name', present: (u) => Boolean(u.name?.trim()) },
  { key: 'category', present: (u) => Boolean(u.category) },
  { key: 'dob', present: (u) => Boolean(u.dob?.trim()) },
  { key: 'timeOfBirth', present: (u) => Boolean(u.timeOfBirth?.trim()) },
  { key: 'placeCity', present: (u) => Boolean(u.placeCity?.trim()) },
  { key: 'placeCountry', present: (u) => Boolean(u.placeCountry?.trim()) },
  // Exact coordinates aren't required at registration, but they matter for chart accuracy.
  { key: 'placeCoordinates', present: (u) => u.placeLat != null && u.placeLng != null },
  { key: 'contact', present: (u) => Boolean(u.contact?.trim()) },
  { key: 'lang', present: (u) => Boolean(u.lang?.trim()) },
  { key: 'consent', present: (u) => u.consent === true },
];

type SessionWithRelations = ReadingSession & {
  responses: UserResponse[];
  charts: UserChart[];
  remedyResult: RemedyResult | null;
};

/** answered/total question counts per level, for one category. */
type LevelTotals = Record<Level, number>;

@Injectable()
export class SessionsService {
  constructor(private readonly prisma: PrismaService) {}

  profileCompleteness(user: User) {
    const missingFields = PROFILE_FIELDS.filter((f) => !f.present(user)).map((f) => f.key);
    const percent = Math.round(((PROFILE_FIELDS.length - missingFields.length) / PROFILE_FIELDS.length) * 100);
    return { percent, missingFields };
  }

  /** Returns the user's current non-complete session, or null if none is in progress. */
  async getActive(userId: string): Promise<ReadingSessionSummary | null> {
    const session = await this.prisma.readingSession.findFirst({
      where: { userId, status: { not: 'complete' } },
      orderBy: { startedAt: 'desc' },
      include: { responses: true, charts: true, remedyResult: true },
    });
    if (!session) return null;
    return this.toSummary(session, await this.levelTotals(session.category as Category));
  }

  /** Returns the user's active session, creating one if none exists. */
  async startOrResume(userId: string): Promise<ReadingSessionSummary> {
    const existing = await this.prisma.readingSession.findFirst({
      where: { userId, status: { not: 'complete' } },
      orderBy: { startedAt: 'desc' },
      include: { responses: true, charts: true, remedyResult: true },
    });
    const session =
      existing ??
      (await this.prisma.readingSession.create({
        data: await this.newSessionData(userId),
        include: { responses: true, charts: true, remedyResult: true },
      }));
    return this.toSummary(session, await this.levelTotals(session.category as Category));
  }

  async list(userId: string, page?: number, limit?: number) {
    const pp = parsePageParams(page, limit);
    const [rows, total] = await this.prisma.$transaction([
      this.prisma.readingSession.findMany({
        where: { userId },
        orderBy: { startedAt: 'desc' },
        skip: pp.skip,
        take: pp.take,
        include: { responses: true, charts: true, remedyResult: true },
      }),
      this.prisma.readingSession.count({ where: { userId } }),
    ]);

    const totalsByCategory = new Map<Category, LevelTotals>();
    const summaries = await Promise.all(
      rows.map(async (s) => {
        const category = s.category as Category;
        if (!totalsByCategory.has(category)) totalsByCategory.set(category, await this.levelTotals(category));
        return this.toSummary(s, totalsByCategory.get(category)!);
      }),
    );
    return paginated(summaries, pp.page, pp.limit, total);
  }

  async getDetail(userId: string, sessionId: string): Promise<ReadingSessionDetail> {
    const session = await this.findOwned(userId, sessionId);
    const chart = session.charts.at(-1) ?? null;
    const summary = this.toSummary(session, await this.levelTotals(session.category as Category));
    return {
      ...summary,
      responses: [...session.responses]
        .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime())
        .map((r) => ({
          id: r.id,
          userId: r.userId,
          questionId: r.questionId,
          level: r.level,
          category: r.category,
          value: r.value,
          answerId: r.answerId ?? undefined,
          answerTextShown: r.answerTextShown ?? undefined,
          createdAt: r.createdAt.toISOString(),
        })),
      chart: chart
        ? {
            id: chart.id,
            userId: chart.userId,
            category: chart.category,
            type: chart.type,
            style: chart.style,
            data: chart.data,
            interpretation: chart.interpretation,
            createdAt: chart.createdAt.toISOString(),
          }
        : null,
      remedy: session.remedyResult
        ? {
            id: session.remedyResult.id,
            remedyId: session.remedyResult.remedyId ?? undefined,
            title: session.remedyResult.title,
            text: session.remedyResult.text,
            source: session.remedyResult.source,
            createdAt: session.remedyResult.createdAt.toISOString(),
          }
        : null,
    };
  }

  /** Ownership check + existence check, shared by every session-scoped operation. */
  async findOwned(userId: string, sessionId: string): Promise<SessionWithRelations> {
    const session = await this.prisma.readingSession.findUnique({
      where: { id: sessionId },
      include: { responses: true, charts: true, remedyResult: true },
    });
    if (!session) throw new NotFoundException('Reading session not found');
    if (session.userId !== userId) throw new ForbiddenException('You can only access your own reading sessions');
    return session;
  }

  /** Called after responses are saved for a session: draft -> in_progress. */
  async markResponsesSaved(sessionId: string) {
    await this.prisma.readingSession.updateMany({
      where: { id: sessionId, status: 'draft' },
      data: { status: 'in_progress' },
    });
  }

  /** Called after a chart is generated for a session: -> chart_ready. */
  async markChartReady(sessionId: string) {
    await this.prisma.readingSession.updateMany({
      where: { id: sessionId, status: { in: ['draft', 'in_progress'] } },
      data: { status: 'chart_ready' },
    });
  }

  /**
   * Returns the remedy already snapshotted for this session, if any — keeps the
   * remedy stable across reloads within one reading instead of re-resolving it.
   */
  async getRemedySnapshot(sessionId: string): Promise<Remedy | null> {
    const snapshot = await this.prisma.remedyResult.findUnique({ where: { sessionId } });
    if (!snapshot) return null;
    const session = await this.prisma.readingSession.findUniqueOrThrow({ where: { id: sessionId } });
    return {
      id: snapshot.remedyId ?? snapshot.id,
      category: session.category as Category,
      title: snapshot.title,
      text: snapshot.text,
      linkedLevel: snapshot.linkedLevel ?? undefined,
      linkedQuestionId: snapshot.linkedQuestionId ?? undefined,
    };
  }

  /** Snapshots the remedy shown for a session: -> complete. */
  async recordRemedy(sessionId: string, remedy: Remedy) {
    await this.prisma.remedyResult.create({
      data: {
        sessionId,
        remedyId: remedy.id,
        title: remedy.title,
        text: remedy.text,
        linkedLevel: remedy.linkedLevel,
        linkedQuestionId: remedy.linkedQuestionId,
        source: 'category',
      },
    });
    await this.prisma.readingSession.update({
      where: { id: sessionId },
      data: { status: 'complete', completedAt: new Date() },
    });
  }

  async dashboard(userId: string): Promise<DashboardSummary> {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    const [activeSession, totalSessions] = await Promise.all([
      this.getActive(user.id),
      this.prisma.readingSession.count({ where: { userId: user.id } }),
    ]);

    return {
      profile: this.profileCompleteness(user),
      activeSession,
      nextStep: this.computeNextStep(activeSession),
      totalSessions,
    };
  }

  private async newSessionData(userId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');
    return { userId, category: user.category, lang: user.lang, status: 'draft' as const };
  }

  private computeNextStep(session: ReadingSessionSummary | null): NextStep {
    if (!session) return 'start_reading';
    const level2 = session.questionProgress.level2;
    const level2Complete = level2.total > 0 && level2.answered >= level2.total;
    if (!level2Complete) return 'continue_questions';
    if (!session.hasChart) return 'view_chart';
    if (!session.hasRemedy) return 'view_remedy';
    return 'view_history';
  }

  /** Total question count per level for a category — used to compute progress percentages. */
  private async levelTotals(category: Category): Promise<LevelTotals> {
    const rows = await this.prisma.question.groupBy({
      by: ['level'],
      where: { category },
      _count: { _all: true },
    });
    const totals = { common: 0, level1: 0, level2: 0 } as LevelTotals;
    for (const row of rows) totals[row.level as Level] = row._count._all;
    return totals;
  }

  private toSummary(session: SessionWithRelations, totals: LevelTotals): ReadingSessionSummary {
    return {
      id: session.id,
      status: session.status,
      category: session.category as Category,
      lang: session.lang,
      startedAt: session.startedAt.toISOString(),
      completedAt: session.completedAt?.toISOString() ?? null,
      updatedAt: session.updatedAt.toISOString(),
      questionProgress: this.countProgress(session.responses, totals),
      hasChart: session.charts.length > 0,
      hasRemedy: session.remedyResult != null,
    };
  }

  private countProgress(responses: UserResponse[], totals: LevelTotals): QuestionProgress {
    const answeredByLevel = new Map<Level, Set<string>>();
    for (const level of LEVELS) answeredByLevel.set(level, new Set());
    for (const r of responses) {
      if (r.value.trim()) answeredByLevel.get(r.level as Level)?.add(r.questionId);
    }
    return {
      common: { answered: answeredByLevel.get('common')!.size, total: totals.common },
      level1: { answered: answeredByLevel.get('level1')!.size, total: totals.level1 },
      level2: { answered: answeredByLevel.get('level2')!.size, total: totals.level2 },
    };
  }
}
