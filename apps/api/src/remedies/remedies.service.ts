import { Injectable, NotFoundException } from '@nestjs/common';
import type { Category, Level, CreateRemedyInput, UpdateRemedyInput } from '@silence/shared';
import { PrismaService } from '../prisma/prisma.service';
import { parsePageParams, paginated } from '../common/pagination';

@Injectable()
export class RemediesService {
  constructor(private readonly prisma: PrismaService) {}

  async list(category?: Category, lang?: string, page?: number, limit?: number) {
    const where = { ...(category && { category }) };
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
      },
    });
    return this.present(r);
  }

  async remove(id: string) {
    await this.ensureExists(id);
    await this.prisma.remedy.delete({ where: { id } });
    return { deleted: true };
  }

  /** Public: the remedy shown to a user, resolved for their category + language. */
  async forCategory(category: Category, lang?: string) {
    const r = await this.prisma.remedy.findFirst({
      where: { category },
      orderBy: { updatedAt: 'desc' },
      include: { translations: lang ? { where: { lang } } : false },
    });
    if (!r) throw new NotFoundException('Remedy not found');
    return this.present(r, lang);
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
    };
  }
}
