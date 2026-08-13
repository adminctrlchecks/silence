import { NotFoundException } from '@nestjs/common';
import { AnswersService } from './answers.service';
import { createPrismaMock, PrismaMock } from '../test-utils/prisma-mock';

function geminiStub() {
  return {
    generateAnswer: jest.fn().mockResolvedValue('AI answer text'),
    translate: jest.fn().mockResolvedValue('translated'),
  };
}

describe('AnswersService', () => {
  let prisma: PrismaMock;
  let gemini: ReturnType<typeof geminiStub>;
  let service: AnswersService;

  beforeEach(() => {
    prisma = createPrismaMock();
    gemini = geminiStub();
    service = new AnswersService(prisma as never, gemini as never);
  });

  it('list() returns the pagination envelope', async () => {
    prisma.answer.findMany.mockResolvedValue([]);
    prisma.answer.count.mockResolvedValue(0);
    const res = await service.list({ page: 1, limit: 10 });
    expect(res).toEqual({ data: [], page: 1, limit: 10, total: 0 });
  });

  it('create() marks admin answers reviewed', async () => {
    prisma.answer.create.mockResolvedValue({ id: 'a1', questionId: 'q1', level: 'level1', category: 'male', text: 't', source: 'admin', reviewed: true });
    await service.create({ questionId: 'q1', level: 'level1', category: 'male', text: 't', source: 'admin' });
    expect(prisma.answer.create.mock.calls[0][0].data.reviewed).toBe(true);
  });

  it('aiGenerate() calls Gemini and saves an unreviewed AI answer', async () => {
    prisma.question.findUnique.mockResolvedValue({ id: 'q1', text: 'Question?' });
    prisma.answer.create.mockResolvedValue({ id: 'a2', text: 'AI answer text' });
    const res = await service.aiGenerate({ questionId: 'q1', level: 'level1', category: 'male', lang: 'en' });
    expect(gemini.generateAnswer).toHaveBeenCalledWith(
      expect.objectContaining({ questionText: 'Question?', level: 'level1' }),
    );
    expect(prisma.answer.create.mock.calls[0][0].data).toMatchObject({ source: 'ai', reviewed: false });
    expect(res).toMatchObject({ source: 'ai', saved: true, reviewed: false });
  });

  it('aiGenerate() throws NotFound for an unknown question', async () => {
    prisma.question.findUnique.mockResolvedValue(null);
    await expect(
      service.aiGenerate({ questionId: 'x', level: 'level1', category: 'male', lang: 'en' }),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it('publicAnswer() only returns reviewed answers, else 404', async () => {
    prisma.answer.findFirst.mockResolvedValue(null);
    await expect(service.publicAnswer('q1', 'level1', 'male')).rejects.toBeInstanceOf(NotFoundException);
    expect(prisma.answer.findFirst.mock.calls[0][0].where.reviewed).toBe(true);
  });

  it('publicAnswer() resolves translated text for the requested lang', async () => {
    prisma.answer.findFirst.mockResolvedValue({
      id: 'a1',
      questionId: 'q1',
      level: 'level1',
      category: 'female',
      text: 'Base answer',
      source: 'admin',
      reviewed: true,
      translations: [{ lang: 'hi', text: 'Hindi answer' }],
    });

    const res = await service.publicAnswer('q1', 'level1', 'female', 'hi');

    expect(prisma.answer.findFirst.mock.calls[0][0].include.translations.where).toEqual({ lang: 'hi' });
    expect(res.text).toBe('Hindi answer');
  });
});
