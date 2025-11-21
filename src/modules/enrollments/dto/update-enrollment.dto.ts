import { IsEnum, IsString, IsOptional } from 'class-validator';

import { EnrollmentStatus } from '@prisma/client';

export class UpdateEnrollmentDto {
  @IsEnum(EnrollmentStatus)
  @IsOptional()
  status?: EnrollmentStatus;

  @IsString()
  @IsOptional()
  classId?: string;
}
