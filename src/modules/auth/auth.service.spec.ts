// @ts-nocheck
jest.mock('bcryptjs', () => ({
  compare: jest.fn(),
}));
import * as bcrypt from 'bcryptjs';

import { Test, type TestingModule } from '@nestjs/testing';
import { UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

import { UserRole } from '@prisma/client';

import { PrismaService } from '@/database';
import { LoggerService } from '@/core/services';
import { UsersService } from '@/modules/users/users.service';

import { AuthService } from './auth.service';

describe('AuthService', () => {
  let service: AuthService;

  const mockLoggerService = {
    logAuth: jest.fn(),
    warn: jest.fn(),
    startTimer: jest.fn(),
    endTimer: jest.fn(),
    error: jest.fn(),
  } as unknown as LoggerService;

  const mockJwtService = {
    sign: jest.fn(),
    verify: jest.fn(),
  } as unknown as JwtService;

  const mockUsersService = {
    findByEmailOrPhone: jest.fn(),
    mapUserToResponse: jest.fn(),
  } as unknown as UsersService;

  const mockConfigService = {
    get: jest.fn(),
  } as unknown as ConfigService;

  const prismaMock: any = {
    refreshToken: {
      create: jest.fn(),
      update: jest.fn(),
      findUnique: jest.fn(),
      delete: jest.fn(),
      deleteMany: jest.fn(),
    },
  };

  const now = Date.now();

  beforeEach(async () => {
    jest.clearAllMocks();

    (mockConfigService.get as jest.Mock).mockImplementation((key: string) => {
      switch (key) {
        case 'jwt.secret':
          return 'test-secret';
        case 'jwt.expiresIn':
          return '15m';
        case 'jwt.refreshSecret':
          return 'test-refresh-secret';
        case 'jwt.refreshExpiresIn':
          return '30d';
        default:
          return undefined;
      }
    });

    (mockJwtService.sign as jest.Mock).mockImplementation((payload: any) =>
      payload && typeof payload === 'object' && 'tokenId' in payload ? 'refresh.token' : 'access.token',
    );

    (prismaMock.refreshToken.create as jest.Mock).mockResolvedValue({
      id: 'rt_1',
      token: '',
      userId: 'user_1',
      expiresAt: new Date(now + 30 * 24 * 60 * 60 * 1000),
    });

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: LoggerService, useValue: mockLoggerService },
        { provide: PrismaService, useValue: prismaMock },
        { provide: JwtService, useValue: mockJwtService },
        { provide: UsersService, useValue: mockUsersService },
        { provide: ConfigService, useValue: mockConfigService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  describe('login', () => {
    it('should login successfully with email and return tokens + user', async () => {
      const user = {
        id: 'user_1',
        email: 'user@example.com',
        phone: null,
        role: UserRole.ADMIN,
        isActive: true,
        isVerified: true,
        passwordHash: 'hashed',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      (mockUsersService.findByEmailOrPhone as jest.Mock).mockResolvedValue(user);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      (prismaMock.refreshToken.update as jest.Mock).mockResolvedValue({});
      (mockUsersService.mapUserToResponse as jest.Mock).mockImplementation((u: any) => ({
        id: u.id,
        email: u.email ?? undefined,
        phone: u.phone ?? undefined,
        role: u.role,
        isActive: u.isActive,
        isVerified: u.isVerified,
        createdAt: u.createdAt,
        updatedAt: u.updatedAt,
      }));

      const result = await service.login({ email: 'user@example.com', password: 'Passw0rd!' });

      expect(result.accessToken).toBe('access.token');
      expect(result.refreshToken).toBe('refresh.token');
      expect(result.user).toMatchObject({ id: 'user_1', email: 'user@example.com' });
      expect(bcrypt.compare).toHaveBeenCalledWith('Passw0rd!', 'hashed');
      expect(mockLoggerService.logAuth).toHaveBeenCalled();
    });

    it('should throw if user not found', async () => {
      (mockUsersService.findByEmailOrPhone as jest.Mock).mockResolvedValue(null);

      await expect(
        service.login({ email: 'missing@example.com', password: 'x' }),
      ).rejects.toBeInstanceOf(UnauthorizedException);
    });

    it('should throw if user is inactive', async () => {
      const user = {
        id: 'user_2',
        email: 'inactive@example.com',
        phone: null,
        role: UserRole.ADMIN,
        isActive: false,
        isVerified: true,
        passwordHash: 'hashed',
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      (mockUsersService.findByEmailOrPhone as jest.Mock).mockResolvedValue(user);

      await expect(
        service.login({ email: 'inactive@example.com', password: 'x' }),
      ).rejects.toBeInstanceOf(UnauthorizedException);
    });

    it('should throw if password is invalid', async () => {
      const user = {
        id: 'user_3',
        email: 'user3@example.com',
        phone: null,
        role: UserRole.ADMIN,
        isActive: true,
        isVerified: true,
        passwordHash: 'hashed',
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      (mockUsersService.findByEmailOrPhone as jest.Mock).mockResolvedValue(user);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(
        service.login({ email: 'user3@example.com', password: 'wrong' }),
      ).rejects.toBeInstanceOf(UnauthorizedException);
    });
  });

  describe('refreshToken', () => {
    it('should refresh tokens successfully', async () => {
      (mockJwtService.verify as jest.Mock).mockReturnValue({ sub: 'user_1', tokenId: 'rt_1' });
      (prismaMock.refreshToken.findUnique as jest.Mock).mockResolvedValue({
        id: 'rt_1',
        token: 'old',
        expiresAt: new Date(now + 60_000),
        user: {
          id: 'user_1',
          email: 'user@example.com',
          role: UserRole.ADMIN,
          isActive: true,
        },
      });
      (prismaMock.refreshToken.delete as jest.Mock).mockResolvedValue({});
      (prismaMock.refreshToken.update as jest.Mock).mockResolvedValue({});

      const result = await service.refreshToken('old.refresh');
      expect(result.accessToken).toBe('access.token');
      expect(result.refreshToken).toBe('refresh.token');
      expect(mockLoggerService.logAuth).toHaveBeenCalled();
    });

    it('should throw if refresh token not found', async () => {
      (mockJwtService.verify as jest.Mock).mockReturnValue({ sub: 'user_1', tokenId: 'rt_missing' });
      (prismaMock.refreshToken.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(service.refreshToken('invalid')).rejects.toBeInstanceOf(UnauthorizedException);
    });

    it('should throw if refresh token expired', async () => {
      (mockJwtService.verify as jest.Mock).mockReturnValue({ sub: 'user_1', tokenId: 'rt_2' });
      (prismaMock.refreshToken.findUnique as jest.Mock).mockResolvedValue({
        id: 'rt_2',
        token: 'old',
        expiresAt: new Date(now - 60_000),
        user: { id: 'user_1', email: 'user@example.com', role: UserRole.ADMIN, isActive: true },
      });

      await expect(service.refreshToken('expired')).rejects.toBeInstanceOf(UnauthorizedException);
    });

    it('should throw if user is inactive', async () => {
      (mockJwtService.verify as jest.Mock).mockReturnValue({ sub: 'user_1', tokenId: 'rt_3' });
      (prismaMock.refreshToken.findUnique as jest.Mock).mockResolvedValue({
        id: 'rt_3',
        token: 'old',
        expiresAt: new Date(now + 60_000),
        user: { id: 'user_1', email: 'user@example.com', role: UserRole.ADMIN, isActive: false },
      });

      await expect(service.refreshToken('inactive')).rejects.toBeInstanceOf(UnauthorizedException);
    });
  });

  describe('logout', () => {
    it('should delete refresh token when provided', async () => {
      (mockJwtService.verify as jest.Mock).mockReturnValue({ tokenId: 'rt_9' });
      (prismaMock.refreshToken.delete as jest.Mock).mockResolvedValue({});

      await expect(service.logout('some.refresh')).resolves.toBeUndefined();
      expect(prismaMock.refreshToken.delete).toHaveBeenCalledWith({ where: { id: 'rt_9' } });
    });

    it('should not throw when token is invalid', async () => {
      (mockJwtService.verify as jest.Mock).mockImplementation(() => {
        throw new Error('invalid token');
      });

      await expect(service.logout('bad.refresh')).resolves.toBeUndefined();
      expect(mockLoggerService.warn).toHaveBeenCalled();
    });
  });

  describe('logoutAll', () => {
    it('should delete all refresh tokens for a user', async () => {
      (prismaMock.refreshToken.deleteMany as jest.Mock).mockResolvedValue({ count: 2 });

      await expect(service.logoutAll('user_10')).resolves.toBeUndefined();
      expect(prismaMock.refreshToken.deleteMany).toHaveBeenCalledWith({ where: { userId: 'user_10' } });
    });
  });
});

