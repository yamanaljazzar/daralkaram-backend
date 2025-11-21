import * as bcrypt from 'bcryptjs';

import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';

import { UserRole } from '@prisma/client';

import { PrismaService } from '@/database';
import { StringUtil, ValidationUtil } from '@/utils';

import { CreateUserDto, UpdateUserDto, UserResponseDto } from './dto/user.dto';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createUserDto: CreateUserDto): Promise<UserResponseDto> {
    const { email, name, password, phone, role } = createUserDto;

    let normalizedPhone = phone;
    if (phone) {
      normalizedPhone = ValidationUtil.validateAndNormalizePhoneNumber(phone, 'SY');
    }

    ValidationUtil.validateCredentialsForRole(email, normalizedPhone, role);

    const existingUser = await this.findByEmailOrPhone(email, normalizedPhone);
    if (existingUser) {
      throw new ConflictException('User already exists');
    }
    const passwordHash = await bcrypt.hash(password, 12);

    const user = await this.prisma.user.create({
      data: {
        email,
        name,
        passwordHash,
        phone: normalizedPhone,
        role,
      },
    });

    return this.mapUserToResponse(user);
  }

  async findAll(
    page: number = 1,
    limit: number = 10,
    filters?: {
      role?: UserRole;
      search?: string;
    },
  ): Promise<{ data: UserResponseDto[]; total: number }> {
    const where: {
      role?: UserRole;
      OR?: any;
    } = {};

    if (filters?.role) {
      where.role = filters.role;
    }

    if (filters?.search) {
      where.OR = [
        { name: { contains: filters.search, mode: 'insensitive' } },
        { email: { contains: filters.search, mode: 'insensitive' } },
        { phone: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    const skip = (page - 1) * limit;

    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        where,
      }),
      this.prisma.user.count({ where }),
    ]);

    return {
      data: users.map(user => this.mapUserToResponse(user)),
      total,
    };
  }

  async findOne(id: string): Promise<UserResponseDto> {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return this.mapUserToResponse(user);
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<UserResponseDto> {
    const user = await this.findOne(id);

    if (updateUserDto.email && updateUserDto.email !== user.email) {
      const existingUser = await this.findByEmail(updateUserDto.email);
      if (existingUser) {
        throw new ConflictException('User with this email already exists');
      }
    }

    if (updateUserDto.phone && updateUserDto.phone !== user.phone) {
      const existingUser = await this.findByPhone(updateUserDto.phone);
      if (existingUser) {
        throw new ConflictException('User with this phone number already exists');
      }
    }

    const updatedUser = await this.prisma.user.update({
      data: updateUserDto,
      where: { id },
    });

    return this.mapUserToResponse(updatedUser);
  }

  async remove(id: string): Promise<UserResponseDto> {
    const user = await this.findOne(id);

    await this.prisma.user.delete({
      where: { id },
    });

    return user;
  }

  async findByEmail(email: string) {
    return this.prisma.user.findUnique({
      where: { email },
    });
  }

  async findByPhone(phone: string) {
    const normalizedPhone = StringUtil.normalizePhoneNumber(phone, 'SY');

    return this.prisma.user.findFirst({
      where: {
        OR: [
          { phone: normalizedPhone },
          { phone: phone }, // Fallback for existing data
        ],
      },
    });
  }

  async findByEmailOrPhone(email?: string, phone?: string) {
    const whereConditions: any[] = [];

    if (email) {
      whereConditions.push({ email });
    }

    if (phone) {
      const normalizedPhone = StringUtil.normalizePhoneNumber(phone, 'SY');

      if (normalizedPhone) {
        whereConditions.push({ phone: normalizedPhone });
      }

      whereConditions.push({ phone: phone });
    }

    const user = await this.prisma.user.findFirst({
      where: {
        OR: whereConditions,
      },
    });

    return user;
  }

  mapUserToResponse(user: {
    id: string;
    name: string | null;
    email: string | null;
    phone: string | null;
    role: UserRole;
    isActive: boolean;
    isVerified: boolean;
    createdAt: Date;
    updatedAt: Date;
  }): UserResponseDto {
    return {
      createdAt: user.createdAt,
      email: user.email || undefined,
      id: user.id,
      isActive: user.isActive,
      isVerified: user.isVerified,
      name: user.name || undefined,
      phone: user.phone || undefined,
      role: user.role,
      updatedAt: user.updatedAt,
    };
  }
}
