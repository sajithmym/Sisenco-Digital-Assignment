import { Injectable } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { ReportStatus, UserRole } from '../common/enums';
import { DASHBOARD_SETTINGS } from '../settings';

@Injectable()
export class DashboardService {
  constructor(private prisma: PrismaService) {}

  async getSummary(weekStart?: string, weekEnd?: string) {
    const dateFilter = this.buildDateFilter(weekStart, weekEnd);

    const [
      totalReports,
      submittedCount,
      approvedCount,
      needsCorrectionCount,
      draftCount,
      totalTeamMembers,
      openBlockers,
    ] = await Promise.all([
      this.prisma.report.count({ where: dateFilter }),
      this.prisma.report.count({ where: { ...dateFilter, status: ReportStatus.SUBMITTED } }),
      this.prisma.report.count({ where: { ...dateFilter, status: ReportStatus.APPROVED } }),
      this.prisma.report.count({ where: { ...dateFilter, status: ReportStatus.NEEDS_CORRECTION } }),
      this.prisma.report.count({ where: { ...dateFilter, status: ReportStatus.DRAFT } }),
      this.prisma.user.count({ where: { isActive: true, role: UserRole.TEAM_MEMBER } }),
      this.prisma.blocker.count({ where: { isResolved: false } }),
    ]);

    const complianceRate = totalTeamMembers > 0
      ? Math.round((submittedCount / totalTeamMembers) * 100)
      : 0;

    return {
      totalReports,
      submittedCount,
      approvedCount,
      needsCorrectionCount,
      draftCount,
      totalTeamMembers,
      openBlockers,
      complianceRate,
    };
  }

  async getStatusDistribution(weekStart?: string, weekEnd?: string) {
    const dateFilter = this.buildDateFilter(weekStart, weekEnd);

    const distribution = await this.prisma.report.groupBy({
      by: ['status'],
      where: dateFilter,
      _count: { status: true },
    });

    return distribution.map((item) => ({
      status: item.status,
      count: item._count.status,
    }));
  }

  async getTaskTrends(weeks: number = DASHBOARD_SETTINGS.defaultTaskTrendWeeks) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - weeks * 7);

    const reports = await this.prisma.report.findMany({
      where: {
        weekStart: { gte: startDate },
        status: { not: ReportStatus.DRAFT },
      },
      include: {
        tasks: { select: { status: true } },
      },
      orderBy: { weekStart: 'asc' },
    });

    // Group by week
    const trends = reports.reduce((acc, report) => {
      const weekKey = new Date(report.weekStart).toISOString().split('T')[0];
      if (!acc[weekKey]) {
        acc[weekKey] = { week: weekKey, total: 0, completed: 0 };
      }
      acc[weekKey].total += report.tasks.length;
      acc[weekKey].completed += report.tasks.filter(
        (t) => t.status === (DASHBOARD_SETTINGS.completedTaskStatus as any),
      ).length;
      return acc;
    }, {} as Record<string, { week: string; total: number; completed: number }>);

    return Object.values(trends);
  }

  async getProjectWorkload(weekStart?: string, weekEnd?: string) {
    const dateFilter = this.buildDateFilter(weekStart, weekEnd);

    const projects = await this.prisma.project.findMany({
      where: { isActive: true },
      include: {
        reports: {
          where: dateFilter,
          include: {
            tasks: { select: { actualMinutes: true } },
          },
        },
      },
    });

    return projects.map((project) => ({
      projectId: project.id,
      projectName: project.name,
      reportCount: project.reports.length,
      totalMinutes: project.reports.reduce(
        (sum, r) => sum + r.tasks.reduce((tSum, t) => tSum + t.actualMinutes, 0),
        0,
      ),
    }));
  }

  async getTimeDistribution(weekStart?: string, weekEnd?: string) {
    const dateFilter = this.buildDateFilter(weekStart, weekEnd);

    const workHours = await this.prisma.workHour.groupBy({
      by: ['type'],
      where: {
        report: dateFilter,
      },
      _sum: { minutes: true },
    });

    return workHours.map((item) => ({
      type: item.type,
      totalMinutes: item._sum.minutes || 0,
    }));
  }

  async getRecentActivity(limit: number = DASHBOARD_SETTINGS.defaultActivityLimit) {
    const reviews = await this.prisma.review.findMany({
      take: limit,
      include: {
        reviewer: { select: { id: true, name: true } },
        report: {
          include: {
            user: { select: { id: true, name: true } },
            project: { select: { id: true, name: true } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return reviews.map((review) => ({
      id: review.id,
      action: review.action,
      comment: review.comment,
      createdAt: review.createdAt,
      reviewer: review.reviewer,
      report: {
        id: review.report.id,
        weekStart: review.report.weekStart,
        weekEnd: review.report.weekEnd,
        user: review.report.user,
        project: review.report.project,
      },
    }));
  }

  private buildDateFilter(weekStart?: string, weekEnd?: string) {
    const filter: any = {};
    if (weekStart) filter.weekStart = { gte: new Date(weekStart) };
    if (weekEnd) filter.weekEnd = { lte: new Date(weekEnd) };
    return filter;
  }
}
