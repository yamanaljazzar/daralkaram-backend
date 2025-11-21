import { IsString, IsOptional } from 'class-validator';

import { PaginationDto } from '@/common/dto';

export class FindGuardiansQueryDto extends PaginationDto {
  @IsOptional()
  @IsString()
  search?: string;
}
