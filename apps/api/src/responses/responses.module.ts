import { Module } from '@nestjs/common';
import { ResponsesService } from './responses.service';
import { ResponsesController } from './responses.controller';
import { QuestionsModule } from '../questions/questions.module';
import { SessionsModule } from '../sessions/sessions.module';

@Module({
  imports: [QuestionsModule, SessionsModule],
  controllers: [ResponsesController],
  providers: [ResponsesService],
})
export class ResponsesModule {}
