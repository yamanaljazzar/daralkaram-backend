import {
  Get,
  Body,
  Post,
  Param,
  Patch,
  Query,
  Delete,
  HttpCode,
  UseGuards,
  Controller,
  HttpStatus,
} from '@nestjs/common';

import { UserRole } from '@prisma/client';

import { Roles } from '@/core/decorators';
import { RolesGuard } from '@/core/guards';
import { JwtAuthGuard } from '@/modules/auth/guards';
import { ApiResponse, PaginatedData, ResponseService } from '@/core/services';

import { UsersService } from './users.service';
import { CreateUserDto, UpdateUserDto, UserResponseDto, FindUsersQueryDto } from './dto';

@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly responseService: ResponseService,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @Roles(UserRole.ADMIN, UserRole.SUPERVISOR)
  async create(@Body() createUserDto: CreateUserDto): Promise<ApiResponse<UserResponseDto>> {
    const user = await this.usersService.create(createUserDto);
    return this.responseService.created(user);
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  @Roles(UserRole.ADMIN, UserRole.SUPERVISOR)
  async findAll(
    @Query() query: FindUsersQueryDto,
  ): Promise<ApiResponse<PaginatedData<UserResponseDto>>> {
    const { limit, page, role, search } = query;
    const filters = { role, search };
    const result = await this.usersService.findAll(page, limit, filters);
    return this.responseService.paginated(result.data, result.total, page, limit);
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @Roles(UserRole.ADMIN, UserRole.SUPERVISOR)
  async findOne(@Param('id') id: string): Promise<ApiResponse<UserResponseDto>> {
    const user = await this.usersService.findOne(id);
    return this.responseService.success(user);
  }

  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  @Roles(UserRole.ADMIN, UserRole.SUPERVISOR)
  async update(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<ApiResponse<UserResponseDto>> {
    const user = await this.usersService.update(id, updateUserDto);
    return this.responseService.success(user, 'User updated successfully');
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @Roles(UserRole.ADMIN)
  async remove(@Param('id') id: string): Promise<ApiResponse<UserResponseDto>> {
    const user = await this.usersService.remove(id);
    return this.responseService.success(user, 'User deleted successfully');
  }
}
