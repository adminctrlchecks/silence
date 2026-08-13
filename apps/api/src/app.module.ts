import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
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
    // Global rate limit: 100 requests / minute per IP (auth routes are stricter).
    ThrottlerModule.forRoot([{ ttl: 60_000, limit: 100 }]),
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
  providers: [
    // Apply rate limiting globally.
    { provide: APP_GUARD, useClass: ThrottlerGuard },
  ],
})
export class AppModule {}
