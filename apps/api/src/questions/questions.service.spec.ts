import { NotFoundException } from '@nestjs/common';
import { QuestionsService } from './questions.service';
import { createPrismaMock, PrismaMock } from '../test-utils/prisma-mock';

describe('QuestionsService', () => {
  let prisma: PrismaMock;
  let service: QuestionsService;

  beforeEach(() => {
    prisma = createPrismaMock();
    service = new QuestionsService(prisma as never);
  });

  it('list() returns the pagination envelope', async () => {
    prisma.question.findMany.mockResolvedValue([
      { id: 'q1', level: 'common', category: 'male', text: 'Q1', order: 0, translations: [] },
    ]);
    prisma.question.count.mockResolvedValue(1);
    const res = await service.list({ page: 1, limit: 20 });
    expect(res).toEqual({
      data: [{ id: 'q1', level: 'common', category: 'male', text: 'Q1', order: 0 }],
      page: 1,
      limit: 20,
      total: 1,
    });
  });

  it('list() resolves the translated text for the requested lang', async () => {
    prisma.question.findMany.mockResolvedValue([
      { id: 'q1', level: 'common', category: 'male', text: 'Hello', order: 0, translations: [{ lang: 'hi', text: 'नमस्ते' }] },
    ]);
    prisma.question.count.mockResolvedValue(1);
    const res = await service.list({ lang: 'hi' });
    expect(res.data[0].text).toBe('नमस्ते');
  });

  it('list() searches base and translated question content', async () => {
    prisma.question.findMany.mockResolvedValue([]);
    prisma.question.count.mockResolvedValue(0);

    await service.list({ q: 'sleep' });

    const where = prisma.question.findMany.mock.calls[0][0].where;
    expect(where.OR).toEqual(
      expect.arrayContaining([
        { text: { contains: 'sleep', mode: 'insensitive' } },
        { helpText: { contains: 'sleep', mode: 'insensitive' } },
        { branchingTags: { contains: 'sleep', mode: 'insensitive' } },
      ]),
    );
    expect(where.OR).toContainEqual({
      translations: {
        some: {
          OR: [
            { text: { contains: 'sleep', mode: 'insensitive' } },
            { helpText: { contains: 'sleep', mode: 'insensitive' } },
          ],
        },
      },
    });
  });

  it('get() throws NotFound when the question does not exist', async () => {
    prisma.question.findUnique.mockResolvedValue(null);
    await expect(service.get('missing')).rejects.toBeInstanceOf(NotFoundException);
  });

  it('create() persists the base question and its translations', async () => {
    prisma.question.create.mockResolvedValue({ id: 'q9', level: 'common', category: 'female', text: 'Q', order: 3 });
    await service.create({ level: 'common', category: 'female', text: 'Q', order: 3, translations: { hi: 'x' } });
    const arg = prisma.question.create.mock.calls[0][0];
    expect(arg.data.translations.create).toEqual([{ lang: 'hi', text: 'x' }]);
  });

  it('remove() throws NotFound when the id is unknown', async () => {
    prisma.question.count.mockResolvedValue(0);
    await expect(service.remove('nope')).rejects.toBeInstanceOf(NotFoundException);
    expect(prisma.question.delete).not.toHaveBeenCalled();
  });
});
