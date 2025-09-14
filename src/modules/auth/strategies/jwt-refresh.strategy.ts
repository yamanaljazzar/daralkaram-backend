import type { Request } from 'express';
import { Strategy } from 'passport-jwt';

import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';

import { PrismaService } from '@/database';

export interface JwtRefreshPayload {
  sub: string;
  tokenId: string;
  iat?: number;
  exp?: number;
}

interface RequestWithBody extends Request {
  body: {
    refreshToken?: string;
  };
}

@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(Strategy, 'jwt-refresh') {
  constructor(
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
  ) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
    super({
      ignoreExpiration: false,
      jwtFromRequest: (req: RequestWithBody): string | null => {
        return req.body?.refreshToken || null;
      },
      secretOrKey: configService.get<string>('jwt.refreshSecret') || 'default-refresh-secret',
    });
  }

  async validate(payload: JwtRefreshPayload) {
    // Verify the refresh token exists in database and is not expired
    const refreshToken = await this.prisma.refreshToken.findUnique({
      include: {
        user: {
          select: {
            email: true,
            id: true,
            isActive: true,
            isVerified: true,
            phone: true,
            role: true,
          },
        },
      },
      where: { id: payload.tokenId },
    });

    if (!refreshToken || refreshToken.expiresAt < new Date()) {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }

    if (!refreshToken.user.isActive) {
      throw new UnauthorizedException('User is inactive');
    }

    return {
      email: refreshToken.user.email,
      id: refreshToken.user.id,
      isActive: refreshToken.user.isActive,
      isVerified: refreshToken.user.isVerified,
      phone: refreshToken.user.phone,
      refreshTokenId: refreshToken.id,
      role: refreshToken.user.role,
    };
  }
}
