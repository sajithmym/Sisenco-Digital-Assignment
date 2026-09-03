import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { CreateReportDto, UpdateReportDto, ReportFilterDto } from './dto';
import { PaginatedResponse } from '../common/dto';
import { ReportStatus, UserRole } from '../common/enums';
import { PAGINATION_SETTINGS } from '../settings';

@Injectable()
export class ReportsService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, dto: CreateReportDto) {
    // Validate the referenced project up-front so the UI gets a clear error
    // instead of a generic foreign-key failure from the database.
    if (dto.projectId) {
      const project = await this.prisma.project.findUnique({
        where: { id: dto.projectId },
        select: { id: true, isActive: true },
      });

      if (!project) {
        throw new NotFoundException('Project not found');
      }

      if (!project.isActive) {
        throw new BadRequestException('Project is deactivated and cannot be used');
      }
    }

    return this.prisma.report.create({
      data: {
        userId,
        projectId: dto.projectId,
        weekStart: new Date(dto.weekStart),
        weekEnd: new Date(dto.weekEnd),
        notes: dto.notes,
        status: ReportStatus.DRAFT,
        tasks: dto.tasks
          ? {
              create: dto.tasks.map((t) => ({
                taskName: t.taskName,
                priority: (t.priority as any) || 'MEDIUM',
                plannedPercentage: t.plannedPercentage || 0,
                actualPercentage: t.actualPercentage || 0,
                status: (t.status as any) || 'TODO',
                plannedMinutes: t.plannedMinutes || 0,
                actualMinutes: t.actualMinutes || 0,
                deliverable: t.deliverable,
              })),
            }
          : undefined,
        nextWeekTasks: dto.nextWeekTasks
          ? {
              create: dto.nextWeekTasks.map((t, i) => ({
                description: t.description,
                sortOrder: t.sortOrder ?? i,
              })),
            }
          : undefined,
        blockers: dto.blockers
          ? {
              create: dto.blockers.map((b) => ({
                description: b.description,
                isKeyIssue: b.isKeyIssue || false,
                isResolved: b.isResolved || false,
              })),
            }
          : undefined,
        achievements: dto.achievements
          ? {
              create: dto.achievements.map((a) => ({
                description: a.description,
                isKeyAchievement: a.isKeyAchievement || false,
              })),
            }
          : undefined,
        workHours: dto.workHours
          ? {
              create: dto.workHours.map((w) => ({
                type: w.type as any,
                minutes: w.minutes,
              })),
            }
          : undefined,
      },
      include: {
        tasks: true,
        nextWeekTasks: { orderBy: { sortOrder: 'asc' } },
        blockers: true,
        achievements: true,
        workHours: true,
        project: true,
      },
    });
  }

  async findMyReports(userId: string, pagination: ReportFilterDto) {
    const { page, limit } = pagination;
    const skip = (page - 1) * limit;

    const where = { userId };

    const [reports, total] = await Promise.all([
      this.prisma.report.findMany({
        where,
        skip,
        take: limit,
        include: {
          project: { select: { id: true, name: true } },
          tasks: { select: { id: true, taskName: true, status: true } },
        },
        orderBy: { weekStart: 'desc' },
      }),
      this.prisma.report.count({ where }),
    ]);

    return new PaginatedResponse(reports, total, page, limit);
  }

  async findById(id: string, userId: string, userRole: UserRole) {
    const report = await this.prisma.report.findUnique({
      where: { id },
      include: {
        user: { select: { id: true, name: true, email: true } },
        project: true,
        tasks: true,
        nextWeekTasks: { orderBy: { sortOrder: 'asc' } },
        blockers: true,
        achievements: true,
        workHours: true,
        versions: { orderBy: { versionNumber: 'desc' } },
        reviews: {
          include: {
            reviewer: { select: { id: true, name: true } },
            reportVersion: true,
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!report) {
      throw new NotFoundException('Report not found');
    }

    // Ownership check for team members
    if (userRole === UserRole.TEAM_MEMBER && report.userId !== userId) {
      throw new ForbiddenException('You do not have access to this report');
    }

    return report;
  }

  async update(id: string, userId: string, dto: UpdateReportDto) {
    const report = await this.prisma.report.findUnique({ where: { id } });

    if (!report) {
      throw new NotFoundException('Report not found');
    }

    if (report.userId !== userId) {
      throw new ForbiddenException('You can only edit your own reports');
    }

    if (report.status !== ReportStatus.DRAFT && report.status !== ReportStatus.NEEDS_CORRECTION) {
      throw new ForbiddenException('Report is not editable in current status');
    }

    // Update report and related data
    return this.prisma.report.update({
      where: { id },
      data: {
        projectId: dto.projectId,
        weekStart: dto.weekStart ? new Date(dto.weekStart) : undefined,
        weekEnd: dto.weekEnd ? new Date(dto.weekEnd) : undefined,
        notes: dto.notes,
      },
      include: {
        tasks: true,
        nextWeekTasks: true,
        blockers: true,
        achievements: true,
        workHours: true,
      },
    });
  }

  async findByFilters(filters: ReportFilterDto) {
    const { page, limit, userId, projectId, status, weekStart, weekEnd } = filters;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (userId) where.userId = userId;
    if (projectId) where.projectId = projectId;
    if (status) where.status = status;
    if (weekStart) where.weekStart = { gte: new Date(weekStart) };
    if (weekEnd) where.weekEnd = { lte: new Date(weekEnd) };

    const [reports, total] = await Promise.all([
      this.prisma.report.findMany({
        where,
        skip,
        take: limit,
        include: {
          user: { select: { id: true, name: true, email: true } },
          project: { select: { id: true, name: true } },
          tasks: { select: { id: true, taskName: true, status: true } },
        },
        orderBy: { weekStart: 'desc' },
      }),
      this.prisma.report.count({ where }),
    ]);

    return new PaginatedResponse(reports, total, page, limit);
  }
}
