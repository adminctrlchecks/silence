import {
  Body,
  Controller,
  ForbiddenException,
  Get,
  Param,
  Put,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import type { Request } from 'express';
import { updateUserProfileSchema } from '@silence/shared';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AdminJwtGuard } from '../auth/guards/admin-jwt.guard';
import { UpdateUserProfileDto } from '../common/dto';
import { ZodValidationPipe } from '../common/zod-validation.pipe';
import { UserJwtGuard } from '../auth/guards/user-jwt.guard';
import { ChartService } from '../chart/chart.service';
import { RemediesService } from '../remedies/remedies.service';
import { UsersService } from './users.service';

type AuthenticatedRequest = Request & { user?: { id?: string; role?: string } };

function assertOwnUser(req: AuthenticatedRequest, id: string) {
  if (req.user?.id !== id) {
    throw new ForbiddenException('You can only access your own user record');
  }
}

/** User profile, chart, remedy, history - docs/API.md sections 9-10. */
@ApiTags('user: profile')
@ApiBearerAuth('user')
@Controller('users')
@UseGuards(UserJwtGuard)
export class UsersController {
  constructor(
    private readonly users: UsersService,
    private readonly chart: ChartService,
    private readonly remedies: RemediesService,
  ) {}

  @Get(':id')
  get(@Param('id') id: string, @Req() req: AuthenticatedRequest) {
    assertOwnUser(req, id);
    return this.users.get(id);
  }

  @Put(':id')
  update(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(updateUserProfileSchema)) body: UpdateUserProfileDto,
    @Req() req: AuthenticatedRequest,
  ) {
    assertOwnUser(req, id);
    return this.users.update(id, body);
  }

  @Get(':id/history')
  history(@Param('id') id: string, @Req() req: AuthenticatedRequest, @Query('lang') lang?: string) {
    assertOwnUser(req, id);
    return this.users.history(id, lang);
  }

  @Get(':id/chart')
  chartFor(@Param('id') id: string, @Req() req: AuthenticatedRequest, @Query('lang') lang?: string) {
    assertOwnUser(req, id);
    return this.chart.generateForUser(id, lang ?? 'en');
  }

  @Get(':id/remedy')
  async remedyFor(@Param('id') id: string, @Req() req: AuthenticatedRequest, @Query('lang') lang?: string) {
    assertOwnUser(req, id);
    const user = await this.users.get(id);
    return this.remedies.forCategory(user.category, lang);
  }
}

@ApiTags('admin: users')
@ApiBearerAuth('admin')
@Controller('admin/users')
@UseGuards(AdminJwtGuard)
export class AdminUsersController {
  constructor(private readonly users: UsersService) {}

  @Get()
  list(@Query('page') page?: string, @Query('limit') limit?: string) {
    return this.users.listForAdmin(page ? Number(page) : undefined, limit ? Number(limit) : undefined);
  }

  @Get(':id')
  get(@Param('id') id: string) {
    return this.users.getForAdmin(id);
  }
}
