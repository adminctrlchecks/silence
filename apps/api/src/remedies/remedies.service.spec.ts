import { NotFoundException } from '@nestjs/common';
import { RemediesService } from './remedies.service';
import { createPrismaMock, PrismaMock } from '../test-utils/prisma-mock';

describe('RemediesService', () => {
  let prisma: PrismaMock;
  let service: RemediesService;

  beforeEach(() => {
    prisma = createPrismaMock();
    service = new RemediesService(prisma as never);
  });

  it('list() returns the pagination envelope', async () => {
    prisma.remedy.findMany.mockResolvedValue([]);
    prisma.remedy.count.mockResolvedValue(0);
    const res = await service.list('female', undefined, 1, 5);
    expect(res).toEqual({ data: [], page: 1, limit: 5, total: 0 });
  });

  it('create() maps linkedTo to linkedLevel/linkedQuestionId', async () => {
    prisma.remedy.create.mockResolvedValue({ id: 'r1', category: 'female', title: 'T', text: 'X' });
    await service.create({ category: 'female', title: 'T', text: 'X', linkedTo: { level: 'level2', questionId: 'q1' } });
    const data = prisma.remedy.create.mock.calls[0][0].data;
    expect(data.linkedLevel).toBe('level2');
    expect(data.linkedQuestionId).toBe('q1');
  });

  it('forCategory() resolves the translated title/text when a lang is given', async () => {
    prisma.remedy.findFirst.mockResolvedValue({
      id: 'r1', category: 'female', title: 'Sleep', text: 'Base',
      translations: [{ lang: 'hi', title: 'नींद', text: 'अनुवाद' }],
    });
    const res = await service.forCategory('female', 'hi');
    expect(res.title).toBe('नींद');
    expect(res.text).toBe('अनुवाद');
  });

  it('forCategory() throws NotFound when none exists', async () => {
    prisma.remedy.findFirst.mockResolvedValue(null);
    await expect(service.forCategory('male')).rejects.toBeInstanceOf(NotFoundException);
  });

  it('create() persists rule fields (priority/enabled/filters)', async () => {
    prisma.remedy.create.mockResolvedValue({ id: 'r1', category: 'female', title: 'T', text: 'X' });
    await service.create({
      category: 'female',
      title: 'T',
      text: 'X',
      priority: 5,
      enabled: false,
      planetFilter: 'Saturn,Mars',
      signFilter: 'Capricorn',
      houseFilter: '6,8,12',
      keywordFilter: 'tired,burnout',
    });
    const data = prisma.remedy.create.mock.calls[0][0].data;
    expect(data).toMatchObject({
      priority: 5,
      enabled: false,
      planetFilter: 'Saturn,Mars',
      signFilter: 'Capricorn',
      houseFilter: '6,8,12',
      keywordFilter: 'tired,burnout',
    });
  });

  describe('selectRemedy()', () => {
    const base = {
      id: 'generic',
      category: 'female' as const,
      title: 'Generic',
      text: 'General guidance.',
      linkedLevel: null,
      linkedQuestionId: null,
      priority: 0,
      enabled: true,
      planetFilter: null,
      signFilter: null,
      houseFilter: null,
      keywordFilter: null,
      updatedAt: new Date('2026-01-01'),
    };

    it('throws NotFound when the category has no enabled remedies', async () => {
      prisma.remedy.findMany.mockResolvedValue([]);
      await expect(service.selectRemedy({ category: 'female' })).rejects.toBeInstanceOf(NotFoundException);
    });

    it('falls back to a filterless remedy when nothing more specific matches', async () => {
      prisma.remedy.findMany.mockResolvedValue([base]);
      const res = await service.selectRemedy({ category: 'female' });
      expect(res).toMatchObject({ id: 'generic', source: 'category', matchDetail: 'category fallback' });
    });

    it('prefers a remedy whose planetFilter matches a chart placement over the category fallback', async () => {
      const saturnRemedy = { ...base, id: 'saturn-rx', planetFilter: 'Saturn', updatedAt: new Date('2026-01-02') };
      prisma.remedy.findMany.mockResolvedValue([base, saturnRemedy]);

      const res = await service.selectRemedy({
        category: 'female',
        chartData: { placements: [{ planet: 'Saturn', signName: 'Capricorn', house: 6 }] },
      });

      expect(res.id).toBe('saturn-rx');
      expect(res.source).toBe('rule');
      expect(res.matchDetail).toContain('chart placement: Saturn');
    });

    it('excludes a remedy whose declared filter does not match (does not fall through to it)', async () => {
      const marsRemedy = { ...base, id: 'mars-rx', planetFilter: 'Mars' };
      prisma.remedy.findMany.mockResolvedValue([marsRemedy]);

      await expect(
        service.selectRemedy({ category: 'female', chartData: { placements: [{ planet: 'Saturn', house: 6 }] } }),
      ).rejects.toBeInstanceOf(NotFoundException);
    });

    it('matches keywordFilter against response text (case-insensitive)', async () => {
      const burnoutRemedy = { ...base, id: 'burnout-rx', keywordFilter: 'burnout,exhausted' };
      prisma.remedy.findMany.mockResolvedValue([base, burnoutRemedy]);

      const res = await service.selectRemedy({
        category: 'female',
        responses: [{ level: 'level2', questionId: 'q1', value: 'I feel totally BURNOUT lately' }],
      });

      expect(res.id).toBe('burnout-rx');
      expect(res.matchDetail).toContain('response mentions "burnout"');
    });

    it('requires ALL of a remedy\'s declared filters to match (AND semantics)', async () => {
      const combo = { ...base, id: 'combo-rx', planetFilter: 'Saturn', keywordFilter: 'burnout' };
      prisma.remedy.findMany.mockResolvedValue([base, combo]);

      // Chart matches Saturn, but no response mentions "burnout" -> combo is ineligible, falls back to generic.
      const res = await service.selectRemedy({
        category: 'female',
        chartData: { placements: [{ planet: 'Saturn', house: 6 }] },
        responses: [{ level: 'level2', questionId: 'q1', value: 'all is well' }],
      });
      expect(res.id).toBe('generic');
    });

    it('prefers more matched filters over fewer, then priority as a tie-breaker', async () => {
      const singleMatch = { ...base, id: 'single', planetFilter: 'Saturn', priority: 10 };
      const doubleMatch = { ...base, id: 'double', planetFilter: 'Saturn', keywordFilter: 'burnout', priority: 0 };
      prisma.remedy.findMany.mockResolvedValue([singleMatch, doubleMatch]);

      const res = await service.selectRemedy({
        category: 'female',
        chartData: { placements: [{ planet: 'Saturn', house: 6 }] },
        responses: [{ level: 'level2', questionId: 'q1', value: 'burnout' }],
      });
      // double has 2 matched filters vs single's 1 -> wins despite lower priority.
      expect(res.id).toBe('double');
    });

    it('honors linkedQuestionId + linkedLevel, requiring that exact question to be answered', async () => {
      const linked = { ...base, id: 'linked-rx', linkedLevel: 'level2', linkedQuestionId: 'q9' };
      prisma.remedy.findMany.mockResolvedValue([base, linked]);

      const noMatch = await service.selectRemedy({
        category: 'female',
        responses: [{ level: 'level1', questionId: 'q9', value: 'x' }], // wrong level
      });
      expect(noMatch.id).toBe('generic');

      const match = await service.selectRemedy({
        category: 'female',
        responses: [{ level: 'level2', questionId: 'q9', value: 'x' }],
      });
      expect(match.id).toBe('linked-rx');
    });
  });
});
