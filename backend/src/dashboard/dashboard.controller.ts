import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { JwtAuthGuard, RolesGuard } from '../common/guards';
import { Roles } from '../common/decorators';
import { UserRole } from '../common/enums';

@Controller('manager/dashboard')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.MANAGER, UserRole.ADMIN)
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('summary')
  getSummary(
    @Query('weekStart') weekStart?: string,
    @Query('weekEnd') weekEnd?: string,
  ) {
    return this.dashboardService.getSummary(weekStart, weekEnd);
  }

  @Get('status-distribution')
  getStatusDistribution(
    @Query('weekStart') weekStart?: string,
    @Query('weekEnd') weekEnd?: string,
  ) {
    return this.dashboardService.getStatusDistribution(weekStart, weekEnd);
  }

  @Get('task-trends')
  getTaskTrends(@Query('weeks') weeks?: string) {
    return this.dashboardService.getTaskTrends(weeks ? parseInt(weeks) : 8);
  }

  @Get('project-workload')
  getProjectWorkload(
    @Query('weekStart') weekStart?: string,
    @Query('weekEnd') weekEnd?: string,
  ) {
    return this.dashboardService.getProjectWorkload(weekStart, weekEnd);
  }

  @Get('time-distribution')
  getTimeDistribution(
    @Query('weekStart') weekStart?: string,
    @Query('weekEnd') weekEnd?: string,
  ) {
    return this.dashboardService.getTimeDistribution(weekStart, weekEnd);
  }

  @Get('activity')
  getRecentActivity(@Query('limit') limit?: string) {
    return this.dashboardService.getRecentActivity(limit ? parseInt(limit) : 20);
  }
}
