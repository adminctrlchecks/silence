import { Module } from '@nestjs/common';
import { ChartService } from './chart.service';
import { AdminChartController } from './chart.controller';

@Module({
  controllers: [AdminChartController],
  providers: [ChartService],
  exports: [ChartService],
})
export class ChartModule {}
