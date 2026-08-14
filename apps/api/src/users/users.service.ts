import { Injectable, NotFoundException } from '@nestjs/common';
import type { Category, UpdateUserProfileInput } from '@silence/shared';
import { PrismaService } from '../prisma/prisma.service';
import { paginated, parsePageParams } from '../common/pagination';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async get(id: string) {
    const u = await this.prisma.user.findUnique({ where: { id } });
    if (!u) throw new NotFoundException('User not found');
    return this.present(u);
  }

  async update(id: string, patch: UpdateUserProfileInput) {
    await this.ensureExists(id);
    const u = await this.prisma.user.update({
      where: { id },
      data: {
        name: patch.name,
        category: patch.category,
        dob: patch.dob,
        timeOfBirth: patch.timeOfBirth,
        placeCity: patch.placeOfBirth?.city,
        placeCountry: patch.placeOfBirth?.country,
        placeLat: patch.placeOfBirth?.lat,
        placeLng: patch.placeOfBirth?.lng,
        lang: patch.lang,
      },
    });
    return this.present(u);
  }

  async listForAdmin(page?: number, limit?: number) {
    const pp = parsePageParams(page, limit);
    const [rows, total] = await this.prisma.$transaction([
      this.prisma.user.findMany({
        orderBy: { createdAt: 'desc' },
        skip: pp.skip,
        take: pp.take,
        include: {
          _count: { select: { responses: true, charts: true } },
        },
      }),
      this.prisma.user.count(),
    ]);

    return paginated(
      rows.map((user) => ({
        ...this.present(user),
        createdAt: user.createdAt.toISOString(),
        updatedAt: user.updatedAt.toISOString(),
        responseCount: user._count.responses,
        chartCount: user._count.charts,
      })),
      pp.page,
      pp.limit,
      total,
    );
  }

  async getForAdmin(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: {
        responses: { orderBy: { createdAt: 'asc' } },
        charts: { orderBy: { createdAt: 'asc' } },
      },
    });
    if (!user) throw new NotFoundException('User not found');

    return {
      ...this.present(user),
      createdAt: user.createdAt.toISOString(),
      updatedAt: user.updatedAt.toISOString(),
      responses: user.responses.map((response) => ({
        ...response,
        createdAt: response.createdAt.toISOString(),
      })),
      charts: user.charts.map((chart) => ({
        ...chart,
        createdAt: chart.createdAt.toISOString(),
      })),
    };
  }

  /** Saved Q&A + chart + remedy per session — docs/API.md §10. */
  async history(id: string, lang?: string) {
    await this.ensureExists(id);
    const [responses, charts] = await Promise.all([
      this.prisma.userResponse.findMany({ where: { userId: id }, orderBy: { createdAt: 'asc' } }),
      this.prisma.userChart.findMany({ where: { userId: id }, orderBy: { createdAt: 'asc' } }),
    ]);
    const user = await this.prisma.user.findUnique({ where: { id } });
    return {
      userId: id,
      category: user?.category,
      lang: lang ?? user?.lang,
      responses,
      charts,
    };
  }

  private async ensureExists(id: string) {
    const exists = await this.prisma.user.count({ where: { id } });
    if (!exists) throw new NotFoundException('User not found');
  }

  private present(u: {
    id: string;
    name: string;
    category: Category;
    dob: string;
    timeOfBirth: string;
    placeCity: string;
    placeCountry: string;
    placeLat: number | null;
    placeLng: number | null;
    contact: string;
    lang: string;
    consent: boolean;
  }) {
    return {
      id: u.id,
      name: u.name,
      category: u.category,
      dob: u.dob,
      timeOfBirth: u.timeOfBirth,
      placeOfBirth: {
        city: u.placeCity,
        country: u.placeCountry,
        lat: u.placeLat ?? undefined,
        lng: u.placeLng ?? undefined,
      },
      contact: u.contact,
      lang: u.lang,
      consent: u.consent,
    };
  }
}
