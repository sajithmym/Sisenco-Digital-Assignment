import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Body,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ReportsService } from './reports.service';
import { ReportWorkflowService } from './report-workflow.service';
import { CreateReportDto, UpdateReportDto, ReportFilterDto } from './dto';
import { JwtAuthGuard, RolesGuard } from '../common/guards';
import { CurrentUser, Roles } from '../common/decorators';
import { UserRole } from '../common/enums';

@Controller()
@UseGuards(JwtAuthGuard, RolesGuard)
export class ReportsController {
  constructor(
    private readonly reportsService: ReportsService,
    private readonly workflowService: ReportWorkflowService,
  ) {}

  // ─── Member Endpoints ──────────────────────────────────

  @Post('reports')
  create(
    @CurrentUser('sub') userId: string,
    @Body() dto: CreateReportDto,
  ) {
    return this.reportsService.create(userId, dto);
  }

  @Get('reports/my')
  findMyReports(
    @CurrentUser('sub') userId: string,
    @Query() pagination: ReportFilterDto,
  ) {
    return this.reportsService.findMyReports(userId, pagination);
  }

  @Get('reports/:id')
  findById(
    @Param('id') id: string,
    @CurrentUser('sub') userId: string,
    @CurrentUser('role') userRole: UserRole,
  ) {
    return this.reportsService.findById(id, userId, userRole);
  }

  @Patch('reports/:id')
  update(
    @Param('id') id: string,
    @CurrentUser('sub') userId: string,
    @Body() dto: UpdateReportDto,
  ) {
    return this.reportsService.update(id, userId, dto);
  }

  @Post('reports/:id/submit')
  @HttpCode(HttpStatus.OK)
  submit(
    @Param('id') id: string,
    @CurrentUser('sub') userId: string,
  ) {
    return this.workflowService.submit(id, userId);
  }

  @Get('reports/:id/versions')
  getVersionHistory(@Param('id') id: string) {
    return this.workflowService.getVersionHistory(id);
  }

  // ─── Manager Endpoints ─────────────────────────────────

  @Get('manager/reports')
  @Roles(UserRole.MANAGER, UserRole.ADMIN)
  findTeamReports(@Query() filters: ReportFilterDto) {
    return this.reportsService.findByFilters(filters);
  }

  @Get('manager/reports/:id')
  @Roles(UserRole.MANAGER, UserRole.ADMIN)
  findTeamReportById(
    @Param('id') id: string,
    @CurrentUser('sub') userId: string,
    @CurrentUser('role') userRole: UserRole,
  ) {
    return this.reportsService.findById(id, userId, userRole);
  }

  @Post('manager/reports/:id/request-changes')
  @Roles(UserRole.MANAGER, UserRole.ADMIN)
  @HttpCode(HttpStatus.OK)
  requestChanges(
    @Param('id') id: string,
    @CurrentUser('sub') reviewerId: string,
    @Body('comment') comment: string,
  ) {
    return this.workflowService.requestChanges(id, reviewerId, comment);
  }

  @Post('manager/reports/:id/approve')
  @Roles(UserRole.MANAGER, UserRole.ADMIN)
  @HttpCode(HttpStatus.OK)
  approve(
    @Param('id') id: string,
    @CurrentUser('sub') reviewerId: string,
  ) {
    return this.workflowService.approve(id, reviewerId);
  }
}
