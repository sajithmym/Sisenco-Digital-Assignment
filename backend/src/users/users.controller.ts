import {
  Controller,
  Get,
  Patch,
  Param,
  Body,
  Query,
  UseGuards,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { UpdateUserRoleDto, UpdateUserStatusDto } from './dto';
import { JwtAuthGuard, RolesGuard } from '../common/guards';
import { Roles } from '../common/decorators';
import { UserRole } from '../common/enums';
import { ApiResponse, PaginationDto } from '../common/dto';

@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  async findAll(@Query() pagination: PaginationDto) {
    try {
      const result = await this.usersService.findAll(pagination);
      return ApiResponse.paginated(result.data, result.meta, 'Users fetched successfully');
    } catch (error) {
      // Rethrow — GlobalExceptionFilter formats and sends the actual error message.
      throw error;
    }
  }

  @Get(':id')
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  async findById(@Param('id') id: string) {
    try {
      const data = await this.usersService.findById(id);
      return ApiResponse.success(data, 'User fetched successfully');
    } catch (error) {
      throw error;
    }
  }

  @Patch(':id/role')
  @Roles(UserRole.ADMIN)
  async updateRole(@Param('id') id: string, @Body() dto: UpdateUserRoleDto) {
    try {
      const data = await this.usersService.updateRole(id, dto.role);
      return ApiResponse.success(data, 'User role updated successfully');
    } catch (error) {
      throw error;
    }
  }

  @Patch(':id/status')
  @Roles(UserRole.ADMIN)
  async updateStatus(@Param('id') id: string, @Body() dto: UpdateUserStatusDto) {
    try {
      const data = await this.usersService.updateStatus(id, dto.isActive);
      return ApiResponse.success(data, 'User status updated successfully');
    } catch (error) {
      throw error;
    }
  }
}