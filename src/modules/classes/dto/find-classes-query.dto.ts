import { IsEnum, IsString, IsOptional } from 'class-validator';

import { Level } from '@prisma/client';

import { PaginationDto } from '@/common/dto';

export class FindClassesQueryDto extends PaginationDto {
  @IsOptional()
  @IsEnum(Level)
  level?: Level;

  @IsOptional()
  @IsString()
  templateId?: string;

  @IsOptional()
  @IsString()
  academicYearId?: string;

  @IsOptional()
  @IsString()
  search?: string;
}
