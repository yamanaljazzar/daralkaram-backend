// @ts-nocheck
import { Test, type TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';

import { PrismaService } from './prisma.service';

describe('PrismaService', () => {
  let service: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PrismaService,
        {
          provide: ConfigService,
          useValue: { get: jest.fn(() => false) },
        },
      ],
    }).compile();

    service = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should have user model', () => {
    expect(service.user).toBeDefined();
  });

  it('should be able to connect and disconnect', async () => {
    // Mock the database connection for testing
    (service.$connect as any) = jest.fn().mockResolvedValue(undefined);
    (service.$disconnect as any) = jest.fn().mockResolvedValue(undefined);

    await expect(service.onModuleInit()).resolves.not.toThrow();
    await expect(service.onModuleDestroy()).resolves.not.toThrow();
  });
});
