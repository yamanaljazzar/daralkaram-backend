// @ts-nocheck
import { Test, type TestingModule } from '@nestjs/testing';
import { UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { PrismaService } from '@/database';

import { JwtStrategy } from './jwt.strategy';

describe('JwtStrategy', () => {
  let strategy: JwtStrategy;

  const mockPrisma = {
    user: {
      findUnique: jest.fn(),
    },
  } as unknown as PrismaService;

  const mockConfig = {
    get: jest.fn((key: string) => (key === 'jwt.secret' ? 'secret' : undefined)),
  } as unknown as ConfigService;

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        { provide: PrismaService, useValue: mockPrisma },
        { provide: ConfigService, useValue: mockConfig },
        JwtStrategy,
      ],
    }).compile();

    strategy = module.get(JwtStrategy);
  });

  it('should validate active user', async () => {
    (mockPrisma.user.findUnique as jest.Mock).mockResolvedValue({
      id: 'u1',
      email: 'e@e.com',
      isActive: true,
      isVerified: true,
      phone: null,
      role: 'ADMIN',
    });

    const res = await strategy.validate({ sub: 'u1', role: 'ADMIN' } as any);
    expect(res).toMatchObject({ id: 'u1', email: 'e@e.com' });
  });

  it('should throw for inactive/missing user', async () => {
    (mockPrisma.user.findUnique as jest.Mock).mockResolvedValue(null);
    await expect(strategy.validate({ sub: 'uX', role: 'ADMIN' } as any)).rejects.toBeInstanceOf(
      UnauthorizedException,
    );
  });
});

