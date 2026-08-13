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
  createRemedySchema,
  updateRemedySchema,
  type Category,
  type CreateRemedyInput,
  type UpdateRemedyInput,
} from '@silence/shared';
import { ZodValidationPipe } from '../common/zod-validation.pipe';
import { AdminJwtGuard } from '../auth/guards/admin-jwt.guard';
import { RemediesService } from './remedies.service';

/** Admin remedies — docs/API.md §4. */
@Controller('admin/remedies')
@UseGuards(AdminJwtGuard)
export class AdminRemediesController {
  constructor(private readonly remedies: RemediesService) {}

  @Get()
  list(@Query('category') category?: Category, @Query('lang') lang?: string) {
    return this.remedies.list(category, lang);
  }

  @Post()
  create(@Body(new ZodValidationPipe(createRemedySchema)) body: CreateRemedyInput) {
    return this.remedies.create(body);
  }

  @Put(':id')
  update(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(updateRemedySchema)) body: UpdateRemedyInput,
  ) {
    return this.remedies.update(id, body);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.remedies.remove(id);
  }
}
