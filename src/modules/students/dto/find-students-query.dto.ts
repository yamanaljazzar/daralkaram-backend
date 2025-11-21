import { IsEnum, IsString, IsOptional } from 'class-validator';

import { StudentStatus } from '@prisma/client';

import { PaginationDto } from '@/common/dto';

export class FindStudentsQueryDto extends PaginationDto {
  @IsOptional()
  @IsEnum(StudentStatus)
  status?: StudentStatus;

  // @IsOptional()
  // @IsEnum(RegistrationType)
  // registrationType?: RegistrationType;

  @IsOptional()
  @IsString()
  search?: string; // For searching by name
}
