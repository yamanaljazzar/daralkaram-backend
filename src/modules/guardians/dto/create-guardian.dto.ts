import { Type } from 'class-transformer';
import { IsDate, IsString, IsOptional, IsNotEmpty, IsPhoneNumber } from 'class-validator';

export class CreateGuardianDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsPhoneNumber()
  phone: string;

  @IsOptional()
  @IsNotEmpty({ message: 'Date of birth should not be empty' })
  @IsDate()
  @Type(() => Date)
  dateOfBirth?: string;

  @IsOptional()
  @IsString()
  educationLevel?: string;

  @IsOptional()
  @IsString()
  occupation?: string;

  @IsOptional()
  @IsString()
  maritalStatus?: string;
}
