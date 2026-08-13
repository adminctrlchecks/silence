import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { AdminUsersController, UsersController } from './users.controller';
import { ChartModule } from '../chart/chart.module';
import { RemediesModule } from '../remedies/remedies.module';

@Module({
  imports: [ChartModule, RemediesModule],
  controllers: [UsersController, AdminUsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
