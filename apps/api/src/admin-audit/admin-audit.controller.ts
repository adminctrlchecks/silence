import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import type { AdminAuditAction } from '@silence/shared';
import { AdminJwtGuard } from '../auth/guards/admin-jwt.guard';
import { AdminAuditService } from './admin-audit.service';

/** Sensitive admin action log — docs/API.md §7c. */
@ApiTags('admin: audit log')
@ApiBearerAuth('admin')
@Controller('admin/audit-log')
@UseGuards(AdminJwtGuard)
export class AdminAuditController {
  constructor(private readonly audit: AdminAuditService) {}

  @Get()
  list(
    @Query('adminId') adminId?: string,
    @Query('action') action?: AdminAuditAction,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.audit.list({
      adminId,
      action,
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
    });
  }
}
