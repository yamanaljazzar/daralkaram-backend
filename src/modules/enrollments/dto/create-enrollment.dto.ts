import { IsEnum, IsString, IsNotEmpty } from 'class-validator';

import { TransportationMethod } from '@prisma/client';

export class CreateEnrollmentDto {
  @IsString()
  @IsNotEmpty()
  classId: string;

  @IsEnum(TransportationMethod)
  @IsNotEmpty()
  transportationMethod: TransportationMethod;
}
