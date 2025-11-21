import {
  Get,
  Post,
  Body,
  Patch,
  Param,
  Query,
  HttpCode,
  UseGuards,
  Controller,
  HttpStatus,
} from '@nestjs/common';

import { UserRole } from '@prisma/client';

import { RolesGuard } from '@/core/guards';
import { JwtAuthGuard } from '@/modules/auth/guards';
import { Roles, CurrentUser } from '@/core/decorators';
import { ApiResponse, PaginatedData, ResponseService } from '@/core/services';

import { StudentsService } from './students.service';
import { CreateStudentDto, StudentResponseDto, FindStudentsQueryDto } from './dto';

@Controller('students')
@UseGuards(JwtAuthGuard, RolesGuard)
export class StudentsController {
  constructor(
    private readonly responseService: ResponseService,
    private readonly studentsService: StudentsService,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @Roles(UserRole.ADMIN, UserRole.SUPERVISOR)
  async create(
    @Body() createStudentDto: CreateStudentDto,
    @CurrentUser('role') userRole: UserRole,
  ) {
    const result = await this.studentsService.create(createStudentDto, userRole);
    return this.responseService.success(result);
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  @Roles(UserRole.ADMIN, UserRole.SUPERVISOR, UserRole.TEACHER)
  async findAll(
    @Query() query: FindStudentsQueryDto,
  ): Promise<ApiResponse<PaginatedData<StudentResponseDto>>> {
    const { limit, page } = query;
    const result = await this.studentsService.findAll(query);
    return this.responseService.paginated(result.data, result.total, page, limit);
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @Roles(UserRole.ADMIN, UserRole.SUPERVISOR, UserRole.TEACHER)
  async findOne(@Param('id') id: string) {
    const result = await this.studentsService.findById(id);
    return this.responseService.success(result);
  }

  @Patch(':id/approve')
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.OK)
  async approve(@Param('id') id: string) {
    const result = await this.studentsService.approve(id);
    return this.responseService.success(result);
  }

  @Patch(':id/reject')
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.OK)
  async reject(@Param('id') id: string) {
    const result = await this.studentsService.reject(id);
    return this.responseService.success(result);
  }
}
