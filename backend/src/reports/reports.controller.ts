import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Body,
  Query,
  Req,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ReportsService } from './reports.service';
import { ReportWorkflowService } from './report-workflow.service';
import { CreateReportDto, UpdateReportDto, ReportFilterDto, RequestChangesDto } from './dto';
import { JwtAuthGuard, RolesGuard } from '../common/guards';
import { Roles } from '../common/decorators';
import { UserRole } from '../common/enums';
import { ApiResponse } from '../common/dto';
import { RequestWithUser } from '../common/interfaces';

@Controller()
@UseGuards(JwtAuthGuard, RolesGuard)
export class ReportsController {
  constructor(
    private readonly reportsService: ReportsService,
    private readonly workflowService: ReportWorkflowService,
  ) {}

  // ─── Member Endpoints ──────────────────────────────────

  @Post('reports')
  async create(@Req() req: RequestWithUser, @Body() dto: CreateReportDto) {
    try {
      const data = await this.reportsService.create(req.user.sub, dto);
      return ApiResponse.created(data, 'Report created successfully');
    } catch (error) {
      // Rethrow — GlobalExceptionFilter formats and sends the actual error message.
      throw error;
    }
  }

  @Get('reports/my')
  async findMyReports(
    @Req() req: RequestWithUser,
    @Query() pagination: ReportFilterDto,
  ) {
    try {
      const result = await this.reportsService.findMyReports(req.user.sub, pagination);
      return ApiResponse.paginated(result.data, result.meta, 'Reports fetched successfully');
    } catch (error) {
      throw error;
    }
  }

  @Get('reports/:id')
  async findById(@Param('id') id: string, @Req() req: RequestWithUser) {
    try {
      const data = await this.reportsService.findById(id, req.user.sub, req.user.role);
      return ApiResponse.success(data, 'Report fetched successfully');
    } catch (error) {
      throw error;
    }
  }

  @Patch('reports/:id')
  async update(
    @Param('id') id: string,
    @Req() req: RequestWithUser,
    @Body() dto: UpdateReportDto,
  ) {
    try {
      const data = await this.reportsService.update(id, req.user.sub, dto);
      return ApiResponse.success(data, 'Report updated successfully');
    } catch (error) {
      throw error;
    }
  }

  @Post('reports/:id/submit')
  @HttpCode(HttpStatus.OK)
  async submit(@Param('id') id: string, @Req() req: RequestWithUser) {
    try {
      const data = await this.workflowService.submit(id, req.user.sub);
      return ApiResponse.success(data, 'Report submitted successfully');
    } catch (error) {
      throw error;
    }
  }

  @Get('reports/:id/versions')
  async getVersionHistory(@Param('id') id: string, @Req() req: RequestWithUser) {
    try {
      await this.reportsService.findById(id, req.user.sub, req.user.role);
      const data = await this.workflowService.getVersionHistory(id);
      return ApiResponse.success(data, 'Version history fetched successfully');
    } catch (error) {
      throw error;
    }
  }

  // ─── Manager Endpoints ─────────────────────────────────

  @Get('manager/reports')
  @Roles(UserRole.MANAGER, UserRole.ADMIN)
  async findTeamReports(@Query() filters: ReportFilterDto) {
    try {
      const result = await this.reportsService.findByFilters(filters);
      return ApiResponse.paginated(result.data, result.meta, 'Reports fetched successfully');
    } catch (error) {
      throw error;
    }
  }

  @Get('manager/reports/:id')
  @Roles(UserRole.MANAGER, UserRole.ADMIN)
  async findTeamReportById(@Param('id') id: string, @Req() req: RequestWithUser) {
    try {
      const data = await this.reportsService.findById(id, req.user.sub, req.user.role);
      return ApiResponse.success(data, 'Report fetched successfully');
    } catch (error) {
      throw error;
    }
  }

  @Post('manager/reports/:id/request-changes')
  @Roles(UserRole.MANAGER, UserRole.ADMIN)
  @HttpCode(HttpStatus.OK)
  async requestChanges(
    @Param('id') id: string,
    @Req() req: RequestWithUser,
    @Body() dto: RequestChangesDto,
  ) {
    try {
      const data = await this.workflowService.requestChanges(id, req.user.sub, dto.comment);
      return ApiResponse.success(data, 'Changes requested successfully');
    } catch (error) {
      throw error;
    }
  }

  @Post('manager/reports/:id/approve')
  @Roles(UserRole.MANAGER, UserRole.ADMIN)
  @HttpCode(HttpStatus.OK)
  async approve(@Param('id') id: string, @Req() req: RequestWithUser) {
    try {
      const data = await this.workflowService.approve(id, req.user.sub);
      return ApiResponse.success(data, 'Report approved successfully');
    } catch (error) {
      throw error;
    }
  }
}
