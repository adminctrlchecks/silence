import { Module } from '@nestjs/common';
import { AnswersService } from './answers.service';
import { AdminAnswersController, PublicAnswersController } from './answers.controller';

@Module({
  controllers: [AdminAnswersController, PublicAnswersController],
  providers: [AnswersService],
  exports: [AnswersService],
})
export class AnswersModule {}
