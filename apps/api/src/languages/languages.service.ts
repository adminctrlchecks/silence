import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { LANGUAGES, type AutoTranslateInput } from '@silence/shared';
import { PrismaService } from '../prisma/prisma.service';
import { GeminiService } from '../integrations/gemini/gemini.service';

@Injectable()
export class LanguagesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly gemini: GeminiService,
  ) {}

  /** Lists languages from the DB; seeds the 11 defaults on first call if empty. */
  async list() {
    let langs = await this.prisma.language.findMany({ orderBy: { code: 'asc' } });
    if (langs.length === 0) {
      await this.prisma.language.createMany({
        data: LANGUAGES.map((l) => ({ code: l.code, name: l.name, rtl: l.dir === 'rtl' })),
      });
      langs = await this.prisma.language.findMany({ orderBy: { code: 'asc' } });
    }
    return { data: langs };
  }

  async add(input: { code: string; name: string; rtl?: boolean }) {
    return this.prisma.language.upsert({
      where: { code: input.code },
      create: { code: input.code, name: input.name, rtl: input.rtl ?? false },
      update: { name: input.name, rtl: input.rtl ?? false },
    });
  }

  /** Gemini auto-translation for a content item into target languages — docs/API.md §7. */
  async autoTranslate(input: AutoTranslateInput) {
    switch (input.entity) {
      case 'question':
        return this.translateQuestion(input.id, input.targets);
      case 'answer':
        return this.translateAnswer(input.id, input.targets);
      case 'remedy':
        return this.translateRemedy(input.id, input.targets);
      default:
        throw new BadRequestException('Unknown entity');
    }
  }

  private async translateQuestion(id: string, targets: string[]) {
    const q = await this.prisma.question.findUnique({ where: { id } });
    if (!q) throw new NotFoundException('Question not found');
    for (const lang of targets) {
      const text = await this.gemini.translate(q.text, lang);
      await this.prisma.questionTranslation.upsert({
        where: { questionId_lang: { questionId: id, lang } },
        create: { questionId: id, lang, text },
        update: { text },
      });
    }
    return { id, translated: targets, provider: 'gemini' };
  }

  private async translateAnswer(id: string, targets: string[]) {
    const a = await this.prisma.answer.findUnique({ where: { id } });
    if (!a) throw new NotFoundException('Answer not found');
    for (const lang of targets) {
      const text = await this.gemini.translate(a.text, lang);
      await this.prisma.answerTranslation.upsert({
        where: { answerId_lang: { answerId: id, lang } },
        create: { answerId: id, lang, text },
        update: { text },
      });
    }
    return { id, translated: targets, provider: 'gemini' };
  }

  private async translateRemedy(id: string, targets: string[]) {
    const r = await this.prisma.remedy.findUnique({ where: { id } });
    if (!r) throw new NotFoundException('Remedy not found');
    for (const lang of targets) {
      const [title, text] = await Promise.all([
        this.gemini.translate(r.title, lang),
        this.gemini.translate(r.text, lang),
      ]);
      await this.prisma.remedyTranslation.upsert({
        where: { remedyId_lang: { remedyId: id, lang } },
        create: { remedyId: id, lang, title, text },
        update: { title, text },
      });
    }
    return { id, translated: targets, provider: 'gemini' };
  }
}
