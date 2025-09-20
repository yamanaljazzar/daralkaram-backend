import { IsString, IsOptional } from 'class-validator';

import { PaginationDto } from '@/common/dto';

export class FindClassesQueryDto extends PaginationDto {
  @IsOptional()
  @IsString()
  academicYearId?: string;
}
