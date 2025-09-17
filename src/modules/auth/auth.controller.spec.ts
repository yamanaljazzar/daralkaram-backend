// @ts-nocheck
import { Test, type TestingModule } from '@nestjs/testing';
import { HttpStatus } from '@nestjs/common';

import { ResponseService } from '@/core/services';

import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

describe('AuthController', () => {
  let controller: AuthController;

  const mockAuthService = {
    login: jest.fn(),
    refreshToken: jest.fn(),
    logout: jest.fn(),
    logoutAll: jest.fn(),
  } as unknown as AuthService;

  const responseService = new ResponseService();

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        { provide: AuthService, useValue: mockAuthService },
        { provide: ResponseService, useValue: responseService },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
  });

  it('should return success response for login', async () => {
    (mockAuthService.login as jest.Mock).mockResolvedValue({ accessToken: 'a', refreshToken: 'r', user: { id: '1' } });
    const result = await controller.login({ email: 'e@e.com', password: 'P@ssw0rd' });
    expect(result.success).toBe(true);
    expect(result.statusCode).toBe(HttpStatus.OK);
    expect(result.data).toMatchObject({ accessToken: 'a', refreshToken: 'r', user: { id: '1' } });
  });

  it('should return success response for refresh', async () => {
    (mockAuthService.refreshToken as jest.Mock).mockResolvedValue({ accessToken: 'na', refreshToken: 'nr' });
    const result = await controller.refreshToken({ refreshToken: 'old' });
    expect(result.success).toBe(true);
    expect(result.statusCode).toBe(HttpStatus.OK);
    expect(result.data).toMatchObject({ accessToken: 'na', refreshToken: 'nr' });
  });

  it('should return no content for logout', async () => {
    (mockAuthService.logout as jest.Mock).mockResolvedValue(undefined);
    const result = await controller.logout({ refreshToken: 'rt' });
    expect(result.success).toBe(true);
    expect(result.statusCode).toBe(HttpStatus.NO_CONTENT);
    expect(result.data).toBeNull();
  });

  it('should return no content for logoutAll', async () => {
    (mockAuthService.logoutAll as jest.Mock).mockResolvedValue(undefined);
    const result = await controller.logoutAll('user_1');
    expect(result.success).toBe(true);
    expect(result.statusCode).toBe(HttpStatus.NO_CONTENT);
    expect(result.data).toBeNull();
  });
});

