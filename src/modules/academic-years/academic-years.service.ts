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
    const { endDate, name, startDate } = createAcademicYearDto;

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

    const academicYear = await this.prisma.academicYear.create({
      data: {
        endDate: new Date(endDate),
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

    // Validate dates if both are provided
    if (updateAcademicYearDto.startDate && updateAcademicYearDto.endDate) {
      if (new Date(updateAcademicYearDto.endDate) <= new Date(updateAcademicYearDto.startDate)) {
        throw new BadRequestException('End date must be after start date');
      }
    } else if (updateAcademicYearDto.startDate && !updateAcademicYearDto.endDate) {
      if (new Date(updateAcademicYearDto.startDate) >= new Date(academicYear.endDate)) {
        throw new BadRequestException('Start date must be before end date');
      }
    } else if (updateAcademicYearDto.endDate && !updateAcademicYearDto.startDate) {
      if (new Date(updateAcademicYearDto.endDate) <= new Date(academicYear.startDate)) {
        throw new BadRequestException('End date must be after start date');
      }
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
