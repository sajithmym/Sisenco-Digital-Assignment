import { Controller, Get, ServiceUnavailableException } from '@nestjs/common';
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
    } catch {
      throw new ServiceUnavailableException('Service is unhealthy');
    }
  }
}