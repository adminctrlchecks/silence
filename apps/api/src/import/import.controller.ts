import {
  Controller,
  Get,
  Param,
  Post,
  Query,
  Res,
  UploadedFile,
  UseGuards,
  UseInterceptors,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import * as XLSX from 'xlsx';
import type { Response } from 'express';
import { IMPORT_TYPES, type ImportType } from '@silence/shared';
import { AdminJwtGuard } from '../auth/guards/admin-jwt.guard';
import { ImportService } from './import.service';

/** Excel import (Import Mode) — docs/API.md §6. */
@Controller('admin/import')
@UseGuards(AdminJwtGuard)
export class ImportController {
  constructor(private readonly imports: ImportService) {}

  @Get('template')
  template(@Query('type') type: ImportType, @Res() res: Response) {
    if (!IMPORT_TYPES.includes(type)) throw new BadRequestException('Invalid type');
    const cols = this.imports.templateColumns(type);
    const example = this.imports.templateExample(type);
    const ws = XLSX.utils.aoa_to_sheet([cols, example]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'template');
    const buf = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
    res
      .setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
      .setHeader('Content-Disposition', `attachment; filename="${type}-template.xlsx"`)
      .send(buf);
  }

  @Post()
  @UseInterceptors(FileInterceptor('file'))
  async upload(
    @Query('type') type: ImportType,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    if (!IMPORT_TYPES.includes(type)) throw new BadRequestException('Invalid type');
    if (!file) throw new BadRequestException('file is required (.xlsx)');
    return this.imports.importFile(type, file.buffer);
  }

  @Get(':jobId')
  status(@Param('jobId') jobId: string) {
    return this.imports.status(jobId);
  }
}
