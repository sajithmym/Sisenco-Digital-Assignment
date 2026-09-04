import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Body,
  Query,
  Req,
  UseGuards,
  ForbiddenException,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto, UpdateUserRoleDto, UpdateUserStatusDto, UserFilterDto } from './dto';
import { JwtAuthGuard, RolesGuard } from '../common/guards';
import { Roles } from '../common/decorators';
import { UserRole } from '../common/enums';
import { ApiResponse } from '../common/dto';
import { RequestWithUser } from '../common/interfaces';

@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  async findAll(@Query() filters: UserFilterDto) {
    try {
      const result = await this.usersService.findAll(filters);
      return ApiResponse.paginated(result.data, result.meta, 'Users fetched successfully');
    } catch (error) {
      // Rethrow — GlobalExceptionFilter formats and sends the actual error message.
      throw error;
    }
  }

  @Post()
  @Roles(UserRole.ADMIN)
  async create(@Body() dto: CreateUserDto) {
    const data = await this.usersService.create(dto);
    return ApiResponse.created(data, 'User created successfully');
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
  async updateRole(@Param('id') id: string, @Req() req: RequestWithUser, @Body() dto: UpdateUserRoleDto) {
    try {
      if (id === req.user.sub) throw new ForbiddenException('You cannot change your own role');
      const data = await this.usersService.updateRole(id, dto.role);
      return ApiResponse.success(data, 'User role updated successfully');
    } catch (error) {
      throw error;
    }
  }

  @Patch(':id/status')
  @Roles(UserRole.ADMIN)
  async updateStatus(@Param('id') id: string, @Req() req: RequestWithUser, @Body() dto: UpdateUserStatusDto) {
    try {
      if (id === req.user.sub) throw new ForbiddenException('You cannot change your own account status');
      const data = await this.usersService.updateStatus(id, dto.isActive);
      return ApiResponse.success(data, 'User status updated successfully');
    } catch (error) {
      throw error;
    }
  }
}
