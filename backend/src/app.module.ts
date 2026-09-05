import { Module } from "@nestjs/common";
import { ThrottlerModule } from "@nestjs/throttler";
import { APP_GUARD } from "@nestjs/core";
import { ThrottlerGuard } from "@nestjs/throttler";
import { SERVER_SETTINGS } from "./settings";
import { DatabaseModule } from "./database/database.module";
import { AuthModule } from "./auth/auth.module";
import { UsersModule } from "./users/users.module";
import { ProjectsModule } from "./projects/projects.module";
import { ReportsModule } from "./reports/reports.module";
import { ReviewsModule } from "./reviews/reviews.module";
import { DashboardModule } from "./dashboard/dashboard.module";
import { HealthModule } from "./health/health.module";

@Module({
  imports: [
    ThrottlerModule.forRoot([
      {
        ttl: SERVER_SETTINGS.apiRateLimit.ttlMilliseconds,
        limit: SERVER_SETTINGS.apiRateLimit.maxRequests,
      },
    ]),
    DatabaseModule,
    AuthModule,
    UsersModule,
    ProjectsModule,
    ReportsModule,
    ReviewsModule,
    DashboardModule,
    HealthModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
