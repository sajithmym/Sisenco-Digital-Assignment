import { Module } from '@nestjs/common';
import { ReportsController } from './reports.controller';
import { ReportsService } from './reports.service';
import { ReportWorkflowService } from './report-workflow.service';

@Module({
  controllers: [ReportsController],
  providers: [ReportsService, ReportWorkflowService],
  exports: [ReportsService, ReportWorkflowService],
})
export class ReportsModule {}
