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
});
