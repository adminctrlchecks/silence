import { Body, Controller, Get, Param, Put, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { UserJwtGuard } from '../auth/guards/user-jwt.guard';
import { UsersService } from './users.service';
import { ChartService } from '../chart/chart.service';
import { RemediesService } from '../remedies/remedies.service';

/** User profile, chart, remedy, history — docs/API.md §9–10. */
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
  get(@Param('id') id: string) {
    return this.users.get(id);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() body: Record<string, unknown>) {
    return this.users.update(id, body);
  }

  @Get(':id/history')
  history(@Param('id') id: string, @Query('lang') lang?: string) {
    return this.users.history(id, lang);
  }

  // §9 — chart generated from the user's Level 2 data + birth details.
  @Get(':id/chart')
  chartFor(@Param('id') id: string, @Query('lang') lang?: string) {
    return this.chart.generateForUser(id, lang ?? 'en');
  }

  // §9 — remedy for the user (resolved by their category).
  @Get(':id/remedy')
  async remedyFor(@Param('id') id: string, @Query('lang') lang?: string) {
    const user = await this.users.get(id);
    return this.remedies.forCategory(user.category, lang);
  }
}
