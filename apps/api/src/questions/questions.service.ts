import { Injectable, NotFoundException } from '@nestjs/common';
import type { Prisma } from '@prisma/client';
import type { Category, Level, CreateQuestionInput, UpdateQuestionInput } from '@silence/shared';
import { PrismaService } from '../prisma/prisma.service';
import { parsePageParams, paginated } from '../common/pagination';

interface ListFilter {
  level?: Level;
  category?: Category;
  q?: string;
  lang?: string;
  page?: number;
  limit?: number;
}

@Injectable()
export class QuestionsService {
  constructor(private readonly prisma: PrismaService) {}

  async list({ level, category, q, lang, page, limit }: ListFilter) {
    const search = q?.trim();
    const where: Prisma.QuestionWhereInput = {
      ...(level && { level }),
      ...(category && { category }),
      ...(search && {
        OR: [
          { text: { contains: search, mode: 'insensitive' } },
          { helpText: { contains: search, mode: 'insensitive' } },
          { branchingTags: { contains: search, mode: 'insensitive' } },
          {
            translations: {
              some: {
                OR: [
                  { text: { contains: search, mode: 'insensitive' } },
                  { helpText: { contains: search, mode: 'insensitive' } },
                ],
              },
            },
          },
        ],
      }),
    };
    const pp = parsePageParams(page, limit);
    const [rows, total] = await this.prisma.$transaction([
      this.prisma.question.findMany({
        where,
        orderBy: { order: 'asc' },
        skip: pp.skip,
        take: pp.take,
        include: { translations: lang ? { where: { lang } } : false },
      }),
      this.prisma.question.count({ where }),
    ]);
    return paginated(rows.map((r) => this.present(r, lang)), pp.page, pp.limit, total);
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
        inputType: input.inputType ?? 'textarea',
        required: input.required ?? true,
        helpText: input.helpText,
        active: input.active ?? true,
        branchingTags: input.branchingTags,
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
        inputType: input.inputType,
        required: input.required,
        helpText: input.helpText,
        active: input.active,
        branchingTags: input.branchingTags,
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
    q: {
      id: string;
      level: Level;
      category: Category;
      text: string;
      inputType: string;
      required: boolean;
      helpText?: string | null;
      active: boolean;
      branchingTags?: string | null;
      order: number;
      translations?: { lang: string; text: string; helpText?: string | null }[];
    },
    lang?: string,
  ) {
    const t = lang ? q.translations?.find((x) => x.lang === lang) : undefined;
    return {
      id: q.id,
      level: q.level,
      category: q.category,
      text: t?.text ?? q.text,
      inputType: q.inputType,
      required: q.required,
      helpText: t?.helpText ?? q.helpText,
      active: q.active,
      branchingTags: q.branchingTags,
      order: q.order,
    };
  }
}
