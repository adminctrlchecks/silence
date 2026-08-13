import { Module } from '@nestjs/common';
import { RemediesService } from './remedies.service';
import { AdminRemediesController } from './remedies.controller';

@Module({
  controllers: [AdminRemediesController],
  providers: [RemediesService],
  exports: [RemediesService],
})
export class RemediesModule {}
