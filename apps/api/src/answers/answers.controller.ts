import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  createAnswerSchema,
  updateAnswerSchema,
  aiGenerateAnswerSchema,
  type Category,
  type Level,
  type AnswerSource,
  type CreateAnswerInput,
  type UpdateAnswerInput,
  type AiGenerateAnswerInput,
} from '@silence/shared';
import { ZodValidationPipe } from '../common/zod-validation.pipe';
import { AdminJwtGuard } from '../auth/guards/admin-jwt.guard';
import { AnswersService } from './answers.service';

/** Admin answer management + AI Mode — docs/API.md §3. */
@Controller('admin/answers')
@UseGuards(AdminJwtGuard)
export class AdminAnswersController {
  constructor(private readonly answers: AnswersService) {}

  @Get()
  list(
    @Query('level') level?: Level,
    @Query('category') category?: Category,
    @Query('questionId') questionId?: string,
    @Query('source') source?: AnswerSource,
    @Query('reviewed') reviewed?: string,
    @Query('lang') lang?: string,
  ) {
    return this.answers.list({
      level,
      category,
      questionId,
      source,
      reviewed: reviewed === undefined ? undefined : reviewed === 'true',
      lang,
    });
  }

  @Post()
  create(@Body(new ZodValidationPipe(createAnswerSchema)) body: CreateAnswerInput) {
    return this.answers.create(body);
  }

  @Put(':id')
  update(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(updateAnswerSchema)) body: UpdateAnswerInput,
  ) {
    return this.answers.update(id, body);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.answers.remove(id);
  }

  @Post('ai-generate')
  aiGenerate(@Body(new ZodValidationPipe(aiGenerateAnswerSchema)) body: AiGenerateAnswerInput) {
    return this.answers.aiGenerate(body);
  }
}

/** Public answer read — docs/API.md §8. */
@Controller('answers')
export class PublicAnswersController {
  constructor(private readonly answers: AnswersService) {}

  @Get()
  get(
    @Query('questionId') questionId: string,
    @Query('level') level: Level,
    @Query('category') category: Category,
    @Query('lang') lang?: string,
  ) {
    return this.answers.publicAnswer(questionId, level, category, lang);
  }
}
