import { Type } from 'class-transformer';
import { Min, Max, IsInt, IsOptional, IsPositive } from 'class-validator';

export class PaginationDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'Page must be an integer.' })
  @Min(1, { message: 'Page must be at least 1.' })
  page = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'Limit must be an integer.' })
  @IsPositive({ message: 'Limit must be a positive number.' })
  @Max(100, { message: 'Limit cannot exceed 100.' }) // Enforce a max limit
  limit = 10;
}
