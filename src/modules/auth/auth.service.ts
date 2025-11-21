import * as bcrypt from 'bcryptjs';

import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { Injectable, UnauthorizedException } from '@nestjs/common';

import { UserRole } from '@prisma/client';

import { ValidationUtil } from '@/utils';
import { PrismaService } from '@/database';
import { LoggerService } from '@/core/services';
import { UsersService } from '@/modules/users/users.service';

import { LoginDto, AuthResponseDto } from './dto/auth.dto';
import { JwtPayload, JwtRefreshPayload } from './strategies';

@Injectable()
export class AuthService {
  constructor(
    private readonly logger: LoggerService,
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly usersService: UsersService,
    private readonly configService: ConfigService,
  ) {}

  async login(loginDto: LoginDto): Promise<AuthResponseDto> {
    const { email, password, phone } = loginDto;

    ValidationUtil.validateLoginCredentials(email, phone);

    const user = await this.usersService.findByEmailOrPhone(email, phone);

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (!user.isActive) {
      throw new UnauthorizedException('Account is deactivated');
    }

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const tokens = await this.generateTokens(user.id, user.role);

    this.logger.logAuth('User logged in successfully', user.id, 'AuthService', {
      email: user.email,
      loginMethod: email ? 'email' : 'phone',
      role: user.role,
      timestamp: new Date().toISOString(),
    });

    return {
      ...tokens,
      user: this.usersService.mapUserToResponse(user),
    };
  }

  async refreshToken(refreshToken: string): Promise<AuthResponseDto> {
    // Verify refresh token
    const payload = this.jwtService.verify<JwtRefreshPayload>(refreshToken, {
      secret: this.configService.get<string>('jwt.refreshSecret'),
    });

    // Check if refresh token exists in database
    const storedToken = await this.prisma.refreshToken.findUnique({
      include: { user: true },
      where: { id: payload.tokenId },
    });

    if (!storedToken || storedToken.expiresAt < new Date()) {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }

    if (!storedToken.user.isActive) {
      throw new UnauthorizedException('User is inactive');
    }

    // Delete old refresh token
    await this.prisma.refreshToken.delete({
      where: { id: payload.tokenId },
    });

    // Generate new tokens
    const newTokens = await this.generateTokens(storedToken.user.id, storedToken.user.role);

    this.logger.logAuth('Token refreshed successfully', storedToken.user.id, 'AuthService', {
      email: storedToken.user.email,
      oldTokenId: payload.tokenId,
      timestamp: new Date().toISOString(),
    });

    return {
      ...newTokens,
      user: this.usersService.mapUserToResponse(storedToken.user),
    };
  }

  async logout(refreshToken: string): Promise<void> {
    try {
      const payload = this.jwtService.verify<JwtRefreshPayload>(refreshToken, {
        secret: this.configService.get<string>('jwt.refreshSecret'),
      });

      await this.prisma.refreshToken.delete({
        where: { id: payload?.tokenId },
      });
    } catch (error) {
      // Token might be invalid, but we don't want to throw an error
      // as the user is already logged out, so let's log the result here:
      this.logger.warn('Logout attempted with invalid or expired refresh token', 'AuthService', {
        errorMessage: error instanceof Error ? error.message : String(error),
        errorType: error instanceof Error ? error.constructor.name : '',
        timestamp: new Date().toISOString(),
      });
    }
  }

  async logoutAll(userId: string): Promise<void> {
    const result = await this.prisma.refreshToken.deleteMany({
      where: { userId },
    });

    this.logger.logAuth('User logged out from all devices successfully', userId, 'AuthService', {
      timestamp: new Date().toISOString(),
      tokensDeleted: result.count,
    });
  }

  private async generateTokens(
    userId: string,
    role: UserRole,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    this.logger.startTimer('token-generation');

    const refreshTokenRecord = await this.prisma.refreshToken.create({
      data: {
        expiresAt: new Date(Date.now() + this.getRefreshTokenExpiration()),
        token: '',
        userId,
      },
    });

    const accessTokenPayload: JwtPayload = {
      role,
      sub: userId,
    };

    const refreshTokenPayload: JwtRefreshPayload = {
      sub: userId,
      tokenId: refreshTokenRecord.id,
    };

    const accessToken = this.jwtService.sign(accessTokenPayload, {
      expiresIn: this.configService.get<string>('jwt.expiresIn'),
      secret: this.configService.get<string>('jwt.secret'),
    });

    const refreshToken = this.jwtService.sign(refreshTokenPayload, {
      expiresIn: this.configService.get<string>('jwt.refreshExpiresIn') || '30d',
      secret: this.configService.get<string>('jwt.refreshSecret'),
    });

    await this.prisma.refreshToken.update({
      data: { token: refreshToken },
      where: { id: refreshTokenRecord.id },
    });

    this.logger.endTimer('token-generation', 'AuthService');

    return { accessToken, refreshToken };
  }

  private getRefreshTokenExpiration(): number {
    try {
      const refreshExpiresIn = this.configService.get<string>('jwt.refreshExpiresIn') || '30d';
      const match = refreshExpiresIn.match(/^(\d+)([dhms])$/);

      if (!match) {
        return 30 * 24 * 60 * 60 * 1000;
      }

      const value = parseInt(match[1]);
      const unit = match[2];

      let expirationMs: number;
      switch (unit) {
        case 'd':
          expirationMs = value * 24 * 60 * 60 * 1000;
          break;
        case 'h':
          expirationMs = value * 60 * 60 * 1000;
          break;
        case 'm':
          expirationMs = value * 60 * 1000;
          break;
        case 's':
          expirationMs = value * 1000;
          break;
        default:
          expirationMs = 30 * 24 * 60 * 60 * 1000; // Default 30 days
      }

      return expirationMs;
    } catch (error) {
      this.logger.error(
        'Error calculating refresh token expiration',
        error instanceof Error ? error.stack : '',
        'AuthService',
        {
          errorMessage: error instanceof Error ? error.message : '',
          errorType: error instanceof Error ? error.constructor.name : '',
          timestamp: new Date().toISOString(),
        },
      );
      return 30 * 24 * 60 * 60 * 1000;
    }
  }
}
