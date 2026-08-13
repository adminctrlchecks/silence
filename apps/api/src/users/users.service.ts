import { Injectable, NotFoundException } from '@nestjs/common';
import type { Category } from '@silence/shared';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async get(id: string) {
    const u = await this.prisma.user.findUnique({ where: { id } });
    if (!u) throw new NotFoundException('User not found');
    return this.present(u);
  }

  async update(id: string, patch: Record<string, unknown>) {
    await this.ensureExists(id);
    const u = await this.prisma.user.update({
      where: { id },
      data: {
        name: patch.name as string | undefined,
        lang: patch.lang as string | undefined,
        contact: patch.contact as string | undefined,
        timeOfBirth: patch.timeOfBirth as string | undefined,
      },
    });
    return this.present(u);
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
