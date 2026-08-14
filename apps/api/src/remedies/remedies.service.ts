import { Injectable, NotFoundException } from '@nestjs/common';
import type { Prisma } from '@prisma/client';
import type { Category, Level, CreateRemedyInput, UpdateRemedyInput } from '@silence/shared';
import { PrismaService } from '../prisma/prisma.service';
import { parsePageParams, paginated } from '../common/pagination';

/** Minimal chart geometry shape RemediesService reads — see AstrologyService.compute output. */
type ChartGeometry = {
  ascendant?: { signName?: string } | null;
  placements?: Array<{ planet?: string; signName?: string; house?: number }>;
};

interface ResponseSignal {
  level: Level;
  questionId: string;
  value: string;
}

interface SelectRemedyParams {
  category: Category;
  lang?: string;
  /** UserChart.data for the session, if a chart has been generated yet. */
  chartData?: unknown;
  /** The session's saved responses, used for linkedQuestionId + keywordFilter matching. */
  responses?: ResponseSignal[];
}

function splitFilter(value: string): string[] {
  return value
    .split(',')
    .map((v) => v.trim())
    .filter(Boolean);
}

@Injectable()
export class RemediesService {
  constructor(private readonly prisma: PrismaService) {}

  async list(category?: Category, lang?: string, page?: number, limit?: number, q?: string) {
    const search = q?.trim();
    const where: Prisma.RemedyWhereInput = {
      ...(category && { category }),
      ...(search && {
        OR: [
          { title: { contains: search, mode: 'insensitive' } },
          { text: { contains: search, mode: 'insensitive' } },
          { planetFilter: { contains: search, mode: 'insensitive' } },
          { signFilter: { contains: search, mode: 'insensitive' } },
          { houseFilter: { contains: search, mode: 'insensitive' } },
          { keywordFilter: { contains: search, mode: 'insensitive' } },
          {
            translations: {
              some: {
                OR: [
                  { title: { contains: search, mode: 'insensitive' } },
                  { text: { contains: search, mode: 'insensitive' } },
                ],
              },
            },
          },
        ],
      }),
    };
    const pp = parsePageParams(page, limit);
    const [rows, total] = await this.prisma.$transaction([
      this.prisma.remedy.findMany({
        where,
        include: { translations: lang ? { where: { lang } } : false },
        skip: pp.skip,
        take: pp.take,
      }),
      this.prisma.remedy.count({ where }),
    ]);
    return paginated(rows.map((r) => this.present(r, lang)), pp.page, pp.limit, total);
  }

  async create(input: CreateRemedyInput) {
    const r = await this.prisma.remedy.create({
      data: {
        category: input.category,
        title: input.title,
        text: input.text,
        linkedLevel: input.linkedTo?.level,
        linkedQuestionId: input.linkedTo?.questionId,
        priority: input.priority ?? 0,
        enabled: input.enabled ?? true,
        planetFilter: input.planetFilter,
        signFilter: input.signFilter,
        houseFilter: input.houseFilter,
        keywordFilter: input.keywordFilter,
        translations: input.translations
          ? { create: Object.entries(input.translations).map(([l, text]) => ({ lang: l, title: input.title, text })) }
          : undefined,
      },
    });
    return this.present(r);
  }

  async update(id: string, input: UpdateRemedyInput) {
    await this.ensureExists(id);
    const r = await this.prisma.remedy.update({
      where: { id },
      data: {
        category: input.category,
        title: input.title,
        text: input.text,
        linkedLevel: input.linkedTo?.level,
        linkedQuestionId: input.linkedTo?.questionId,
        priority: input.priority,
        enabled: input.enabled,
        planetFilter: input.planetFilter,
        signFilter: input.signFilter,
        houseFilter: input.houseFilter,
        keywordFilter: input.keywordFilter,
      },
    });
    return this.present(r);
  }

  async remove(id: string) {
    await this.ensureExists(id);
    await this.prisma.remedy.delete({ where: { id } });
    return { deleted: true };
  }

  /** Public: the remedy shown to a user, resolved for their category + language (no session context). */
  async forCategory(category: Category, lang?: string) {
    const r = await this.prisma.remedy.findFirst({
      where: { category, enabled: true },
      orderBy: { updatedAt: 'desc' },
      include: { translations: lang ? { where: { lang } } : false },
    });
    if (!r) throw new NotFoundException('Remedy not found');
    return { ...this.present(r, lang), source: 'category' as const };
  }

  /**
   * Rule-based remedy selection for one reading: chooses among the category's
   * enabled remedies, preferring the most specific match.
   *
   * A remedy's rule fields (linkedQuestionId, planetFilter, signFilter,
   * houseFilter, keywordFilter) are optional and AND-combined — every filter
   * a remedy declares must match for it to be eligible. Among eligible
   * remedies, more matched filters wins (more specific/personalized beats
   * generic), then `priority`, then most recently updated. A remedy with no
   * filters at all is always eligible as a category fallback, so there is
   * always a result as long as the category has at least one enabled remedy.
   */
  async selectRemedy(params: SelectRemedyParams) {
    const candidates = await this.prisma.remedy.findMany({
      where: { category: params.category, enabled: true },
      include: { translations: params.lang ? { where: { lang: params.lang } } : false },
    });
    if (!candidates.length) throw new NotFoundException('Remedy not found');

    const geo = params.chartData as ChartGeometry | undefined;
    const chartPlanets = new Set(
      (geo?.placements ?? []).map((p) => p.planet?.toLowerCase()).filter((p): p is string => Boolean(p)),
    );
    const chartSigns = new Set(
      [geo?.ascendant?.signName, ...(geo?.placements ?? []).map((p) => p.signName)]
        .filter((s): s is string => Boolean(s))
        .map((s) => s.toLowerCase()),
    );
    const chartHouses = new Set(
      (geo?.placements ?? [])
        .map((p) => (p.house != null ? String(p.house) : undefined))
        .filter((h): h is string => Boolean(h)),
    );

    const responses = params.responses ?? [];
    const responseText = responses.map((r) => r.value?.toLowerCase() ?? '').join('\n');
    const answeredQuestionIds = new Set(responses.map((r) => r.questionId));
    const answeredLevelQuestion = new Set(responses.map((r) => `${r.level}:${r.questionId}`));

    const scored: Array<{ remedy: (typeof candidates)[number]; filterCount: number; reasons: string[] }> = [];

    for (const r of candidates) {
      const reasons: string[] = [];
      let filterCount = 0;
      let eligible = true;

      if (r.linkedQuestionId) {
        filterCount++;
        const matched = r.linkedLevel
          ? answeredLevelQuestion.has(`${r.linkedLevel}:${r.linkedQuestionId}`)
          : answeredQuestionIds.has(r.linkedQuestionId);
        if (matched) reasons.push('linked question answered');
        else eligible = false;
      }
      if (r.planetFilter) {
        filterCount++;
        const hit = splitFilter(r.planetFilter).find((p) => chartPlanets.has(p.toLowerCase()));
        if (hit) reasons.push(`chart placement: ${hit}`);
        else eligible = false;
      }
      if (r.signFilter) {
        filterCount++;
        const hit = splitFilter(r.signFilter).find((s) => chartSigns.has(s.toLowerCase()));
        if (hit) reasons.push(`chart sign: ${hit}`);
        else eligible = false;
      }
      if (r.houseFilter) {
        filterCount++;
        const hit = splitFilter(r.houseFilter).find((h) => chartHouses.has(h));
        if (hit) reasons.push(`chart house ${hit}`);
        else eligible = false;
      }
      if (r.keywordFilter) {
        filterCount++;
        const hit = splitFilter(r.keywordFilter).find((k) => responseText.includes(k.toLowerCase()));
        if (hit) reasons.push(`response mentions "${hit}"`);
        else eligible = false;
      }

      if (!eligible) continue;
      if (filterCount === 0) reasons.push('category fallback');
      scored.push({ remedy: r, filterCount, reasons });
    }

    if (!scored.length) throw new NotFoundException('Remedy not found');

    scored.sort(
      (a, b) =>
        b.filterCount - a.filterCount ||
        b.remedy.priority - a.remedy.priority ||
        b.remedy.updatedAt.getTime() - a.remedy.updatedAt.getTime(),
    );

    const winner = scored[0];
    return {
      ...this.present(winner.remedy, params.lang),
      source: (winner.filterCount > 0 ? 'rule' : 'category') as 'rule' | 'category',
      matchDetail: winner.reasons.join('; '),
    };
  }

  private async ensureExists(id: string) {
    const exists = await this.prisma.remedy.count({ where: { id } });
    if (!exists) throw new NotFoundException('Remedy not found');
  }

  private present(
    r: {
      id: string;
      category: Category;
      title: string;
      text: string;
      linkedLevel?: Level | null;
      linkedQuestionId?: string | null;
      priority: number;
      enabled: boolean;
      planetFilter?: string | null;
      signFilter?: string | null;
      houseFilter?: string | null;
      keywordFilter?: string | null;
      translations?: { lang: string; title: string; text: string }[];
    },
    lang?: string,
  ) {
    const t = lang ? r.translations?.find((x) => x.lang === lang) : undefined;
    return {
      id: r.id,
      category: r.category,
      title: t?.title ?? r.title,
      text: t?.text ?? r.text,
      linkedLevel: r.linkedLevel ?? undefined,
      linkedQuestionId: r.linkedQuestionId ?? undefined,
      priority: r.priority,
      enabled: r.enabled,
      planetFilter: r.planetFilter,
      signFilter: r.signFilter,
      houseFilter: r.houseFilter,
      keywordFilter: r.keywordFilter,
    };
  }
}
