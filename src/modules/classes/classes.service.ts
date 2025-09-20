import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';

import { Level, UserRole } from '@prisma/client';

import { PrismaService } from '@/database';
import { UsersService } from '@/modules/users/users.service';
import { AcademicYearsService } from '@/modules/academic-years/academic-years.service';
import { ClassTemplatesService } from '@/modules/class-templates/class-templates.service';

import { CreateClassDto, UpdateClassDto, ClassResponseDto } from './dto';

@Injectable()
export class ClassesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly usersService: UsersService,
    private readonly academicYearsService: AcademicYearsService,
    private readonly classTemplatesService: ClassTemplatesService,
  ) {}

  async create(createClassDto: CreateClassDto): Promise<ClassResponseDto> {
    const { academicYearId, level, maxCapacity, teacherId, templateId } = createClassDto;

    const academicYear = await this.academicYearsService.findOne(academicYearId);

    if (!academicYear.isActive) {
      throw new BadRequestException('Cannot create class with inactive academic year');
    }

    const classTemplate = await this.classTemplatesService.findOne(templateId);

    if (!classTemplate.isActive) {
      throw new BadRequestException('Cannot create class with inactive template');
    }

    if (teacherId) {
      const teacher = await this.usersService.findOne(teacherId);

      if (teacher.role !== UserRole.TEACHER) {
        throw new BadRequestException('Assigned user must have TEACHER role');
      }

      if (!teacher.isActive) {
        throw new BadRequestException('Cannot assign inactive teacher');
      }
    }

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

  async findAll(
    page: number = 1,
    limit: number = 10,
    academicYearId?: string,
  ): Promise<{ data: ClassResponseDto[]; total: number }> {
    const where = academicYearId ? { academicYearId } : {};
    const skip = (page - 1) * limit;

    const [classes, total] = await Promise.all([
      this.prisma.class.findMany({
        include: {
          academicYear: true,
          teacher: true,
          template: true,
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        where,
      }),
      this.prisma.class.count({ where }),
    ]);

    return {
      data: classes.map(classEntity => this.mapToResponse(classEntity)),
      total,
    };
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
    const existingClass = await this.findOne(id);

    if (updateClassDto.academicYearId) {
      const academicYear = await this.academicYearsService.findOne(updateClassDto.academicYearId);

      if (!academicYear.isActive) {
        throw new BadRequestException('Cannot assign class to inactive academic year');
      }
    }

    if (updateClassDto.templateId) {
      const template = await this.classTemplatesService.findOne(updateClassDto.templateId);

      if (!template.isActive) {
        throw new BadRequestException('Cannot assign class to inactive template');
      }
    }

    if (updateClassDto.teacherId) {
      const teacher = await this.usersService.findOne(updateClassDto.teacherId);

      if (teacher.role !== UserRole.TEACHER) {
        throw new BadRequestException('Assigned user must have TEACHER role');
      }

      if (!teacher.isActive) {
        throw new BadRequestException('Cannot assign inactive teacher');
      }
    }

    if (updateClassDto.academicYearId || updateClassDto.templateId) {
      const academicYearId = updateClassDto.academicYearId || existingClass.academicYearId;
      const templateId = updateClassDto.templateId || existingClass.templateId;

      const existingClassWithSameYearAndTemplate = await this.prisma.class.findFirst({
        where: {
          academicYearId,
          id: { not: id },
          templateId,
        },
      });

      if (existingClassWithSameYearAndTemplate) {
        throw new ConflictException(
          'A class with this template already exists in the specified academic year',
        );
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
    level: Level;
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
