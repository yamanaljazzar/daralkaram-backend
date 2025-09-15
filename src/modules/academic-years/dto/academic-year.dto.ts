import { Type } from 'class-transformer';
import { IsString, IsBoolean, IsNotEmpty, IsOptional, IsDateString } from 'class-validator';

export class CreateAcademicYearDto {
  @IsNotEmpty({ message: 'Academic year name is required' })
  @IsString({ message: 'Academic year name must be a string' })
  name: string;

  @IsNotEmpty({ message: 'Start date is required' })
  @IsDateString({}, { message: 'Start date must be a valid date' })
  @Type(() => Date)
  startDate: Date;

  @IsNotEmpty({ message: 'End date is required' })
  @IsDateString({}, { message: 'End date must be a valid date' })
  @Type(() => Date)
  endDate: Date;
}

export class UpdateAcademicYearDto {
  @IsOptional()
  @IsString({ message: 'Academic year name must be a string' })
  name?: string;

  @IsOptional()
  @IsDateString({}, { message: 'Start date must be a valid date' })
  @Type(() => Date)
  startDate?: Date;

  @IsOptional()
  @IsDateString({}, { message: 'End date must be a valid date' })
  @Type(() => Date)
  endDate?: Date;

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
