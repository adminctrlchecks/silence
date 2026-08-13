import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { autoTranslateSchema } from '@silence/shared';
import { ZodValidationPipe } from '../common/zod-validation.pipe';
import { AutoTranslateDto } from '../common/dto';
import { AdminJwtGuard } from '../auth/guards/admin-jwt.guard';
import { LanguagesService } from './languages.service';

/** Languages & translations — docs/API.md §7. List is public; mutations are admin. */
@ApiTags('languages')
@Controller()
export class LanguagesController {
  constructor(private readonly languages: LanguagesService) {}

  @Get('languages')
  publicList() {
    return this.languages.list();
  }

  @Get('admin/languages')
  @ApiBearerAuth('admin')
  @UseGuards(AdminJwtGuard)
  adminList() {
    return this.languages.list();
  }

  @Post('admin/languages')
  @ApiBearerAuth('admin')
  @UseGuards(AdminJwtGuard)
  add(@Body() body: { code: string; name: string; rtl?: boolean }) {
    return this.languages.add(body);
  }

  @Post('admin/translations/auto')
  @ApiBearerAuth('admin')
  @UseGuards(AdminJwtGuard)
  autoTranslate(@Body(new ZodValidationPipe(autoTranslateSchema)) body: AutoTranslateDto) {
    return this.languages.autoTranslate(body);
  }
}
