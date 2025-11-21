import type { Request } from 'express';
import { Strategy } from 'passport-jwt';

import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';

import { UserRole } from '@prisma/client';

import { PrismaService } from '@/database';

export interface JwtPayload {
  sub: string;
  name?: string;
  email?: string;
  phone?: string;
  role: UserRole;
  iat?: number;
  exp?: number;
}

interface RequestWithHeaders extends Request {
  headers: {
    authorization?: string;
  };
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
  ) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
    super({
      ignoreExpiration: false,
      jwtFromRequest: (req: RequestWithHeaders): string | null => {
        const authHeader = req.headers?.authorization;
        if (authHeader && typeof authHeader === 'string' && authHeader.startsWith('Bearer ')) {
          return authHeader.substring(7);
        }
        return null;
      },
      secretOrKey: configService.get<string>('jwt.secret') || 'default-secret',
    });
  }

  async validate(payload: JwtPayload) {
    const user = await this.prisma.user.findUnique({
      select: {
        email: true,
        id: true,
        isActive: true,
        isVerified: true,
        name: true,
        phone: true,
        role: true,
      },
      where: { id: payload.sub },
    });

    if (!user?.isActive) {
      throw new UnauthorizedException('User not found or inactive');
    }

    return {
      email: user.email,
      id: user.id,
      isActive: user.isActive,
      isVerified: user.isVerified,
      name: user.name,
      phone: user.phone,
      role: user.role,
    };
  }
}
