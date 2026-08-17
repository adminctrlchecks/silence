import { Injectable, NotFoundException } from '@nestjs/common';
import type { Category, UpdateUserProfileInput } from '@silence/shared';
import { PrismaService } from '../prisma/prisma.service';
import { paginated, parsePageParams } from '../common/pagination';

export type AdminUserSortBy = 'createdAt' | 'name' | 'responseCount' | 'chartCount';

export interface AdminUserListFilter {
  page?: number;
  limit?: number;
  /** Matches against name or contact, case-insensitive. */
  search?: string;
  category?: Category;
  sortBy?: AdminUserSortBy;
  sortDir?: 'asc' | 'desc';
}

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async get(id: string) {
    const u = await this.prisma.user.findUnique({ where: { id } });
    if (!u) throw new NotFoundException('User not found');
    return this.present(u);
  }

  async update(id: string, patch: UpdateUserProfileInput) {
    const existing = await this.prisma.user.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('User not found');

    const birthDetailsChanged =
      (patch.dob && patch.dob !== existing.dob) ||
      (patch.timeOfBirth && patch.timeOfBirth !== existing.timeOfBirth) ||
      (patch.placeOfBirth &&
        (patch.placeOfBirth.city !== existing.placeCity ||
          patch.placeOfBirth.country !== existing.placeCountry ||
          patch.placeOfBirth.lat !== existing.placeLat ||
          patch.placeOfBirth.lng !== existing.placeLng ||
          patch.placeOfBirth.timezone !== existing.placeTimezone));

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
        placeTimezone: patch.placeOfBirth?.timezone,
        lang: patch.lang,
        // Schema only allows `true` here (see updateUserProfileSchema) — this
        // can complete onboarding consent, never silently revoke it.
        consent: patch.consent === true ? true : undefined,
      },
    });

    if (birthDetailsChanged) {
      const activeSessions = await this.prisma.readingSession.findMany({
        where: { userId: id, status: { not: 'complete' } },
        select: { id: true },
      });
      const activeSessionIds = activeSessions.map((s) => s.id);
      if (activeSessionIds.length > 0) {
        await this.prisma.userChart.deleteMany({
          where: { sessionId: { in: activeSessionIds } },
        });
        await this.prisma.readingSession.updateMany({
          where: { id: { in: activeSessionIds }, status: 'chart_ready' },
          data: { status: 'in_progress' },
        });
      }
    }

    return this.present(u);
  }

  async listForAdmin(filter: AdminUserListFilter = {}) {
    const pp = parsePageParams(filter.page, filter.limit);
    const where = {
      ...(filter.category && { category: filter.category }),
      ...(filter.search && {
        OR: [
          { name: { contains: filter.search, mode: 'insensitive' as const } },
          { contact: { contains: filter.search, mode: 'insensitive' as const } },
        ],
      }),
    };
    const sortDir = filter.sortDir ?? 'desc';
    const orderBy =
      filter.sortBy === 'name'
        ? { name: sortDir }
        : filter.sortBy === 'responseCount'
          ? { responses: { _count: sortDir } }
          : filter.sortBy === 'chartCount'
            ? { charts: { _count: sortDir } }
            : { createdAt: sortDir };

    const [rows, total] = await this.prisma.$transaction([
      this.prisma.user.findMany({
        where,
        orderBy,
        skip: pp.skip,
        take: pp.take,
        include: {
          _count: { select: { responses: true, charts: true, sessions: true } },
        },
      }),
      this.prisma.user.count({ where }),
    ]);

    return paginated(
      rows.map((user) => ({
        ...this.present(user),
        createdAt: user.createdAt.toISOString(),
        updatedAt: user.updatedAt.toISOString(),
        responseCount: user._count.responses,
        chartCount: user._count.charts,
        sessionCount: user._count.sessions,
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
    placeTimezone: string | null;
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
        timezone: u.placeTimezone ?? undefined,
      },
      contact: u.contact,
      lang: u.lang,
      consent: u.consent,
    };
  }
}
