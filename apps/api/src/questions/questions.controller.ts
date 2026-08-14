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
  createQuestionSchema,
  updateQuestionSchema,
  type Category,
  type Level,
} from '@silence/shared';
import { ZodValidationPipe } from '../common/zod-validation.pipe';
import { CreateQuestionDto, UpdateQuestionDto } from '../common/dto';
import { AdminJwtGuard } from '../auth/guards/admin-jwt.guard';
import { QuestionsService } from './questions.service';

/** Admin question management — docs/API.md §2. */
@ApiTags('admin: questions')
@ApiBearerAuth('admin')
@Controller('admin/questions')
@UseGuards(AdminJwtGuard)
export class AdminQuestionsController {
  constructor(private readonly questions: QuestionsService) {}

  @Get()
  list(
    @Query('level') level?: Level,
    @Query('category') category?: Category,
    @Query('q') q?: string,
    @Query('lang') lang?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.questions.list({
      level,
      category,
      q,
      lang,
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
    });
  }

  @Get(':id')
  get(@Param('id') id: string, @Query('lang') lang?: string) {
    return this.questions.get(id, lang);
  }

  @Post()
  create(@Body(new ZodValidationPipe(createQuestionSchema)) body: CreateQuestionDto) {
    return this.questions.create(body);
  }

  @Put(':id')
  update(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(updateQuestionSchema)) body: UpdateQuestionDto,
  ) {
    return this.questions.update(id, body);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.questions.remove(id);
  }
}
