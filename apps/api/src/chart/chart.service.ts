import { Injectable, NotFoundException } from '@nestjs/common';
import type { Category, ChartConfigInput } from '@silence/shared';
import { PrismaService } from '../prisma/prisma.service';
import { AstrologyService } from '../integrations/astrology/astrology.service';
import { GeminiService } from '../integrations/gemini/gemini.service';

const STYLE_TO_DB = {
  'north-indian': 'north_indian',
  'south-indian': 'south_indian',
  western: 'western',
} as const;
const STYLE_FROM_DB: Record<string, string> = {
  north_indian: 'north-indian',
  south_indian: 'south-indian',
  western: 'western',
};

@Injectable()
export class ChartService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly astrology: AstrologyService,
    private readonly gemini: GeminiService,
  ) {}

  async getConfig(category: Category) {
    const cfg = await this.prisma.chartConfig.findUnique({ where: { category } });
    if (!cfg) {
      return { category, type: 'astrology', style: 'north-indian', source: 'level2', requires: ['dob', 'timeOfBirth', 'placeOfBirth'] };
    }
    return { ...cfg, style: STYLE_FROM_DB[cfg.style] ?? cfg.style };
  }

  async putConfig(input: ChartConfigInput) {
    const style = STYLE_TO_DB[input.style];
    const cfg = await this.prisma.chartConfig.upsert({
      where: { category: input.category },
      create: { category: input.category, type: input.type, style, source: input.source, requires: input.requires },
      update: { type: input.type, style, source: input.source, requires: input.requires },
    });
    return { ...cfg, style: STYLE_FROM_DB[cfg.style] ?? cfg.style };
  }

  /**
   * Generates (and persists) the user's chart from their birth details + Level 2 data.
   * Engine computes geometry; Gemini writes the interpretation text.
   */
  async generateForUser(userId: string, lang = 'en') {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    const cfg = await this.getConfig(user.category as Category);
    const geometry = this.astrology.compute(
      {
        dob: user.dob,
        timeOfBirth: user.timeOfBirth,
        lat: user.placeLat ?? undefined,
        lng: user.placeLng ?? undefined,
        city: user.placeCity,
        country: user.placeCountry,
      },
      user.category as Category,
    );

    const level2 = await this.prisma.userResponse.findMany({
      where: { userId, level: 'level2' },
    });
    const summary = level2.map((r) => r.value).join('; ');
    const interpretation = await this.gemini.translate(
      `Astrology reading based on chart and answers: ${summary}`,
      lang,
    );

    const chart = await this.prisma.userChart.create({
      data: {
        userId,
        category: user.category,
        style: STYLE_TO_DB[cfg.style as keyof typeof STYLE_TO_DB] ?? 'north_indian',
        data: geometry as object,
        interpretation,
      },
    });

    return {
      userId,
      category: user.category,
      type: 'astrology',
      style: cfg.style,
      data: chart.data,
      interpretation: chart.interpretation,
      createdAt: chart.createdAt.toISOString(),
    };
  }
}
