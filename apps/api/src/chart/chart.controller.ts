import { Body, Controller, Get, Put, Query, UseGuards } from '@nestjs/common';
import { chartConfigSchema, type Category, type ChartConfigInput } from '@silence/shared';
import { ZodValidationPipe } from '../common/zod-validation.pipe';
import { AdminJwtGuard } from '../auth/guards/admin-jwt.guard';
import { ChartService } from './chart.service';

/** Admin chart configuration — docs/API.md §5. */
@Controller('admin/chart-config')
@UseGuards(AdminJwtGuard)
export class AdminChartController {
  constructor(private readonly chart: ChartService) {}

  @Get()
  get(@Query('category') category: Category) {
    return this.chart.getConfig(category);
  }

  @Put()
  put(@Body(new ZodValidationPipe(chartConfigSchema)) body: ChartConfigInput) {
    return this.chart.putConfig(body);
  }
}
