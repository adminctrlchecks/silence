import { Body, Controller, Get, Put, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { chartConfigSchema, type Category } from '@silence/shared';
import { ZodValidationPipe } from '../common/zod-validation.pipe';
import { ChartConfigDto } from '../common/dto';
import { AdminJwtGuard } from '../auth/guards/admin-jwt.guard';
import { ChartService } from './chart.service';

/** Admin chart configuration — docs/API.md §5. */
@ApiTags('admin: chart-config')
@ApiBearerAuth('admin')
@Controller('admin/chart-config')
@UseGuards(AdminJwtGuard)
export class AdminChartController {
  constructor(private readonly chart: ChartService) {}

  @Get()
  get(@Query('category') category: Category) {
    return this.chart.getConfig(category);
  }

  @Put()
  put(@Body(new ZodValidationPipe(chartConfigSchema)) body: ChartConfigDto) {
    return this.chart.putConfig(body);
  }
}
