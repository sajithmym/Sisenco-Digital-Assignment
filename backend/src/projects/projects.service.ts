import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { CreateProjectDto, UpdateProjectDto, ProjectFilterDto } from './dto';
import { PaginatedResponse } from '../common/dto';
import { PROJECT_SETTINGS } from '../settings';

@Injectable()
export class ProjectsService {
  constructor(private prisma: PrismaService) {}

  async findAll(filters: ProjectFilterDto) {
    const { page, limit, search, isActive } = filters;
    const skip = (page - 1) * limit;
    const where = {
      ...(isActive === undefined ? {} : { isActive }),
      ...(search?.trim()
        ? { name: { contains: search.trim(), mode: 'insensitive' as const } }
        : {}),
    };

    const [projects, total] = await Promise.all([
      this.prisma.project.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.project.count({ where }),
    ]);

    return new PaginatedResponse(projects, total, page, limit);
  }

  async findById(id: string) {
    const project = await this.prisma.project.findUnique({
      where: { id },
    });

    if (!project) {
      throw new NotFoundException(PROJECT_SETTINGS.messages.notFound);
    }

    return project;
  }

  async create(dto: CreateProjectDto) {
    return this.prisma.project.create({
      data: {
        name: dto.name,
        description: dto.description,
      },
    });
  }

  async update(id: string, dto: UpdateProjectDto) {
    const project = await this.prisma.project.findUnique({ where: { id } });

    if (!project) {
      throw new NotFoundException(PROJECT_SETTINGS.messages.notFound);
    }

    return this.prisma.project.update({
      where: { id },
      data: dto,
    });
  }

  async remove(id: string) {
    const project = await this.prisma.project.findUnique({ where: { id } });

    if (!project) {
      throw new NotFoundException(PROJECT_SETTINGS.messages.notFound);
    }

    // Soft delete — deactivate instead of hard delete
    return this.prisma.project.update({
      where: { id },
      data: { isActive: false },
    });
  }
}
