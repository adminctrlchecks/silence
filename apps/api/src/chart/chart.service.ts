import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
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
   *
   * When `sessionId` is given and that session already has a chart, the existing
   * chart is returned as-is instead of recomputing — a reading's chart stays
   * stable across reloads rather than growing a new row on every page visit.
   */
  async generateForUser(userId: string, lang = 'en', sessionId?: string) {
    if (sessionId) {
      const existing = await this.prisma.userChart.findFirst({
        where: { sessionId },
        orderBy: { createdAt: 'desc' },
      });
      if (existing) return this.present(existing);
    }

    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    // Google sign-ups start with blank birth details (see AuthService.userGoogleAuth) —
    // the frontend routes them to /profile before they can reach this endpoint, but
    // guard here too rather than hand the ephemeris engine an empty date string.
    if (!user.dob?.trim() || !user.timeOfBirth?.trim() || !user.placeCity?.trim() || !user.placeCountry?.trim()) {
      throw new BadRequestException('Complete your birth details before generating a chart');
    }

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
    const geo = geometry as {
      ascendant?: { signName: string; degree: number } | null;
      placements?: Array<{
        planet: string;
        signName: string;
        house: number;
        degree?: number;
        retrograde: boolean;
      }>;
    };
    const interpretation = await this.gemini.interpretChart({
      category: user.category as Category,
      ascendant: geo.ascendant ?? null,
      placements: geo.placements ?? [],
      answers: level2.map((r) => r.value),
      lang,
    });

    const chart = await this.prisma.userChart.create({
      data: {
        userId,
        sessionId,
        category: user.category,
        style: STYLE_TO_DB[cfg.style as keyof typeof STYLE_TO_DB] ?? 'north_indian',
        data: geometry as object,
        interpretation,
      },
    });

    return this.present(chart);
  }

  private present(chart: {
    userId: string;
    category: Category;
    style: string;
    data: unknown;
    interpretation: string | null;
    createdAt: Date;
  }) {
    return {
      userId: chart.userId,
      category: chart.category,
      type: 'astrology' as const,
      style: STYLE_FROM_DB[chart.style] ?? chart.style,
      data: chart.data,
      interpretation: chart.interpretation,
      createdAt: chart.createdAt.toISOString(),
    };
  }
}
