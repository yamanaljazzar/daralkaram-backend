import { ConfigService } from '@nestjs/config';
import { UnauthorizedException } from '@nestjs/common';
// @ts-nocheck
import { Test, type TestingModule } from '@nestjs/testing';

import { PrismaService } from '@/database';

import { JwtRefreshStrategy } from './jwt-refresh.strategy';

describe('JwtRefreshStrategy', () => {
  let strategy: JwtRefreshStrategy;

  const mockPrisma = {
    refreshToken: {
      findUnique: jest.fn(),
    },
  } as unknown as PrismaService;

  const mockConfig = {
    get: jest.fn((key: string) => (key === 'jwt.refreshSecret' ? 'refresh-secret' : undefined)),
  } as unknown as ConfigService;

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        { provide: PrismaService, useValue: mockPrisma },
        { provide: ConfigService, useValue: mockConfig },
        JwtRefreshStrategy,
      ],
    }).compile();

    strategy = module.get(JwtRefreshStrategy);
  });

  it('should validate and return user context from refresh token', async () => {
    const future = new Date(Date.now() + 60_000);
    (mockPrisma.refreshToken.findUnique as jest.Mock).mockResolvedValue({
      id: 'rt_1',
      expiresAt: future,
      user: {
        id: 'u1',
        email: 'e@e.com',
        phone: null,
        role: 'ADMIN',
        isActive: true,
        isVerified: true,
      },
    });

    const res = await strategy.validate({ sub: 'u1', tokenId: 'rt_1' } as any);
    expect(res).toMatchObject({ id: 'u1', refreshTokenId: 'rt_1' });
  });

  it('should throw for expired/invalid token', async () => {
    const past = new Date(Date.now() - 60_000);
    (mockPrisma.refreshToken.findUnique as jest.Mock).mockResolvedValue({
      id: 'rt_2',
      expiresAt: past,
      user: { id: 'u1', isActive: true },
    });

    await expect(strategy.validate({ sub: 'u1', tokenId: 'rt_2' } as any)).rejects.toBeInstanceOf(
      UnauthorizedException,
    );
  });

  it('should throw when user is inactive', async () => {
    const future = new Date(Date.now() + 60_000);
    (mockPrisma.refreshToken.findUnique as jest.Mock).mockResolvedValue({
      id: 'rt_3',
      expiresAt: future,
      user: { id: 'u1', isActive: false },
    });

    await expect(strategy.validate({ sub: 'u1', tokenId: 'rt_3' } as any)).rejects.toBeInstanceOf(
      UnauthorizedException,
    );
  });
});
