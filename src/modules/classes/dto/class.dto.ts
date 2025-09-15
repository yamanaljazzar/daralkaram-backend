import { Min, IsInt, IsUUID, IsString, IsOptional, IsNotEmpty } from 'class-validator';

export class CreateClassDto {
  @IsNotEmpty({ message: 'Academic year ID is required' })
  @IsUUID('4', { message: 'Academic year ID must be a valid UUID' })
  academicYearId: string;

  @IsNotEmpty({ message: 'Template ID is required' })
  @IsUUID('4', { message: 'Template ID must be a valid UUID' })
  templateId: string;

  @IsOptional()
  @IsUUID('4', { message: 'Teacher ID must be a valid UUID' })
  teacherId?: string;

  @IsNotEmpty({ message: 'Level is required' })
  @IsString({ message: 'Level must be a string' })
  level: string;

  @IsOptional()
  @IsInt({ message: 'Max capacity must be a number' })
  @Min(1, { message: 'Max capacity must be at least 1' })
  maxCapacity?: number;
}

export class UpdateClassDto {
  @IsOptional()
  @IsUUID('4', { message: 'Teacher ID must be a valid UUID' })
  teacherId?: string;

  @IsOptional()
  @IsString({ message: 'Level must be a string' })
  level?: string;

  @IsOptional()
  @IsInt({ message: 'Max capacity must be a number' })
  @Min(1, { message: 'Max capacity must be at least 1' })
  maxCapacity?: number;
}

export class ClassResponseDto {
  id: string;
  level: string;
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
