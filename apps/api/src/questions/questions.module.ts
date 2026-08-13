import { Module } from '@nestjs/common';
import { QuestionsService } from './questions.service';
import { AdminQuestionsController } from './questions.controller';

@Module({
  controllers: [AdminQuestionsController],
  providers: [QuestionsService],
  exports: [QuestionsService],
})
export class QuestionsModule {}
