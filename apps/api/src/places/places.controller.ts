import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { GeocodeService } from '../integrations/geocode/geocode.service';

@ApiTags('places')
@Controller('places')
export class PlacesController {
  constructor(private readonly geocode: GeocodeService) {}

  @Get('search')
  async search(@Query('q') q: string) {
    return this.geocode.search(q || '');
  }
}
