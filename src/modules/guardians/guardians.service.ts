import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';

import { Prisma, PrismaClient } from '@prisma/client';

import { PrismaService } from '@/database';

import { UpdateGuardianDto, CreateGuardianDto, GuardianResponseDto } from './dto';

type PrismaTransactionClient = Parameters<Parameters<PrismaClient['$transaction']>[0]>[0];

@Injectable()
export class GuardiansService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(
    page: number,
    limit: number,
    filters?: { search?: string },
  ): Promise<{ data: GuardianResponseDto[]; total: number }> {
    const where: {
      OR?: any;
    } = {};

    if (filters?.search) {
      where.OR = [
        { name: { contains: filters.search, mode: 'insensitive' } },
        { phone: { contains: filters.search, mode: 'insensitive' } },
      ];
    }
    const skip = (page - 1) * limit;

    const [guardians, total] = await Promise.all([
      this.prisma.guardian.findMany({
        include: {
          students: {
            select: {
              relationToChild: true,
              student: {
                select: {
                  dateOfBirth: true,
                  firstName: true,
                  id: true,
                  lastName: true,
                  status: true,
                },
              },
            },
          },
          user: {
            select: {
              email: true,
              id: true,
              isActive: true,
              isVerified: true,
              name: true,
              phone: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        where,
      }),
      this.prisma.guardian.count({ where }),
    ]);

    return {
      data: guardians.map(guardian => this.mapGuardianToResponse(guardian)),
      total,
    };
  }

  async findById(id: string): Promise<GuardianResponseDto> {
    const guardian = await this.prisma.guardian.findUnique({
      include: {
        students: {
          select: {
            relationToChild: true,
            student: {
              select: {
                dateOfBirth: true,
                firstName: true,
                id: true,
                lastName: true,
                status: true,
              },
            },
          },
        },
        user: {
          select: {
            email: true,
            id: true,
            isActive: true,
            isVerified: true,
            name: true,
            phone: true,
          },
        },
      },
      where: { id },
    });

    if (!guardian) {
      throw new NotFoundException(`ولي الأمر بالمعرّف ${id} غير موجود`);
    }

    return this.mapGuardianToResponse(guardian);
  }

  async findByPhone(
    phone: string,
    tx?: PrismaTransactionClient,
  ): Promise<GuardianResponseDto | null> {
    const prisma = (tx || this.prisma) as PrismaClient;
    const guardian = await prisma.guardian.findUnique({
      include: {
        students: {
          select: {
            relationToChild: true,
            student: {
              select: {
                dateOfBirth: true,
                firstName: true,
                id: true,
                lastName: true,
                status: true,
              },
            },
          },
        },
        user: {
          select: {
            email: true,
            id: true,
            isActive: true,
            isVerified: true,
            name: true,
            phone: true,
          },
        },
      },
      where: { phone },
    });

    return guardian ? this.mapGuardianToResponse(guardian) : null;
  }

  async create(createGuardianDto: CreateGuardianDto): Promise<GuardianResponseDto> {
    const existingGuardian = await this.findByPhone(createGuardianDto.phone);
    if (existingGuardian) {
      throw new ConflictException('يوجد ولي أمر بهذا الرقم بالفعل');
    }
    const guardian = await this.prisma.guardian.create({
      data: createGuardianDto,
      include: {
        students: {
          select: {
            relationToChild: true,
            student: {
              select: {
                dateOfBirth: true,
                firstName: true,
                id: true,
                lastName: true,
                status: true,
              },
            },
          },
        },
        user: {
          select: {
            email: true,
            id: true,
            isActive: true,
            isVerified: true,
            name: true,
            phone: true,
          },
        },
      },
    });
    return this.mapGuardianToResponse(guardian);
  }

  async findOrCreate(
    guardianData: CreateGuardianDto,
    tx: PrismaTransactionClient,
  ): Promise<Prisma.GuardianGetPayload<Record<string, never>>> {
    const prisma = tx as PrismaClient;

    let guardian = await prisma.guardian.findUnique({
      where: { phone: guardianData.phone },
    });

    if (!guardian) {
      guardian = await prisma.guardian.create({
        data: guardianData,
      });
    }

    return guardian;
  }

  async update(id: string, updateGuardianDto: UpdateGuardianDto): Promise<GuardianResponseDto> {
    const guardian = await this.prisma.guardian.findUnique({
      where: { id },
    });

    if (!guardian) {
      throw new NotFoundException(`ولي الأمر بالمعرّف ${id} غير موجود`);
    }

    // If phone is being updated, check for uniqueness
    if (updateGuardianDto.phone && updateGuardianDto.phone !== guardian.phone) {
      const existingGuardian = await this.prisma.guardian.findUnique({
        where: { phone: updateGuardianDto.phone },
      });

      if (existingGuardian) {
        throw new BadRequestException('يوجد ولي أمر بهذا الرقم بالفعل');
      }
    }

    const updatedGuardian = await this.prisma.guardian.update({
      data: {
        ...updateGuardianDto,
        dateOfBirth: updateGuardianDto.dateOfBirth
          ? new Date(updateGuardianDto.dateOfBirth)
          : undefined,
      },
      include: {
        students: {
          select: {
            relationToChild: true,
            student: {
              select: {
                dateOfBirth: true,
                firstName: true,
                id: true,
                lastName: true,
                status: true,
              },
            },
          },
        },
        user: {
          select: {
            email: true,
            id: true,
            isActive: true,
            isVerified: true,
            name: true,
            phone: true,
          },
        },
      },
      where: { id },
    });

    return this.mapGuardianToResponse(updatedGuardian);
  }

  async remove(id: string): Promise<void> {
    const guardian = await this.prisma.guardian.findUnique({
      include: {
        students: true,
      },
      where: { id },
    });

    if (!guardian) {
      throw new NotFoundException(`ولي الأمر بالمعرّف ${id} غير موجود`);
    }

    if (guardian.students.length > 0) {
      throw new BadRequestException('لا يمكن حذف ولي أمر مرتبط بطلاب');
    }

    await this.prisma.guardian.delete({
      where: { id },
    });
  }

  private mapGuardianToResponse(guardian: {
    id: string;
    name: string;
    phone: string;
    dateOfBirth?: Date | null;
    educationLevel?: string | null;
    occupation?: string | null;
    maritalStatus?: string | null;
    createdAt: Date;
    updatedAt: Date;
    user?: {
      id: string;
      name?: string | null;
      email?: string | null;
      phone?: string | null;
      isActive: boolean;
      isVerified: boolean;
    } | null;
    students: Array<{
      relationToChild: string;
      student: {
        id: string;
        firstName: string;
        lastName: string;
        dateOfBirth: Date;
        status: string;
      };
    }>;
  }): GuardianResponseDto {
    return {
      createdAt: guardian.createdAt,
      dateOfBirth: guardian.dateOfBirth ?? undefined,
      educationLevel: guardian.educationLevel ?? undefined,
      id: guardian.id,
      maritalStatus: guardian.maritalStatus ?? undefined,
      name: guardian.name,
      occupation: guardian.occupation ?? undefined,
      phone: guardian.phone,
      students: guardian.students.map(({ relationToChild, student }) => ({
        ...student,
        relationToChild,
      })),
      updatedAt: guardian.updatedAt,
      user: guardian.user
        ? {
            email: guardian.user.email ?? undefined,
            id: guardian.user.id,
            isActive: guardian.user.isActive,
            isVerified: guardian.user.isVerified,
            name: guardian.user.name ?? undefined,
            phone: guardian.user.phone ?? undefined,
          }
        : undefined,
    };
  }
}
