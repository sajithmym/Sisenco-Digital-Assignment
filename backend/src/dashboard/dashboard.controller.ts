import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { JwtAuthGuard, RolesGuard } from '../common/guards';
import { Roles } from '../common/decorators';
import { UserRole } from '../common/enums';
import { ApiResponse } from '../common/dto';
import { API_RESPONSE_MESSAGES, DASHBOARD_SETTINGS } from '../settings';

@Controller('manager/dashboard')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.MANAGER, UserRole.ADMIN)
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('summary')
  async getSummary(
    @Query('weekStart') weekStart?: string,
    @Query('weekEnd') weekEnd?: string,
  ) {
    try {
      const data = await this.dashboardService.getSummary(weekStart, weekEnd);
      return ApiResponse.success(data, API_RESPONSE_MESSAGES.dashboard.summaryFetched);
    } catch (error) {
      // Rethrow — GlobalExceptionFilter formats and sends the actual error message.
      throw error;
    }
  }

  @Get('status-distribution')
  async getStatusDistribution(
    @Query('weekStart') weekStart?: string,
    @Query('weekEnd') weekEnd?: string,
  ) {
    try {
      const data = await this.dashboardService.getStatusDistribution(weekStart, weekEnd);
      return ApiResponse.success(data, API_RESPONSE_MESSAGES.dashboard.statusDistributionFetched);
    } catch (error) {
      throw error;
    }
  }

  @Get('task-trends')
  async getTaskTrends(@Query('weeks') weeks?: string) {
    try {
      const data = await this.dashboardService.getTaskTrends(
        weeks ? parseInt(weeks, 10) : DASHBOARD_SETTINGS.defaultTaskTrendWeeks,
      );
      return ApiResponse.success(data, API_RESPONSE_MESSAGES.dashboard.taskTrendsFetched);
    } catch (error) {
      throw error;
    }
  }

  @Get('project-workload')
  async getProjectWorkload(
    @Query('weekStart') weekStart?: string,
    @Query('weekEnd') weekEnd?: string,
  ) {
    try {
      const data = await this.dashboardService.getProjectWorkload(weekStart, weekEnd);
      return ApiResponse.success(data, API_RESPONSE_MESSAGES.dashboard.projectWorkloadFetched);
    } catch (error) {
      throw error;
    }
  }

  @Get('time-distribution')
  async getTimeDistribution(
    @Query('weekStart') weekStart?: string,
    @Query('weekEnd') weekEnd?: string,
  ) {
    try {
      const data = await this.dashboardService.getTimeDistribution(weekStart, weekEnd);
      return ApiResponse.success(data, API_RESPONSE_MESSAGES.dashboard.timeDistributionFetched);
    } catch (error) {
      throw error;
    }
  }

  @Get('activity')
  async getRecentActivity(@Query('limit') limit?: string) {
    try {
      const data = await this.dashboardService.getRecentActivity(
        limit ? parseInt(limit, 10) : DASHBOARD_SETTINGS.defaultActivityLimit,
      );
      return ApiResponse.success(data, API_RESPONSE_MESSAGES.dashboard.recentActivityFetched);
    } catch (error) {
      throw error;
    }
  }
}
