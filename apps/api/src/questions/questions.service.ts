import { Injectable, NotFoundException } from '@nestjs/common';
import type { Category, Level, CreateQuestionInput, UpdateQuestionInput } from '@silence/shared';
import { PrismaService } from '../prisma/prisma.service';

interface ListFilter {
  level?: Level;
  category?: Category;
  lang?: string;
  page?: number;
  limit?: number;
}

@Injectable()
export class QuestionsService {
  constructor(private readonly prisma: PrismaService) {}

  async list({ level, category, lang, page = 1, limit = 20 }: ListFilter) {
    const where = { ...(level && { level }), ...(category && { category }) };
    const [rows, total] = await this.prisma.$transaction([
      this.prisma.question.findMany({
        where,
        orderBy: { order: 'asc' },
        skip: (page - 1) * limit,
        take: limit,
        include: { translations: lang ? { where: { lang } } : false },
      }),
      this.prisma.question.count({ where }),
    ]);
    return { data: rows.map((r) => this.present(r, lang)), page, limit, total };
  }

  async get(id: string, lang?: string) {
    const q = await this.prisma.question.findUnique({
      where: { id },
      include: { translations: lang ? { where: { lang } } : true },
    });
    if (!q) throw new NotFoundException('Question not found');
    return this.present(q, lang);
  }

  async create(input: CreateQuestionInput) {
    const q = await this.prisma.question.create({
      data: {
        level: input.level,
        category: input.category,
        text: input.text,
        order: input.order ?? 0,
        translations: input.translations
          ? { create: Object.entries(input.translations).map(([l, text]) => ({ lang: l, text })) }
          : undefined,
      },
    });
    return this.present(q);
  }

  async update(id: string, input: UpdateQuestionInput) {
    await this.ensureExists(id);
    const q = await this.prisma.question.update({
      where: { id },
      data: {
        level: input.level,
        category: input.category,
        text: input.text,
        order: input.order,
      },
    });
    if (input.translations) await this.upsertTranslations(id, input.translations);
    return this.present(q);
  }

  async remove(id: string) {
    await this.ensureExists(id);
    await this.prisma.question.delete({ where: { id } });
    return { deleted: true };
  }

  private async upsertTranslations(questionId: string, translations: Record<string, string>) {
    await Promise.all(
      Object.entries(translations).map(([lang, text]) =>
        this.prisma.questionTranslation.upsert({
          where: { questionId_lang: { questionId, lang } },
          create: { questionId, lang, text },
          update: { text },
        }),
      ),
    );
  }

  private async ensureExists(id: string) {
    const exists = await this.prisma.question.count({ where: { id } });
    if (!exists) throw new NotFoundException('Question not found');
  }

  /** Resolves the display text for the requested language, falling back to base text. */
  private present(
    q: { id: string; level: Level; category: Category; text: string; order: number; translations?: { lang: string; text: string }[] },
    lang?: string,
  ) {
    const t = lang ? q.translations?.find((x) => x.lang === lang)?.text : undefined;
    return {
      id: q.id,
      level: q.level,
      category: q.category,
      text: t ?? q.text,
      order: q.order,
    };
  }
}
