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
  ParseBoolPipe,
  DefaultValuePipe,
} from '@nestjs/common';

import { UserRole } from '@prisma/client';

import { Roles, RolesGuard } from '@/core';
import { JwtAuthGuard } from '@/modules/auth/guards';
import { ApiResponse, ResponseService } from '@/core/services';

import { AcademicYearsService } from './academic-years.service';
import { CreateAcademicYearDto, UpdateAcademicYearDto, AcademicYearResponseDto } from './dto';

@Controller('academic-years')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN, UserRole.SUPERVISOR)
export class AcademicYearsController {
  constructor(
    private readonly academicYearsService: AcademicYearsService,
    private readonly responseService: ResponseService,
  ) {}

  @HttpCode(HttpStatus.CREATED)
  @Post()
  async create(
    @Body() createAcademicYearDto: CreateAcademicYearDto,
  ): Promise<ApiResponse<AcademicYearResponseDto>> {
    const result = await this.academicYearsService.create(createAcademicYearDto);

    return this.responseService.created(result);
  }

  @HttpCode(HttpStatus.OK)
  @Get()
  async findAll(
    @Query('active', new DefaultValuePipe(false), ParseBoolPipe) active: boolean,
  ): Promise<ApiResponse<AcademicYearResponseDto[]>> {
    const result = await this.academicYearsService.findAll(active);
    return this.responseService.success(result);
  }

  @HttpCode(HttpStatus.OK)
  @Get(':id')
  async findOne(@Param('id') id: string): Promise<ApiResponse<AcademicYearResponseDto>> {
    const result = await this.academicYearsService.findOne(id);
    return this.responseService.success(result);
  }

  @HttpCode(HttpStatus.OK)
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateAcademicYearDto: UpdateAcademicYearDto,
  ): Promise<ApiResponse<AcademicYearResponseDto>> {
    const result = await this.academicYearsService.update(id, updateAcademicYearDto);
    return this.responseService.success(result);
  }
}
