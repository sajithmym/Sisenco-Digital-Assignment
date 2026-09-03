import {
  Injectable,
  BadRequestException,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { ReportStatus, UserRole, ReviewAction } from '../common/enums';

@Injectable()
export class ReportWorkflowService {
  constructor(private prisma: PrismaService) {}

  /**
   * Submit a report (DRAFT or NEEDS_CORRECTION → SUBMITTED)
   */
  async submit(reportId: string, userId: string) {
    const report = await this.prisma.report.findUnique({
      where: { id: reportId },
      include: {
        tasks: true,
        nextWeekTasks: true,
        blockers: true,
        achievements: true,
        workHours: true,
        project: true,
      },
    });

    if (!report) throw new NotFoundException('Report not found');
    if (report.userId !== userId) throw new ForbiddenException('Not your report');

    const editableStatuses = [ReportStatus.DRAFT, ReportStatus.NEEDS_CORRECTION];
    if (!editableStatuses.includes(report.status as ReportStatus)) {
      throw new BadRequestException(`Cannot submit report in ${report.status} status`);
    }

    // Create version snapshot in a transaction
    const nextVersion = report.latestVersionNumber + 1;
    const snapshot = this.createSnapshot(report);

    return this.prisma.$transaction(async (tx) => {
      // Create immutable version
      await tx.reportVersion.create({
        data: {
          reportId,
          versionNumber: nextVersion,
          snapshotJson: snapshot,
          createdById: userId,
        },
      });

      // Update report status
      return tx.report.update({
        where: { id: reportId },
        data: {
          status: ReportStatus.SUBMITTED,
          latestVersionNumber: nextVersion,
          submittedAt: new Date(),
        },
      });
    });
  }

  /**
   * Manager requests changes (SUBMITTED → NEEDS_CORRECTION)
   */
  async requestChanges(reportId: string, reviewerId: string, comment: string) {
    if (!comment || comment.trim().length === 0) {
      throw new BadRequestException('Comment is required when requesting changes');
    }

    const report = await this.prisma.report.findUnique({
      where: { id: reportId },
    });

    if (!report) throw new NotFoundException('Report not found');
    if (report.status !== ReportStatus.SUBMITTED) {
      throw new BadRequestException('Report is not in SUBMITTED status');
    }

    // Find the version being reviewed
    const version = await this.prisma.reportVersion.findFirst({
      where: {
        reportId,
        versionNumber: report.latestVersionNumber,
      },
    });

    return this.prisma.$transaction(async (tx) => {
      // Create review record
      await tx.review.create({
        data: {
          reportId,
          reportVersionId: version?.id,
          reviewerId,
          action: ReviewAction.CHANGES_REQUESTED,
          comment,
        },
      });

      // Update report status
      return tx.report.update({
        where: { id: reportId },
        data: { status: ReportStatus.NEEDS_CORRECTION },
      });
    });
  }

  /**
   * Manager approves report (SUBMITTED → APPROVED)
   */
  async approve(reportId: string, reviewerId: string) {
    const report = await this.prisma.report.findUnique({
      where: { id: reportId },
    });

    if (!report) throw new NotFoundException('Report not found');
    if (report.status !== ReportStatus.SUBMITTED) {
      throw new BadRequestException('Report is not in SUBMITTED status');
    }

    const version = await this.prisma.reportVersion.findFirst({
      where: {
        reportId,
        versionNumber: report.latestVersionNumber,
      },
    });

    return this.prisma.$transaction(async (tx) => {
      // Create approval review
      await tx.review.create({
        data: {
          reportId,
          reportVersionId: version?.id,
          reviewerId,
          action: ReviewAction.APPROVED,
        },
      });

      // Update report status
      return tx.report.update({
        where: { id: reportId },
        data: {
          status: ReportStatus.APPROVED,
          approvedAt: new Date(),
        },
      });
    });
  }

  /**
   * Get version history for a report
   */
  async getVersionHistory(reportId: string) {
    return this.prisma.reportVersion.findMany({
      where: { reportId },
      include: {
        createdBy: { select: { id: true, name: true } },
        reviews: {
          include: {
            reviewer: { select: { id: true, name: true } },
          },
        },
      },
      orderBy: { versionNumber: 'desc' },
    });
  }

  private createSnapshot(report: any) {
    return {
      id: report.id,
      userId: report.userId,
      projectId: report.projectId,
      projectName: report.project?.name,
      weekStart: report.weekStart,
      weekEnd: report.weekEnd,
      status: report.status,
      notes: report.notes,
      tasks: report.tasks,
      nextWeekTasks: report.nextWeekTasks,
      blockers: report.blockers,
      achievements: report.achievements,
      workHours: report.workHours,
    };
  }
}
