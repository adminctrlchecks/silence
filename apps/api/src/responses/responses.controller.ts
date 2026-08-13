import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import {
  submitResponsesSchema,
  type Category,
  type Level,
  type SubmitResponsesInput,
} from '@silence/shared';
import { ZodValidationPipe } from '../common/zod-validation.pipe';
import { UserJwtGuard } from '../auth/guards/user-jwt.guard';
import { ResponsesService } from './responses.service';
import { QuestionsService } from '../questions/questions.service';

/** User flow — docs/API.md §8. */
@Controller()
export class ResponsesController {
  constructor(
    private readonly responses: ResponsesService,
    private readonly questions: QuestionsService,
  ) {}

  /** Public: questions to show the user. */
  @Get('questions')
  getQuestions(
    @Query('level') level?: Level,
    @Query('category') category?: Category,
    @Query('lang') lang?: string,
  ) {
    return this.questions.list({ level, category, lang, limit: 100 });
  }

  /** Submit the user's answers to questions. */
  @Post('responses')
  @UseGuards(UserJwtGuard)
  submit(@Body(new ZodValidationPipe(submitResponsesSchema)) body: SubmitResponsesInput) {
    return this.responses.submit(body);
  }
}
