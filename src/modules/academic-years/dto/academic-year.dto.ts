import { Type } from 'class-transformer';
import { IsDate, IsString, IsBoolean, IsNotEmpty, IsOptional } from 'class-validator';

export class CreateAcademicYearDto {
  @IsNotEmpty({ message: 'Academic year name is required' })
  @IsString({ message: 'Academic year name must be a string' })
  name: string;

  @IsNotEmpty({ message: 'Start date is required' })
  @IsDate()
  @Type(() => Date)
  startDate: string;

  @IsNotEmpty({ message: 'End date is required' })
  @IsDate()
  @Type(() => Date)
  endDate: string;

  @IsOptional()
  @IsBoolean({ message: 'isActive must be a boolean' })
  isActive?: boolean;
}

export class UpdateAcademicYearDto {
  @IsOptional()
  @IsNotEmpty({ message: 'Academic year name should not be empty' })
  @IsString({ message: 'Academic year name must be a string' })
  name?: string;

  @IsOptional()
  @IsNotEmpty({ message: 'Start date should not be empty' })
  @IsDate()
  @Type(() => Date)
  startDate?: string;

  @IsOptional()
  @IsNotEmpty({ message: 'End date should not be empty' })
  @IsDate()
  @Type(() => Date)
  endDate?: string;

  @IsOptional()
  @IsBoolean({ message: 'isActive must be a boolean' })
  isActive?: boolean;
}

export class AcademicYearResponseDto {
  id: string;
  name: string;
  startDate: Date;
  endDate: Date;
  isActive: boolean;
  createdAt: Date;
}
