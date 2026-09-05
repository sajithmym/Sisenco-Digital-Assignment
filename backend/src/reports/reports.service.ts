import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../database/prisma.service';
import { CreateReportDto, UpdateReportDto, ReportFilterDto } from './dto';
import { PaginatedResponse } from '../common/dto';
import { ReportStatus, UserRole } from '../common/enums';
import { REPORT_SETTINGS } from '../settings';

@Injectable()
export class ReportsService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, dto: CreateReportDto) {
    if (new Date(dto.weekEnd) < new Date(dto.weekStart)) {
      throw new BadRequestException(REPORT_SETTINGS.messages.invalidWeekRange);
    }
    this.ensureSingleKeyItem(dto.blockers, 'isKeyIssue', REPORT_SETTINGS.messages.onlyOneKeyIssue);
    this.ensureSingleKeyItem(dto.achievements, 'isKeyAchievement', REPORT_SETTINGS.messages.onlyOneKeyAchievement);
    await this.ensureWeeklyReportIsUnique(userId, new Date(dto.weekStart));
    // Validate the referenced project up-front so the UI gets a clear error
    // instead of a generic foreign-key failure from the database.
    if (dto.projectId) {
      const project = await this.prisma.project.findUnique({
        where: { id: dto.projectId },
        select: { id: true, isActive: true },
      });

      if (!project) {
        throw new NotFoundException(REPORT_SETTINGS.messages.projectNotFound);
      }

      if (!project.isActive) {
        throw new BadRequestException(REPORT_SETTINGS.messages.inactiveProject);
      }
    }

    return this.prisma.report.create({
      data: {
        userId,
        projectId: dto.projectId || undefined,
        weekStart: new Date(dto.weekStart),
        weekEnd: new Date(dto.weekEnd),
        notes: dto.notes,
        status: ReportStatus.DRAFT,
        tasks: dto.tasks
          ? {
              create: dto.tasks.map((t) => ({
                taskName: t.taskName,
                priority: (t.priority ?? REPORT_SETTINGS.defaultTaskPriority) as Prisma.ReportTaskCreateWithoutReportInput['priority'],
                plannedPercentage: t.plannedPercentage || 0,
                actualPercentage: t.actualPercentage || 0,
                status: (t.status ?? REPORT_SETTINGS.defaultTaskStatus) as Prisma.ReportTaskCreateWithoutReportInput['status'],
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
                type: w.type as Prisma.WorkHourCreateWithoutReportInput['type'],
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
      throw new NotFoundException(REPORT_SETTINGS.messages.reportNotFound);
    }

    // Ownership check for team members
    if (userRole === UserRole.TEAM_MEMBER && report.userId !== userId) {
      throw new ForbiddenException(REPORT_SETTINGS.messages.reportAccessDenied);
    }

    return report;
  }

  async update(id: string, userId: string, dto: UpdateReportDto) {
    const report = await this.prisma.report.findUnique({ where: { id } });

    if (!report) {
      throw new NotFoundException(REPORT_SETTINGS.messages.reportNotFound);
    }

    if (report.userId !== userId) {
      throw new ForbiddenException(REPORT_SETTINGS.messages.reportOwnershipDenied);
    }

    if (report.status !== ReportStatus.DRAFT && report.status !== ReportStatus.NEEDS_CORRECTION) {
      throw new ForbiddenException(REPORT_SETTINGS.messages.reportReadOnly);
    }

    const effectiveWeekStart = dto.weekStart ? new Date(dto.weekStart) : report.weekStart;
    const effectiveWeekEnd = dto.weekEnd ? new Date(dto.weekEnd) : report.weekEnd;
    if (effectiveWeekEnd < effectiveWeekStart) {
      throw new BadRequestException(REPORT_SETTINGS.messages.invalidWeekRange);
    }
    if (dto.weekStart) {
      await this.ensureWeeklyReportIsUnique(userId, effectiveWeekStart, id);
    }
    if (dto.projectId) {
      const project = await this.prisma.project.findUnique({ where: { id: dto.projectId }, select: { isActive: true } });
      if (!project) throw new NotFoundException(REPORT_SETTINGS.messages.projectNotFound);
      if (!project.isActive) throw new BadRequestException(REPORT_SETTINGS.messages.inactiveProject);
    }
    this.ensureSingleKeyItem(dto.blockers, 'isKeyIssue', REPORT_SETTINGS.messages.onlyOneKeyIssue);
    this.ensureSingleKeyItem(dto.achievements, 'isKeyAchievement', REPORT_SETTINGS.messages.onlyOneKeyAchievement);

    return this.prisma.report.update({
      where: { id },
      data: {
        projectId: dto.projectId === undefined ? undefined : dto.projectId || null,
        weekStart: dto.weekStart ? new Date(dto.weekStart) : undefined,
        weekEnd: dto.weekEnd ? new Date(dto.weekEnd) : undefined,
        notes: dto.notes,
        tasks: dto.tasks === undefined ? undefined : { deleteMany: {}, create: dto.tasks.map((task) => ({ taskName: task.taskName, priority: (task.priority ?? REPORT_SETTINGS.defaultTaskPriority) as Prisma.ReportTaskCreateWithoutReportInput['priority'], plannedPercentage: task.plannedPercentage || 0, actualPercentage: task.actualPercentage || 0, status: (task.status ?? REPORT_SETTINGS.defaultTaskStatus) as Prisma.ReportTaskCreateWithoutReportInput['status'], plannedMinutes: task.plannedMinutes || 0, actualMinutes: task.actualMinutes || 0, deliverable: task.deliverable })) },
        nextWeekTasks: dto.nextWeekTasks === undefined ? undefined : { deleteMany: {}, create: dto.nextWeekTasks.map((task, index) => ({ description: task.description, sortOrder: task.sortOrder ?? index })) },
        blockers: dto.blockers === undefined ? undefined : { deleteMany: {}, create: dto.blockers.map((blocker) => ({ description: blocker.description, isKeyIssue: blocker.isKeyIssue || false, isResolved: blocker.isResolved || false })) },
        achievements: dto.achievements === undefined ? undefined : { deleteMany: {}, create: dto.achievements.map((achievement) => ({ description: achievement.description, isKeyAchievement: achievement.isKeyAchievement || false })) },
        workHours: dto.workHours === undefined ? undefined : { deleteMany: {}, create: dto.workHours.map((workHour) => ({ type: workHour.type as Prisma.WorkHourCreateWithoutReportInput['type'], minutes: workHour.minutes })) },
      },
      include: {
        project: true,
        tasks: true,
        nextWeekTasks: { orderBy: { sortOrder: 'asc' } },
        blockers: true,
        achievements: true,
        workHours: true,
      },
    });
  }

  async findByFilters(filters: ReportFilterDto) {
    const { page, limit, userId, projectId, status, weekStart, weekEnd } = filters;
    const skip = (page - 1) * limit;

    const where: Prisma.ReportWhereInput = {};

    if (userId) where.userId = userId;
    if (projectId) where.projectId = projectId;
    if (status) where.status = status as Prisma.ReportWhereInput['status'];
    const filterWeekStart = weekStart ? new Date(weekStart) : undefined;
    const filterWeekEnd = weekEnd ? this.endOfDay(weekEnd) : undefined;
    if (filterWeekStart && filterWeekEnd && filterWeekEnd < filterWeekStart) {
      throw new BadRequestException(REPORT_SETTINGS.messages.invalidWeekRange);
    }
    if (filterWeekStart) where.weekStart = { gte: filterWeekStart };
    if (filterWeekEnd) where.weekEnd = { lte: filterWeekEnd };

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

  private ensureSingleKeyItem<T>(
    items: T[] | undefined,
    key: keyof T,
    message: string,
  ) {
    if ((items?.filter((item) => item[key] === true).length || 0) > 1) {
      throw new BadRequestException(message);
    }
  }

  private async ensureWeeklyReportIsUnique(
    userId: string,
    weekStart: Date,
    excludedReportId?: string,
  ) {
    const existingReport = await this.prisma.report.findFirst({
      where: {
        userId,
        weekStart,
        ...(excludedReportId ? { id: { not: excludedReportId } } : {}),
      },
      select: { id: true },
    });

    if (existingReport) {
      throw new BadRequestException(REPORT_SETTINGS.messages.reportAlreadyExists);
    }
  }

  private endOfDay(value: string) {
    const date = new Date(value);
    date.setUTCHours(23, 59, 59, 999);
    return date;
  }
}
