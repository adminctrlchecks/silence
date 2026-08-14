import { Body, Controller, Get, Param, Post, Put, Query, Req, UseGuards } from '@nestjs/common';
import { updateUserProfileSchema, type Category } from '@silence/shared';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AdminJwtGuard } from '../auth/guards/admin-jwt.guard';
import { UpdateUserProfileDto } from '../common/dto';
import { ZodValidationPipe } from '../common/zod-validation.pipe';
import { UserJwtGuard } from '../auth/guards/user-jwt.guard';
import { assertOwnUser, type AuthenticatedRequest } from '../common/assert-own-user';
import { ChartService } from '../chart/chart.service';
import { RemediesService } from '../remedies/remedies.service';
import { SessionsService } from '../sessions/sessions.service';
import { UsersService, type AdminUserSortBy } from './users.service';

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
    private readonly sessions: SessionsService,
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
  async chartFor(
    @Param('id') id: string,
    @Req() req: AuthenticatedRequest,
    @Query('lang') lang?: string,
    @Query('sessionId') sessionId?: string,
  ) {
    assertOwnUser(req, id);
    if (sessionId) await this.sessions.findOwned(id, sessionId); // 403/404 before doing any work
    const chart = await this.chart.generateForUser(id, lang ?? 'en', sessionId);
    if (sessionId) await this.sessions.markChartReady(sessionId);
    return chart;
  }

  @Get(':id/remedy')
  async remedyFor(
    @Param('id') id: string,
    @Req() req: AuthenticatedRequest,
    @Query('lang') lang?: string,
    @Query('sessionId') sessionId?: string,
  ) {
    assertOwnUser(req, id);
    const user = await this.users.get(id);
    if (!sessionId) return this.remedies.forCategory(user.category, lang);

    await this.sessions.findOwned(id, sessionId); // 403/404 before doing any work
    const existing = await this.sessions.getRemedySnapshot(sessionId);
    if (existing) return existing;

    const remedy = await this.remedies.forCategory(user.category, lang);
    await this.sessions.recordRemedy(sessionId, remedy);
    return remedy;
  }

  @Get(':id/dashboard')
  dashboard(@Param('id') id: string, @Req() req: AuthenticatedRequest) {
    assertOwnUser(req, id);
    return this.sessions.dashboard(id);
  }

  @Post(':id/sessions')
  startOrResumeSession(@Param('id') id: string, @Req() req: AuthenticatedRequest) {
    assertOwnUser(req, id);
    return this.sessions.startOrResume(id);
  }

  @Get(':id/sessions')
  listSessions(
    @Param('id') id: string,
    @Req() req: AuthenticatedRequest,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    assertOwnUser(req, id);
    return this.sessions.list(id, page ? Number(page) : undefined, limit ? Number(limit) : undefined);
  }

  @Get(':id/sessions/:sessionId')
  async sessionDetail(
    @Param('id') id: string,
    @Param('sessionId') sessionId: string,
    @Req() req: AuthenticatedRequest,
  ) {
    assertOwnUser(req, id);
    return this.sessions.getDetail(id, sessionId);
  }
}

@ApiTags('admin: users')
@ApiBearerAuth('admin')
@Controller('admin/users')
@UseGuards(AdminJwtGuard)
export class AdminUsersController {
  constructor(
    private readonly users: UsersService,
    private readonly sessions: SessionsService,
  ) {}

  @Get()
  list(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
    @Query('category') category?: Category,
    @Query('sortBy') sortBy?: AdminUserSortBy,
    @Query('sortDir') sortDir?: 'asc' | 'desc',
  ) {
    return this.users.listForAdmin({
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
      search,
      category,
      sortBy,
      sortDir,
    });
  }

  @Get(':id')
  get(@Param('id') id: string) {
    return this.users.getForAdmin(id);
  }

  /** Admin-scoped equivalent of GET /users/:id/sessions — no ownership check, admin token only. */
  @Get(':id/sessions')
  listSessions(@Param('id') id: string, @Query('page') page?: string, @Query('limit') limit?: string) {
    return this.sessions.list(id, page ? Number(page) : undefined, limit ? Number(limit) : undefined);
  }

  /** Admin-scoped equivalent of GET /users/:id/sessions/:sessionId. */
  @Get(':id/sessions/:sessionId')
  sessionDetail(@Param('id') id: string, @Param('sessionId') sessionId: string) {
    return this.sessions.getDetail(id, sessionId);
  }
}
