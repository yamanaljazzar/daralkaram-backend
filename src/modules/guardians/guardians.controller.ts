import {
  Get,
  Body,
  Post,
  Patch,
  Query,
  Param,
  Delete,
  HttpCode,
  UseGuards,
  Controller,
  HttpStatus,
} from '@nestjs/common';

import { UserRole } from '@prisma/client';

import { Roles } from '@/core/decorators';
import { RolesGuard } from '@/core/guards';
import { ApiResponse, PaginatedData, ResponseService } from '@/core/services';

import { JwtAuthGuard } from '../auth/guards';
import { GuardiansService } from './guardians.service';
import {
  UpdateGuardianDto,
  CreateGuardianDto,
  GuardianResponseDto,
  FindGuardiansQueryDto,
} from './dto';

// -------------------------------------------------------------

@Controller('guardians')
@UseGuards(JwtAuthGuard, RolesGuard)
export class GuardiansController {
  constructor(
    private readonly guardiansService: GuardiansService,
    private readonly responseService: ResponseService,
  ) {}

  @HttpCode(HttpStatus.OK)
  @Get()
  @Roles(UserRole.ADMIN, UserRole.SUPERVISOR, UserRole.TEACHER)
  async findAll(
    @Query() query: FindGuardiansQueryDto,
  ): Promise<ApiResponse<PaginatedData<GuardianResponseDto>>> {
    const { limit, page, search } = query;
    const filters = { search };
    const result = await this.guardiansService.findAll(page, limit, filters);
    return this.responseService.paginated(result.data, result.total, page, limit);
  }

  @HttpCode(HttpStatus.OK)
  @Get(':id')
  @Roles(UserRole.ADMIN, UserRole.SUPERVISOR, UserRole.TEACHER)
  async findOne(@Param('id') id: string): Promise<ApiResponse<GuardianResponseDto>> {
    const result = await this.guardiansService.findById(id);
    return this.responseService.success(result);
  }

  @HttpCode(HttpStatus.OK)
  @Get('phone/:phone')
  @Roles(UserRole.ADMIN, UserRole.SUPERVISOR, UserRole.TEACHER)
  async findByPhone(
    @Param('phone') phone: string,
  ): Promise<ApiResponse<GuardianResponseDto | null>> {
    const result = await this.guardiansService.findByPhone(phone);
    return this.responseService.success(result);
  }

  @HttpCode(HttpStatus.CREATED)
  @Post()
  @Roles(UserRole.ADMIN, UserRole.SUPERVISOR)
  async create(
    @Body() createGuardianDto: CreateGuardianDto,
  ): Promise<ApiResponse<GuardianResponseDto>> {
    const result = await this.guardiansService.create(createGuardianDto);
    return this.responseService.created(result);
  }

  @HttpCode(HttpStatus.OK)
  @Patch(':id')
  @Roles(UserRole.ADMIN, UserRole.SUPERVISOR)
  async update(
    @Param('id') id: string,
    @Body() updateGuardianDto: UpdateGuardianDto,
  ): Promise<ApiResponse<GuardianResponseDto>> {
    const result = await this.guardiansService.update(id, updateGuardianDto);
    return this.responseService.success(result);
  }

  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete(':id')
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string): Promise<ApiResponse<null>> {
    await this.guardiansService.remove(id);
    return this.responseService.noContent();
  }
}
