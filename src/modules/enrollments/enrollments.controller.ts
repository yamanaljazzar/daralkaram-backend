import {
  Get,
  Post,
  Body,
  Patch,
  Param,
  HttpCode,
  UseGuards,
  Controller,
  HttpStatus,
} from '@nestjs/common';

import { UserRole } from '@prisma/client';

import { Roles } from '@/core/decorators';
import { RolesGuard } from '@/core/guards';
import { CurrentUser } from '@/core/decorators';
import { ResponseService } from '@/core/services';
import { JwtAuthGuard } from '@/modules/auth/guards';

import { EnrollmentsService } from './enrollments.service';
import { CreateEnrollmentDto, UpdateEnrollmentDto } from './dto';

@Controller()
@UseGuards(JwtAuthGuard, RolesGuard)
export class EnrollmentsController {
  constructor(
    private readonly responseService: ResponseService,
    private readonly enrollmentsService: EnrollmentsService,
  ) {}

  @Post('students/:studentId/enrollments')
  @HttpCode(HttpStatus.CREATED)
  @Roles(UserRole.ADMIN, UserRole.SUPERVISOR)
  async create(
    @Param('studentId') studentId: string,
    @Body() createEnrollmentDto: CreateEnrollmentDto,
    @CurrentUser('role') userRole: UserRole,
  ) {
    const enrollment = await this.enrollmentsService.create(
      studentId,
      createEnrollmentDto,
      userRole,
    );
    return this.responseService.created(enrollment);
  }

  @Get('students/:studentId/enrollments')
  @HttpCode(HttpStatus.OK)
  @Roles(UserRole.ADMIN, UserRole.SUPERVISOR, UserRole.TEACHER)
  async findByStudentId(@Param('studentId') studentId: string) {
    const enrollments = await this.enrollmentsService.findByStudentId(studentId);
    return this.responseService.success(enrollments);
  }

  @Get('classes/:classId/students')
  @HttpCode(HttpStatus.OK)
  @Roles(UserRole.ADMIN, UserRole.SUPERVISOR, UserRole.TEACHER)
  async findByClassId(
    @Param('classId') classId: string,
    @CurrentUser('role') userRole: UserRole,
    @CurrentUser('id') userId: string,
  ) {
    const enrollments = await this.enrollmentsService.findByClassId(classId, userRole, userId);
    return this.responseService.success(enrollments);
  }

  @Get('enrollments/:id')
  @HttpCode(HttpStatus.OK)
  @Roles(UserRole.ADMIN, UserRole.SUPERVISOR, UserRole.TEACHER)
  async findOne(@Param('id') id: string) {
    const enrollment = await this.enrollmentsService.findById(id);
    return this.responseService.success(enrollment);
  }

  @Patch('enrollments/:id')
  @Roles(UserRole.ADMIN, UserRole.SUPERVISOR)
  @HttpCode(HttpStatus.OK)
  async update(
    @Param('id') id: string,
    @Body() updateEnrollmentDto: UpdateEnrollmentDto,
    @CurrentUser('role') userRole: UserRole,
  ) {
    const enrollment = await this.enrollmentsService.update(id, updateEnrollmentDto, userRole);
    return this.responseService.success(enrollment);
  }
}
