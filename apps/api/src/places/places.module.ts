import { Module } from '@nestjs/common';
import { GeocodeModule } from '../integrations/geocode/geocode.module';
import { PlacesController } from './places.controller';

@Module({
  imports: [GeocodeModule],
  controllers: [PlacesController],
})
export class PlacesModule {}
