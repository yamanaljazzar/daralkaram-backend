import { Min, IsInt, IsEnum, IsOptional, IsNotEmpty } from 'class-validator';

import { Level } from '@prisma/client';

export class CreateClassDto {
  @IsNotEmpty({ message: 'Academic year ID is required' })
  academicYearId: string;

  @IsNotEmpty({ message: 'Template ID is required' })
  templateId: string;

  @IsOptional()
  @IsNotEmpty({ message: 'Teacher ID should not be empty' })
  teacherId?: string;

  @IsNotEmpty({ message: 'Level is required' })
  @IsEnum(Level, { message: 'Level must be one of: KG1, KG2, KG3, FIRST_GRADE' })
  level: Level;

  @IsOptional()
  @IsInt({ message: 'Max capacity must be a number' })
  @Min(1, { message: 'Max capacity must be at least 1' })
  maxCapacity?: number;
}

export class UpdateClassDto {
  @IsOptional()
  @IsNotEmpty({ message: 'Academic year ID should not be empty' })
  academicYearId?: string;

  @IsOptional()
  @IsNotEmpty({ message: 'Template ID should not be empty' })
  templateId?: string;

  @IsOptional()
  @IsNotEmpty({ message: 'Teacher ID should not be empty' })
  teacherId?: string;

  @IsOptional()
  @IsEnum(Level, { message: 'Level must be one of: KG1, KG2, KG3, FIRST_GRADE' })
  level?: Level;

  @IsOptional()
  @IsInt({ message: 'Max capacity must be a number' })
  @Min(1, { message: 'Max capacity must be at least 1' })
  maxCapacity?: number;
}

export class ClassResponseDto {
  id: string;
  level: Level;
  maxCapacity?: number;
  createdAt: Date;
  updatedAt: Date;
  academicYearId: string;
  templateId: string;
  teacherId?: string;
  academicYear?: {
    id: string;
    name: string;
    startDate: Date;
    endDate: Date;
    isActive: boolean;
  };
  template?: {
    id: string;
    name: string;
    isActive: boolean;
  };
  teacher?: {
    id: string;
    email?: string;
    phone?: string;
    role: string;
    isActive: boolean;
  };
}
