import { Type } from 'class-transformer';
import {
  IsInt,
  IsDate,
  IsEnum,
  IsArray,
  IsString,
  IsBoolean,
  IsOptional,
  IsNotEmpty,
  ValidateNested,
} from 'class-validator';

import { ParentMaritalStatus } from '@prisma/client';

import { CreateEnrollmentDto } from '@/modules/enrollments/dto/create-enrollment.dto';

import { GuardianInputDto } from './guardian-input.dto';

export class CreateStudentDto extends CreateEnrollmentDto {
  @IsString()
  firstName: string;

  @IsString()
  lastName: string;

  @IsNotEmpty({ message: 'Date of birth should not be empty' })
  @IsDate()
  @Type(() => Date)
  dateOfBirth: string;

  @IsOptional()
  @IsString()
  photoUrl?: string;

  // @IsOptional()
  // @IsEnum(StudentStatus)
  // status?: StudentStatus;

  // @IsOptional()
  // @IsEnum(RegistrationType)
  // registrationType?: RegistrationType;

  // Detailed fields from the physical registration form
  @IsOptional()
  @IsString()
  homeAddress?: string;

  @IsOptional()
  @IsString()
  homePhone?: string;

  @IsOptional()
  @IsString()
  grandfatherName?: string;

  @IsOptional()
  @IsInt()
  siblingsCount?: number;

  // @IsOptional()
  // @IsString()
  // transportationMethod?: string;

  @IsOptional()
  @IsString()
  pickupPerson?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  personalityTraits?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  fears?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  favoriteColors?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  favoriteFoods?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  favoriteAnimals?: string[];

  @IsOptional()
  @IsBoolean()
  forcedToEat?: boolean;

  @IsOptional()
  @IsString()
  doctorName?: string;

  @IsOptional()
  @IsString()
  doctorPhone?: string;

  @IsOptional()
  @IsString()
  specialConditions?: string;

  @IsOptional()
  @IsString()
  emergencyContactAddress?: string;

  @IsOptional()
  @IsString()
  emergencyContactName?: string;

  @IsOptional()
  @IsString()
  emergencyContactPhone?: string;

  @IsOptional()
  @IsEnum(ParentMaritalStatus)
  parentsMaritalStatus?: ParentMaritalStatus;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => GuardianInputDto)
  guardians: GuardianInputDto[];
}
