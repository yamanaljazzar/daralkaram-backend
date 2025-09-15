import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';

import { UserRole } from '@prisma/client';

import { PrismaService } from '@/database';

import { CreateClassDto, UpdateClassDto, ClassResponseDto } from './dto';

@Injectable()
export class ClassesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createClassDto: CreateClassDto): Promise<ClassResponseDto> {
    const { academicYearId, level, maxCapacity, teacherId, templateId } = createClassDto;

    // Verify academic year exists
    const academicYear = await this.prisma.academicYear.findUnique({
      where: { id: academicYearId },
    });

    if (!academicYear) {
      throw new NotFoundException('Academic year not found');
    }

    // Verify class template exists and is active
    const classTemplate = await this.prisma.classTemplate.findUnique({
      where: { id: templateId },
    });

    if (!classTemplate) {
      throw new NotFoundException('Class template not found');
    }

    if (!classTemplate.isActive) {
      throw new BadRequestException('Cannot create class with inactive template');
    }

    // Verify teacher exists and has TEACHER role (if provided)
    if (teacherId) {
      const teacher = await this.prisma.user.findUnique({
        where: { id: teacherId },
      });

      if (!teacher) {
        throw new NotFoundException('Teacher not found');
      }

      if (teacher.role !== UserRole.TEACHER) {
        throw new BadRequestException('Assigned user must have TEACHER role');
      }

      if (!teacher.isActive) {
        throw new BadRequestException('Cannot assign inactive teacher');
      }
    }

    // Check if combination of academic year and template already exists
    const existingClass = await this.prisma.class.findUnique({
      where: {
        unique_class_in_year: {
          academicYearId,
          templateId,
        },
      },
    });

    if (existingClass) {
      throw new ConflictException('Class with this template already exists for this academic year');
    }

    const classEntity = await this.prisma.class.create({
      data: {
        academicYearId,
        level,
        maxCapacity,
        teacherId,
        templateId,
      },
      include: {
        academicYear: true,
        teacher: true,
        template: true,
      },
    });

    return this.mapToResponse(classEntity);
  }

  async findAll(academicYearId?: string): Promise<ClassResponseDto[]> {
    const where = academicYearId ? { academicYearId } : {};

    const classes = await this.prisma.class.findMany({
      include: {
        academicYear: true,
        teacher: true,
        template: true,
      },
      orderBy: { createdAt: 'desc' },
      where,
    });

    return classes.map(classEntity => this.mapToResponse(classEntity));
  }

  async findOne(id: string): Promise<ClassResponseDto> {
    const classEntity = await this.prisma.class.findUnique({
      include: {
        academicYear: true,
        teacher: true,
        template: true,
      },
      where: { id },
    });

    if (!classEntity) {
      throw new NotFoundException('Class not found');
    }

    return this.mapToResponse(classEntity);
  }

  async update(id: string, updateClassDto: UpdateClassDto): Promise<ClassResponseDto> {
    await this.findOne(id);

    // Verify teacher exists and has TEACHER role (if being updated)
    if (updateClassDto.teacherId) {
      const teacher = await this.prisma.user.findUnique({
        where: { id: updateClassDto.teacherId },
      });

      if (!teacher) {
        throw new NotFoundException('Teacher not found');
      }

      if (teacher.role !== UserRole.TEACHER) {
        throw new BadRequestException('Assigned user must have TEACHER role');
      }

      if (!teacher.isActive) {
        throw new BadRequestException('Cannot assign inactive teacher');
      }
    }

    const updatedClass = await this.prisma.class.update({
      data: updateClassDto,
      include: {
        academicYear: true,
        teacher: true,
        template: true,
      },
      where: { id },
    });

    return this.mapToResponse(updatedClass);
  }

  async remove(id: string): Promise<ClassResponseDto> {
    await this.findOne(id);

    // TODO: Check if class has students associated with it
    // This will be implemented when the Student model is added
    // For now, we'll allow deletion
    // const studentCount = await this.prisma.student.count({
    //   where: { classId: id },
    // });
    //
    // if (studentCount > 0) {
    //   throw new BadRequestException('Cannot delete class with associated students');
    // }

    const deletedClass = await this.prisma.class.delete({
      include: {
        academicYear: true,
        teacher: true,
        template: true,
      },
      where: { id },
    });

    return this.mapToResponse(deletedClass);
  }

  private mapToResponse(classEntity: {
    id: string;
    level: string;
    maxCapacity: number | null;
    createdAt: Date;
    updatedAt: Date;
    academicYearId: string;
    templateId: string;
    teacherId: string | null;
    academicYear: {
      id: string;
      name: string;
      startDate: Date;
      endDate: Date;
      isActive: boolean;
    };
    template: {
      id: string;
      name: string;
      isActive: boolean;
    };
    teacher: {
      id: string;
      email: string | null;
      phone: string | null;
      role: UserRole;
      isActive: boolean;
    } | null;
  }): ClassResponseDto {
    return {
      academicYear: {
        endDate: classEntity.academicYear.endDate,
        id: classEntity.academicYear.id,
        isActive: classEntity.academicYear.isActive,
        name: classEntity.academicYear.name,
        startDate: classEntity.academicYear.startDate,
      },
      academicYearId: classEntity.academicYearId,
      createdAt: classEntity.createdAt,
      id: classEntity.id,
      level: classEntity.level,
      maxCapacity: classEntity.maxCapacity || undefined,
      teacher: classEntity.teacher
        ? {
            email: classEntity.teacher.email || undefined,
            id: classEntity.teacher.id,
            isActive: classEntity.teacher.isActive,
            phone: classEntity.teacher.phone || undefined,
            role: classEntity.teacher.role,
          }
        : undefined,
      teacherId: classEntity.teacherId || undefined,
      template: {
        id: classEntity.template.id,
        isActive: classEntity.template.isActive,
        name: classEntity.template.name,
      },
      templateId: classEntity.templateId,
      updatedAt: classEntity.updatedAt,
    };
  }
}
