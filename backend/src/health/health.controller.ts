import { Controller, Get } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { ApiResponse } from '../common/dto';

@Controller()
export class HealthController {
  constructor(private prisma: PrismaService) {}

  @Get('health')
  async check() {
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      return ApiResponse.success(
        {
          status: 'ok',
          database: 'connected',
        },
        'Service is healthy',
      );
    } catch (error) {
      // Health checks report degraded state instead of throwing.
      return ApiResponse.success(
        {
          status: 'error',
          database: 'disconnected',
        },
        'Service is unhealthy',
      );
    }
  }
}