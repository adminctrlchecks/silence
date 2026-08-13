import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { HealthModule } from './health/health.module';
import { AuthModule } from './auth/auth.module';
import { QuestionsModule } from './questions/questions.module';
import { AnswersModule } from './answers/answers.module';
import { RemediesModule } from './remedies/remedies.module';
import { ChartModule } from './chart/chart.module';
import { LanguagesModule } from './languages/languages.module';
import { UsersModule } from './users/users.module';
import { ResponsesModule } from './responses/responses.module';
import { ImportModule } from './import/import.module';
import { GeminiModule } from './integrations/gemini/gemini.module';
import { AstrologyModule } from './integrations/astrology/astrology.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    HealthModule,
    AuthModule,
    QuestionsModule,
    AnswersModule,
    RemediesModule,
    ChartModule,
    LanguagesModule,
    UsersModule,
    ResponsesModule,
    ImportModule,
    GeminiModule,
    AstrologyModule,
  ],
})
export class AppModule {}
