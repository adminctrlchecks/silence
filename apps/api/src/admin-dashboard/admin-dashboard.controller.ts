import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { AdminJwtGuard } from '../auth/guards/admin-jwt.guard';
import { AdminDashboardService } from './admin-dashboard.service';

/** Admin command center — live metrics + content completeness — docs/API.md §7b. */
@ApiTags('admin: dashboard')
@ApiBearerAuth('admin')
@Controller('admin/dashboard')
@UseGuards(AdminJwtGuard)
export class AdminDashboardController {
  constructor(private readonly dashboard: AdminDashboardService) {}

  @Get('metrics')
  metrics() {
    return this.dashboard.metrics();
  }

  @Get('content-matrix')
  contentMatrix() {
    return this.dashboard.contentMatrix();
  }
}
