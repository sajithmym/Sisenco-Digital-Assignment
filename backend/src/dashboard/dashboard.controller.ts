import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { JwtAuthGuard, RolesGuard } from '../common/guards';
import { Roles } from '../common/decorators';
import { UserRole } from '../common/enums';
import { ApiResponse } from '../common/dto';
import { API_RESPONSE_MESSAGES } from '../settings';
import { ActivityFilterDto, DashboardDateFilterDto, TaskTrendFilterDto } from './dto';

@Controller('manager/dashboard')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.MANAGER, UserRole.ADMIN)
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('summary')
  async getSummary(@Query() filters: DashboardDateFilterDto) {
    try {
      const data = await this.dashboardService.getSummary(filters.weekStart, filters.weekEnd);
      return ApiResponse.success(data, API_RESPONSE_MESSAGES.dashboard.summaryFetched);
    } catch (error) {
      // Rethrow — GlobalExceptionFilter formats and sends the actual error message.
      throw error;
    }
  }

  @Get('status-distribution')
  async getStatusDistribution(@Query() filters: DashboardDateFilterDto) {
    try {
      const data = await this.dashboardService.getStatusDistribution(filters.weekStart, filters.weekEnd);
      return ApiResponse.success(data, API_RESPONSE_MESSAGES.dashboard.statusDistributionFetched);
    } catch (error) {
      throw error;
    }
  }

  @Get('task-trends')
  async getTaskTrends(@Query() filters: TaskTrendFilterDto) {
    try {
      const data = await this.dashboardService.getTaskTrends(filters.weeks);
      return ApiResponse.success(data, API_RESPONSE_MESSAGES.dashboard.taskTrendsFetched);
    } catch (error) {
      throw error;
    }
  }

  @Get('project-workload')
  async getProjectWorkload(@Query() filters: DashboardDateFilterDto) {
    try {
      const data = await this.dashboardService.getProjectWorkload(filters.weekStart, filters.weekEnd);
      return ApiResponse.success(data, API_RESPONSE_MESSAGES.dashboard.projectWorkloadFetched);
    } catch (error) {
      throw error;
    }
  }

  @Get('time-distribution')
  async getTimeDistribution(@Query() filters: DashboardDateFilterDto) {
    try {
      const data = await this.dashboardService.getTimeDistribution(filters.weekStart, filters.weekEnd);
      return ApiResponse.success(data, API_RESPONSE_MESSAGES.dashboard.timeDistributionFetched);
    } catch (error) {
      throw error;
    }
  }

  @Get('activity')
  async getRecentActivity(@Query() filters: ActivityFilterDto) {
    try {
      const data = await this.dashboardService.getRecentActivity(filters.limit);
      return ApiResponse.success(data, API_RESPONSE_MESSAGES.dashboard.recentActivityFetched);
    } catch (error) {
      throw error;
    }
  }
}
