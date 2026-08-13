import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { ChartModule } from '../chart/chart.module';
import { RemediesModule } from '../remedies/remedies.module';

@Module({
  imports: [ChartModule, RemediesModule],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
