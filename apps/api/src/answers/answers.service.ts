import { Injectable, NotFoundException } from '@nestjs/common';
import type { Prisma } from '@prisma/client';
import type {
  Category,
  Level,
  AnswerSource,
  CreateAnswerInput,
  UpdateAnswerInput,
  AiGenerateAnswerInput,
} from '@silence/shared';
import { PrismaService } from '../prisma/prisma.service';
import { GeminiService } from '../integrations/gemini/gemini.service';
import { parsePageParams, paginated } from '../common/pagination';

interface ListFilter {
  level?: Level;
  category?: Category;
  questionId?: string;
  q?: string;
  source?: AnswerSource;
  reviewed?: boolean;
  lang?: string;
  page?: number;
  limit?: number;
}

@Injectable()
export class AnswersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly gemini: GeminiService,
  ) {}

  async list(f: ListFilter) {
    const search = f.q?.trim();
    const where: Prisma.AnswerWhereInput = {
      ...(f.level && { level: f.level }),
      ...(f.category && { category: f.category }),
      ...(f.questionId && { questionId: f.questionId }),
      ...(f.source && { source: f.source }),
      ...(f.reviewed !== undefined && { reviewed: f.reviewed }),
      ...(search && {
        OR: [
          { text: { contains: search, mode: 'insensitive' } },
          { translations: { some: { text: { contains: search, mode: 'insensitive' } } } },
          { question: { text: { contains: search, mode: 'insensitive' } } },
        ],
      }),
    };
    const { page, limit, skip, take } = parsePageParams(f.page, f.limit);
    const [rows, total] = await this.prisma.$transaction([
      this.prisma.answer.findMany({
        where,
        include: { translations: f.lang ? { where: { lang: f.lang } } : false },
        skip,
        take,
      }),
      this.prisma.answer.count({ where }),
    ]);
    return paginated(rows.map((r) => this.present(r, f.lang)), page, limit, total);
  }

  async create(input: CreateAnswerInput) {
    const a = await this.prisma.answer.create({
      data: {
        questionId: input.questionId,
        level: input.level,
        category: input.category,
        text: input.text,
        source: input.source,
        reviewed: input.source === 'admin', // admin answers are pre-approved
        translations: input.translations
          ? { create: Object.entries(input.translations).map(([l, text]) => ({ lang: l, text })) }
          : undefined,
      },
    });
    return this.present(a);
  }

  async update(id: string, input: UpdateAnswerInput) {
    await this.ensureExists(id);
    const a = await this.prisma.answer.update({
      where: { id },
      data: {
        text: input.text,
        source: input.source,
        level: input.level,
        category: input.category,
        reviewed: input.reviewed,
      },
    });
    if (input.translations) {
      await Promise.all(
        Object.entries(input.translations).map(([lang, text]) =>
          this.prisma.answerTranslation.upsert({
            where: { answerId_lang: { answerId: id, lang } },
            create: { answerId: id, lang, text },
            update: { text },
          }),
        ),
      );
    }
    return this.present(a);
  }

  async remove(id: string) {
    await this.ensureExists(id);
    await this.prisma.answer.delete({ where: { id } });
    return { deleted: true };
  }

  /** AI Mode: generate a missing answer and SAVE it (source=ai, reviewed=false). */
  async aiGenerate(input: AiGenerateAnswerInput) {
    const question = await this.prisma.question.findUnique({ where: { id: input.questionId } });
    if (!question) throw new NotFoundException('Question not found');

    const text = await this.gemini.generateAnswer({
      questionText: question.text,
      level: input.level,
      category: input.category,
      lang: input.lang,
    });

    const saved = await this.prisma.answer.create({
      data: {
        questionId: input.questionId,
        level: input.level,
        category: input.category,
        text,
        source: 'ai',
        reviewed: false,
      },
    });
    return { id: saved.id, text: saved.text, source: 'ai', saved: true, reviewed: false };
  }

  /** Public: the single answer to show a user for a question. */
  async publicAnswer(questionId: string, level: Level, category: Category, lang?: string) {
    const a = await this.prisma.answer.findFirst({
      where: { questionId, level, category, reviewed: true },
      orderBy: { updatedAt: 'desc' },
      include: { translations: lang ? { where: { lang } } : false },
    });
    if (!a) throw new NotFoundException('Answer not found');
    return this.present(a, lang);
  }

  private async ensureExists(id: string) {
    const exists = await this.prisma.answer.count({ where: { id } });
    if (!exists) throw new NotFoundException('Answer not found');
  }

  private present(
    a: {
      id: string;
      questionId: string;
      level: Level;
      category: Category;
      text: string;
      source: AnswerSource;
      reviewed: boolean;
      translations?: { lang: string; text: string }[];
    },
    lang?: string,
  ) {
    const t = lang ? a.translations?.find((x) => x.lang === lang)?.text : undefined;
    return {
      id: a.id,
      questionId: a.questionId,
      level: a.level,
      category: a.category,
      text: t ?? a.text,
      source: a.source,
      reviewed: a.reviewed,
    };
  }
}
