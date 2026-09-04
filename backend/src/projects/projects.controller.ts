import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ProjectsService } from './projects.service';
import { CreateProjectDto, UpdateProjectDto, ProjectFilterDto } from './dto';
import { JwtAuthGuard, RolesGuard } from '../common/guards';
import { Roles } from '../common/decorators';
import { UserRole } from '../common/enums';
import { ApiResponse } from '../common/dto';

@Controller('projects')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @Get()
  async findAll(@Query() filters: ProjectFilterDto) {
    try {
      const result = await this.projectsService.findAll(filters);
      return ApiResponse.paginated(result.data, result.meta, 'Projects fetched successfully');
    } catch (error) {
      // Rethrow — GlobalExceptionFilter formats and sends the actual error message.
      throw error;
    }
  }

  @Get(':id')
  async findById(@Param('id') id: string) {
    try {
      const data = await this.projectsService.findById(id);
      return ApiResponse.success(data, 'Project fetched successfully');
    } catch (error) {
      throw error;
    }
  }

  @Post()
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  async create(@Body() dto: CreateProjectDto) {
    try {
      const data = await this.projectsService.create(dto);
      return ApiResponse.created(data, 'Project created successfully');
    } catch (error) {
      throw error;
    }
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  async update(@Param('id') id: string, @Body() dto: UpdateProjectDto) {
    try {
      const data = await this.projectsService.update(id, dto);
      return ApiResponse.success(data, 'Project updated successfully');
    } catch (error) {
      throw error;
    }
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  async remove(@Param('id') id: string) {
    try {
      const data = await this.projectsService.remove(id);
      return ApiResponse.success(data, 'Project deactivated successfully');
    } catch (error) {
      throw error;
    }
  }
}
