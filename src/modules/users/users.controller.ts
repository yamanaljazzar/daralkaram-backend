import {
  Get,
  Body,
  Post,
  Param,
  Patch,
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
import { ApiResponse, ResponseService } from '@/core/services';

import { UsersService } from './users.service';
import { CreateUserDto, UpdateUserDto, UserResponseDto } from './dto/user.dto';

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
  async findAll(): Promise<ApiResponse<UserResponseDto[]>> {
    const users = await this.usersService.findAll();
    return this.responseService.success(users);
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
