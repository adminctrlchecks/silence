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
import { createRemedySchema, updateRemedySchema, type Category } from '@silence/shared';
import { ZodValidationPipe } from '../common/zod-validation.pipe';
import { CreateRemedyDto, UpdateRemedyDto } from '../common/dto';
import { AdminJwtGuard } from '../auth/guards/admin-jwt.guard';
import { RemediesService } from './remedies.service';

/** Admin remedies — docs/API.md §4. */
@ApiTags('admin: remedies')
@ApiBearerAuth('admin')
@Controller('admin/remedies')
@UseGuards(AdminJwtGuard)
export class AdminRemediesController {
  constructor(private readonly remedies: RemediesService) {}

  @Get()
  list(
    @Query('category') category?: Category,
    @Query('lang') lang?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.remedies.list(
      category,
      lang,
      page ? Number(page) : undefined,
      limit ? Number(limit) : undefined,
    );
  }

  @Post()
  create(@Body(new ZodValidationPipe(createRemedySchema)) body: CreateRemedyDto) {
    return this.remedies.create(body);
  }

  @Put(':id')
  update(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(updateRemedySchema)) body: UpdateRemedyDto,
  ) {
    return this.remedies.update(id, body);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.remedies.remove(id);
  }
}
