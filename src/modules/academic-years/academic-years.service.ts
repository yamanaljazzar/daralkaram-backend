import {
  Injectable,
  NotFoundException,
  ConflictException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';

import { PrismaService } from '@/database';

import { CreateAcademicYearDto, UpdateAcademicYearDto, AcademicYearResponseDto } from './dto';

@Injectable()
export class AcademicYearsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createAcademicYearDto: CreateAcademicYearDto): Promise<AcademicYearResponseDto> {
    const { endDate, isActive, name, startDate } = createAcademicYearDto;

    // Validate that end date is after start date
    if (new Date(endDate) <= new Date(startDate)) {
      throw new BadRequestException('End date must be after start date');
    }

    const existingYear = await this.prisma.academicYear.findUnique({
      where: { name },
    });

    if (existingYear) {
      throw new ConflictException('Academic year with this name already exists');
    }

    // Check for date range overlaps with existing academic years
    const overlappingYears = await this.prisma.academicYear.findMany({
      where: {
        OR: [
          // New year starts during an existing year
          {
            AND: [
              { startDate: { lte: new Date(startDate) } },
              { endDate: { gte: new Date(startDate) } },
            ],
          },
          // New year ends during an existing year
          {
            AND: [
              { startDate: { lte: new Date(endDate) } },
              { endDate: { gte: new Date(endDate) } },
            ],
          },
          // New year completely contains an existing year
          {
            AND: [
              { startDate: { gte: new Date(startDate) } },
              { endDate: { lte: new Date(endDate) } },
            ],
          },
        ],
      },
    });

    if (overlappingYears.length > 0) {
      throw new ConflictException(
        `Date range conflicts with existing academic year(s): ${overlappingYears.map(y => y.name).join(', ')}`,
      );
    }

    // Check if trying to create an active year when another one is already active
    if (isActive) {
      const activeYear = await this.prisma.academicYear.findFirst({
        where: { isActive: true },
      });

      if (activeYear) {
        throw new ConflictException(
          `Cannot create active academic year. Academic year "${activeYear.name}" is already active. Please deactivate it first.`,
        );
      }
    }

    const academicYear = await this.prisma.academicYear.create({
      data: {
        endDate: new Date(endDate),
        isActive: isActive ?? false,
        name,
        startDate: new Date(startDate),
      },
    });

    return this.mapToResponse(academicYear);
  }

  async findAll(activeOnly?: boolean): Promise<AcademicYearResponseDto[]> {
    const where = activeOnly ? { isActive: true } : {};

    const academicYears = await this.prisma.academicYear.findMany({
      orderBy: { createdAt: 'desc' },
      where,
    });

    return academicYears.map(year => this.mapToResponse(year));
  }

  async findOne(id: string): Promise<AcademicYearResponseDto> {
    const academicYear = await this.prisma.academicYear.findUnique({
      where: { id },
    });

    if (!academicYear) {
      throw new NotFoundException('Academic year not found');
    }

    return this.mapToResponse(academicYear);
  }

  async update(
    id: string,
    updateAcademicYearDto: UpdateAcademicYearDto,
  ): Promise<AcademicYearResponseDto> {
    const academicYear = await this.findOne(id);

    // Determine the final date range for validation
    const finalStartDate = updateAcademicYearDto.startDate
      ? new Date(updateAcademicYearDto.startDate)
      : new Date(academicYear.startDate);
    const finalEndDate = updateAcademicYearDto.endDate
      ? new Date(updateAcademicYearDto.endDate)
      : new Date(academicYear.endDate);

    // Validate that end date is after start date
    if (finalEndDate <= finalStartDate) {
      throw new BadRequestException('End date must be after start date');
    }

    // Check if name is being updated and if it already exists
    if (updateAcademicYearDto.name && updateAcademicYearDto.name !== academicYear.name) {
      const existingYear = await this.prisma.academicYear.findUnique({
        where: { name: updateAcademicYearDto.name },
      });

      if (existingYear) {
        throw new ConflictException('Academic year with this name already exists');
      }
    }

    // Check for date range overlaps if dates are being updated
    if (updateAcademicYearDto.startDate || updateAcademicYearDto.endDate) {
      const overlappingYears = await this.prisma.academicYear.findMany({
        where: {
          id: { not: id }, // Exclude current academic year
          OR: [
            // Updated year starts during an existing year
            {
              AND: [{ startDate: { lte: finalStartDate } }, { endDate: { gte: finalStartDate } }],
            },
            // Updated year ends during an existing year
            {
              AND: [{ startDate: { lte: finalEndDate } }, { endDate: { gte: finalEndDate } }],
            },
            // Updated year completely contains an existing year
            {
              AND: [{ startDate: { gte: finalStartDate } }, { endDate: { lte: finalEndDate } }],
            },
          ],
        },
      });

      if (overlappingYears.length > 0) {
        throw new ConflictException(
          `Date range conflicts with existing academic year(s): ${overlappingYears.map(y => y.name).join(', ')}`,
        );
      }
    }

    // Check if trying to activate this year when another one is already active
    if (updateAcademicYearDto.isActive === true && !academicYear.isActive) {
      const activeYear = await this.prisma.academicYear.findFirst({
        where: {
          id: { not: id },
          isActive: true,
        },
      });

      if (activeYear) {
        throw new ConflictException(
          `Cannot activate academic year. Academic year "${activeYear.name}" is already active. Please deactivate it first.`,
        );
      }
    }

    const updatedAcademicYear = await this.prisma.academicYear.update({
      data: {
        ...updateAcademicYearDto,
        endDate: updateAcademicYearDto.endDate
          ? new Date(updateAcademicYearDto.endDate)
          : undefined,
        startDate: updateAcademicYearDto.startDate
          ? new Date(updateAcademicYearDto.startDate)
          : undefined,
      },
      where: { id },
    });

    return this.mapToResponse(updatedAcademicYear);
  }

  async remove(id: string): Promise<void> {
    const academicYear = await this.findOne(id);

    const connectedClasses = await this.prisma.class.findMany({
      select: { id: true, level: true },
      where: { academicYearId: id },
    });

    if (connectedClasses.length > 0) {
      throw new ForbiddenException(
        `Cannot delete academic year "${academicYear.name}" because it has ${connectedClasses.length} connected class(es). Please remove or reassign the classes first.`,
      );
    }

    await this.prisma.academicYear.delete({
      where: { id },
    });
  }

  private mapToResponse(academicYear: {
    id: string;
    name: string;
    startDate: Date;
    endDate: Date;
    isActive: boolean;
    createdAt: Date;
  }): AcademicYearResponseDto {
    return {
      createdAt: academicYear.createdAt,
      endDate: academicYear.endDate,
      id: academicYear.id,
      isActive: academicYear.isActive,
      name: academicYear.name,
      startDate: academicYear.startDate,
    };
  }
}
