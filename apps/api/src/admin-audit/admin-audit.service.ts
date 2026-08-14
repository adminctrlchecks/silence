import { Injectable } from '@nestjs/common';
import type { AdminAuditAction } from '@silence/shared';
import { PrismaService } from '../prisma/prisma.service';
import { parsePageParams, paginated } from '../common/pagination';

export interface RecordAuditEntry {
  adminId: string;
  adminEmail: string;
  action: AdminAuditAction;
  targetType?: string;
  targetId?: string;
  detail?: string;
}

interface ListFilter {
  adminId?: string;
  action?: AdminAuditAction;
  page?: number;
  limit?: number;
}

/**
 * Sensitive admin action log (Phase 6) — login, password changes/resets, and
 * entering the user app as a given user. Write side is fire-and-forget from
 * AuthService; never throws into the caller's request if the write fails.
 */
@Injectable()
export class AdminAuditService {
  constructor(private readonly prisma: PrismaService) {}

  async record(entry: RecordAuditEntry): Promise<void> {
    try {
      await this.prisma.adminAuditLog.create({ data: entry });
    } catch {
      // Auditing must never break the action being audited.
    }
  }

  async list(filter: ListFilter) {
    const where = {
      ...(filter.adminId && { adminId: filter.adminId }),
      ...(filter.action && { action: filter.action }),
    };
    const pp = parsePageParams(filter.page, filter.limit);
    const [rows, total] = await this.prisma.$transaction([
      this.prisma.adminAuditLog.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: pp.skip,
        take: pp.take,
      }),
      this.prisma.adminAuditLog.count({ where }),
    ]);
    return paginated(
      rows.map((r) => ({
        id: r.id,
        adminId: r.adminId,
        adminEmail: r.adminEmail,
        action: r.action as AdminAuditAction,
        targetType: r.targetType ?? undefined,
        targetId: r.targetId ?? undefined,
        detail: r.detail ?? undefined,
        createdAt: r.createdAt.toISOString(),
      })),
      pp.page,
      pp.limit,
      total,
    );
  }
}
