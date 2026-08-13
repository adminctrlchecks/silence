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
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import {
  createAnswerSchema,
  updateAnswerSchema,
  aiGenerateAnswerSchema,
  type Category,
  type Level,
  type AnswerSource,
} from '@silence/shared';
import { ZodValidationPipe } from '../common/zod-validation.pipe';
import { CreateAnswerDto, UpdateAnswerDto, AiGenerateAnswerDto } from '../common/dto';
import { AdminJwtGuard } from '../auth/guards/admin-jwt.guard';
import { AnswersService } from './answers.service';

/** Admin answer management + AI Mode — docs/API.md §3. */
@ApiTags('admin: answers')
@ApiBearerAuth('admin')
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
  create(@Body(new ZodValidationPipe(createAnswerSchema)) body: CreateAnswerDto) {
    return this.answers.create(body);
  }

  @Put(':id')
  update(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(updateAnswerSchema)) body: UpdateAnswerDto,
  ) {
    return this.answers.update(id, body);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.answers.remove(id);
  }

  @Post('ai-generate')
  aiGenerate(@Body(new ZodValidationPipe(aiGenerateAnswerSchema)) body: AiGenerateAnswerDto) {
    return this.answers.aiGenerate(body);
  }
}

/** Public answer read — docs/API.md §8. */
@ApiTags('user: answers')
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
