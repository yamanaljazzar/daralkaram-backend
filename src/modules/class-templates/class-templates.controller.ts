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
  ParseBoolPipe,
  DefaultValuePipe,
} from '@nestjs/common';

import { UserRole } from '@prisma/client';

import { Roles, RolesGuard } from '@/core';
import { JwtAuthGuard } from '@/modules/auth/guards';
import { ApiResponse, ResponseService } from '@/core/services';

import { ClassTemplatesService } from './class-templates.service';
import { CreateClassTemplateDto, UpdateClassTemplateDto, ClassTemplateResponseDto } from './dto';

@Controller('class-templates')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN, UserRole.SUPERVISOR)
export class ClassTemplatesController {
  constructor(
    private readonly classTemplatesService: ClassTemplatesService,
    private readonly responseService: ResponseService,
  ) {}

  @HttpCode(HttpStatus.CREATED)
  @Post()
  async create(
    @Body() createClassTemplateDto: CreateClassTemplateDto,
  ): Promise<ApiResponse<ClassTemplateResponseDto>> {
    const result = await this.classTemplatesService.create(createClassTemplateDto);
    return this.responseService.created(result);
  }

  @HttpCode(HttpStatus.OK)
  @Get()
  async findAll(
    @Query('includeArchived', new DefaultValuePipe(false), ParseBoolPipe) includeArchived: boolean,
  ): Promise<ApiResponse<ClassTemplateResponseDto[]>> {
    const result = await this.classTemplatesService.findAll(includeArchived);
    return this.responseService.success(result);
  }

  @HttpCode(HttpStatus.OK)
  @Get(':id')
  async findOne(@Param('id') id: string): Promise<ApiResponse<ClassTemplateResponseDto>> {
    const result = await this.classTemplatesService.findOne(id);
    return this.responseService.success(result);
  }

  @HttpCode(HttpStatus.OK)
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateClassTemplateDto: UpdateClassTemplateDto,
  ): Promise<ApiResponse<ClassTemplateResponseDto>> {
    const result = await this.classTemplatesService.update(id, updateClassTemplateDto);
    return this.responseService.success(result);
  }

  @HttpCode(HttpStatus.OK)
  @Delete(':id')
  async remove(@Param('id') id: string): Promise<ApiResponse<ClassTemplateResponseDto>> {
    const result = await this.classTemplatesService.remove(id);
    return this.responseService.success(result);
  }

  @HttpCode(HttpStatus.OK)
  @Post(':id/restore')
  async restore(@Param('id') id: string): Promise<ApiResponse<ClassTemplateResponseDto>> {
    const result = await this.classTemplatesService.restore(id);
    return this.responseService.success(result);
  }
}
