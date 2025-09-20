import {
  Get,
  Post,
  Body,
  Patch,
  Param,
  Query,
  Delete,
  HttpCode,
  UseGuards,
  Controller,
  HttpStatus,
} from '@nestjs/common';

import { UserRole } from '@prisma/client';

import { Roles, RolesGuard } from '@/core';
import { JwtAuthGuard } from '@/modules/auth/guards';
import { ApiResponse, PaginatedData, ResponseService } from '@/core/services';

import { ClassesService } from './classes.service';
import { CreateClassDto, UpdateClassDto, ClassResponseDto, FindClassesQueryDto } from './dto';

@Controller('classes')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN, UserRole.SUPERVISOR)
export class ClassesController {
  constructor(
    private readonly classesService: ClassesService,
    private readonly responseService: ResponseService,
  ) {}

  @HttpCode(HttpStatus.CREATED)
  @Post()
  async create(@Body() createClassDto: CreateClassDto): Promise<ApiResponse<ClassResponseDto>> {
    const result = await this.classesService.create(createClassDto);
    return this.responseService.created(result);
  }

  @HttpCode(HttpStatus.OK)
  @Get()
  async findAll(
    @Query() query: FindClassesQueryDto,
  ): Promise<ApiResponse<PaginatedData<ClassResponseDto>>> {
    const result = await this.classesService.findAll(query.page, query.limit, query.academicYearId);
    return this.responseService.paginated(result.data, result.total, query.page, query.limit);
  }

  @HttpCode(HttpStatus.OK)
  @Get(':id')
  async findOne(@Param('id') id: string): Promise<ApiResponse<ClassResponseDto>> {
    const result = await this.classesService.findOne(id);
    return this.responseService.success(result);
  }

  @HttpCode(HttpStatus.OK)
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateClassDto: UpdateClassDto,
  ): Promise<ApiResponse<ClassResponseDto>> {
    const result = await this.classesService.update(id, updateClassDto);
    return this.responseService.success(result);
  }

  @HttpCode(HttpStatus.OK)
  @Delete(':id')
  async remove(@Param('id') id: string): Promise<ApiResponse<ClassResponseDto>> {
    const result = await this.classesService.remove(id);
    return this.responseService.success(result);
  }
}
