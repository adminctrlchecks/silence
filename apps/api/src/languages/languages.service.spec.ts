import { NotFoundException, BadRequestException } from '@nestjs/common';
import { LanguagesService } from './languages.service';
import { createPrismaMock, PrismaMock } from '../test-utils/prisma-mock';

function geminiStub() {
  return { translate: jest.fn().mockResolvedValue('翻訳'), generateAnswer: jest.fn() };
}

describe('LanguagesService', () => {
  let prisma: PrismaMock;
  let gemini: ReturnType<typeof geminiStub>;
  let service: LanguagesService;

  beforeEach(() => {
    prisma = createPrismaMock();
    gemini = geminiStub();
    service = new LanguagesService(prisma as never, gemini as never);
  });

  it('list() seeds the default languages when the table is empty', async () => {
    prisma.language.findMany.mockResolvedValueOnce([]).mockResolvedValueOnce([{ code: 'en' }]);
    prisma.language.createMany.mockResolvedValue({ count: 11 });
    const res = await service.list();
    expect(prisma.language.createMany).toHaveBeenCalled();
    expect(res.data).toEqual([{ code: 'en' }]);
  });

  it('add() upserts a language', async () => {
    prisma.language.upsert.mockResolvedValue({ code: 'xx', name: 'X', rtl: false });
    await service.add({ code: 'xx', name: 'X' });
    expect(prisma.language.upsert).toHaveBeenCalledWith(
      expect.objectContaining({ where: { code: 'xx' } }),
    );
  });

  it('autoTranslate() translates a question into each target and upserts', async () => {
    prisma.question.findUnique.mockResolvedValue({ id: 'q1', text: 'Hello' });
    prisma.questionTranslation.upsert.mockResolvedValue({});
    const res = await service.autoTranslate({ entity: 'question', id: 'q1', targets: ['ja', 'hi'] });
    expect(gemini.translate).toHaveBeenCalledTimes(2);
    expect(prisma.questionTranslation.upsert).toHaveBeenCalledTimes(2);
    expect(res).toEqual({ id: 'q1', translated: ['ja', 'hi'], provider: 'gemini' });
  });

  it('autoTranslate() translates remedy title and text for each target', async () => {
    gemini.translate.mockImplementation((text: string, lang: string) => Promise.resolve(`${lang}:${text}`));
    prisma.remedy.findUnique.mockResolvedValue({ id: 'r1', title: 'Sleep', text: 'Rest well' });
    prisma.remedyTranslation.upsert.mockResolvedValue({});

    const res = await service.autoTranslate({ entity: 'remedy', id: 'r1', targets: ['ar', 'fr'] });

    expect(gemini.translate).toHaveBeenCalledTimes(4);
    expect(prisma.remedyTranslation.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { remedyId_lang: { remedyId: 'r1', lang: 'ar' } },
        create: { remedyId: 'r1', lang: 'ar', title: 'ar:Sleep', text: 'ar:Rest well' },
      }),
    );
    expect(res).toEqual({ id: 'r1', translated: ['ar', 'fr'], provider: 'gemini' });
  });

  it('autoTranslate() throws NotFound for a missing entity', async () => {
    prisma.answer.findUnique.mockResolvedValue(null);
    await expect(
      service.autoTranslate({ entity: 'answer', id: 'x', targets: ['ja'] }),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it('autoTranslate() rejects an unknown entity type', async () => {
    await expect(
      service.autoTranslate({ entity: 'nonsense' as never, id: 'x', targets: ['ja'] }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });
});
