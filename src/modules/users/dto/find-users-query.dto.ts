import { IsEnum, IsString, IsOptional } from 'class-validator';

import { UserRole } from '@prisma/client';

import { PaginationDto } from '@/common/dto';

export class FindUsersQueryDto extends PaginationDto {
  @IsOptional()
  @IsEnum(UserRole)
  role?: UserRole;

  @IsOptional()
  @IsString()
  search?: string;
}
