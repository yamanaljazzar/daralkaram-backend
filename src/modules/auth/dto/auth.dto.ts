import { IsEmail, IsString, IsOptional, IsNotEmpty, IsPhoneNumber } from 'class-validator';

import { UserRole } from '@prisma/client';

export class LoginDto {
  @IsOptional()
  @IsEmail({}, { message: 'Please provide a valid email address' })
  email?: string;

  @IsOptional()
  @IsPhoneNumber('SY', { message: 'Please provide a valid Syrian phone number' })
  phone?: string;

  @IsNotEmpty({ message: 'Password is required' })
  @IsString()
  password: string;
}

// export class RegisterDto {
//   @IsOptional()
//   @IsEmail({}, { message: 'Please provide a valid email address' })
//   email?: string;

//   @IsOptional()
//   @IsPhoneNumber('SY', { message: 'Please provide a valid Syrian phone number' })
//   phone?: string;

//   @IsNotEmpty({ message: 'Password is required' })
//   @IsString()
//   @MinLength(8, { message: 'Password must be at least 8 characters long' })
//   password: string;

//   @IsEnum(UserRole, { message: 'Invalid role provided' })
//   role: UserRole;
// }

export class RefreshTokenDto {
  @IsNotEmpty({ message: 'Refresh token is required' })
  @IsString()
  refreshToken: string;
}

export class AuthResponseDto {
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    email?: string;
    phone?: string;
    role: UserRole;
    isActive: boolean;
    isVerified: boolean;
    createdAt: Date;
    updatedAt: Date;
  };
}

export class LogoutDto {
  @IsNotEmpty({ message: 'Refresh token is required' })
  @IsString()
  refreshToken: string;
}
