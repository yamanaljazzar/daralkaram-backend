import { Type } from 'class-transformer';
import { IsDate, IsString, IsOptional, IsNotEmpty, IsPhoneNumber } from 'class-validator';

export class UpdateGuardianDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsPhoneNumber()
  phone?: string;

  // @IsOptional()
  // @IsString()
  // relationToChild?: string;

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
