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

@Injectable()
export class ReportsService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, dto: CreateReportDto) {
    if (new Date(dto.weekEnd) < new Date(dto.weekStart)) {
      throw new BadRequestException('Week end must be after or equal to week start');
    }
    this.ensureSingleKeyItem(dto.blockers, 'isKeyIssue', 'Only one blocker can be marked as the key issue');
    this.ensureSingleKeyItem(dto.achievements, 'isKeyAchievement', 'Only one achievement can be marked as the key achievement');
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
        projectId: dto.projectId || undefined,
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

    if (dto.weekStart && dto.weekEnd && new Date(dto.weekEnd) < new Date(dto.weekStart)) {
      throw new BadRequestException('Week end must be after or equal to week start');
    }
    if (dto.projectId) {
      const project = await this.prisma.project.findUnique({ where: { id: dto.projectId }, select: { isActive: true } });
      if (!project) throw new NotFoundException('Project not found');
      if (!project.isActive) throw new BadRequestException('Project is deactivated and cannot be used');
    }
    this.ensureSingleKeyItem(dto.blockers, 'isKeyIssue', 'Only one blocker can be marked as the key issue');
    this.ensureSingleKeyItem(dto.achievements, 'isKeyAchievement', 'Only one achievement can be marked as the key achievement');

    return this.prisma.report.update({
      where: { id },
      data: {
        projectId: dto.projectId === undefined ? undefined : dto.projectId || null,
        weekStart: dto.weekStart ? new Date(dto.weekStart) : undefined,
        weekEnd: dto.weekEnd ? new Date(dto.weekEnd) : undefined,
        notes: dto.notes,
        tasks: dto.tasks === undefined ? undefined : { deleteMany: {}, create: dto.tasks.map((task) => ({ taskName: task.taskName, priority: (task.priority as any) || 'MEDIUM', plannedPercentage: task.plannedPercentage || 0, actualPercentage: task.actualPercentage || 0, status: (task.status as any) || 'TODO', plannedMinutes: task.plannedMinutes || 0, actualMinutes: task.actualMinutes || 0, deliverable: task.deliverable })) },
        nextWeekTasks: dto.nextWeekTasks === undefined ? undefined : { deleteMany: {}, create: dto.nextWeekTasks.map((task, index) => ({ description: task.description, sortOrder: task.sortOrder ?? index })) },
        blockers: dto.blockers === undefined ? undefined : { deleteMany: {}, create: dto.blockers.map((blocker) => ({ description: blocker.description, isKeyIssue: blocker.isKeyIssue || false, isResolved: blocker.isResolved || false })) },
        achievements: dto.achievements === undefined ? undefined : { deleteMany: {}, create: dto.achievements.map((achievement) => ({ description: achievement.description, isKeyAchievement: achievement.isKeyAchievement || false })) },
        workHours: dto.workHours === undefined ? undefined : { deleteMany: {}, create: dto.workHours.map((workHour) => ({ type: workHour.type as any, minutes: workHour.minutes })) },
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

  private ensureSingleKeyItem<T extends Record<string, unknown>>(
    items: T[] | undefined,
    key: keyof T,
    message: string,
  ) {
    if ((items?.filter((item) => item[key] === true).length || 0) > 1) {
      throw new BadRequestException(message);
    }
  }
}
