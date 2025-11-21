import {
  Inject,
  Injectable,
  forwardRef,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';

import {
  UserRole,
  type User,
  type Class,
  PrismaClient,
  type Student,
  type Enrollment,
  EnrollmentStatus,
  RegistrationType,
  type AcademicYear,
  type ClassTemplate,
} from '@prisma/client';

import { PrismaService } from '@/database';
import { ClassesService } from '@/modules/classes/classes.service';
import { StudentsService } from '@/modules/students/students.service';

import { CreateEnrollmentDto, UpdateEnrollmentDto, EnrollmentResponseDto } from './dto';

type PrismaTransactionClient = Parameters<Parameters<PrismaClient['$transaction']>[0]>[0];

@Injectable()
export class EnrollmentsService {
  constructor(
    private readonly prisma: PrismaService,
    @Inject(forwardRef(() => StudentsService))
    private readonly studentsService: StudentsService,
    private readonly classesService: ClassesService,
  ) {}

  async create(
    studentId: string,
    createEnrollmentDto: CreateEnrollmentDto,
    creatorRole: UserRole,
    tx?: PrismaTransactionClient,
  ): Promise<EnrollmentResponseDto> {
    const prisma = tx || this.prisma;
    const { classId, transportationMethod } = createEnrollmentDto;
    const initialStatus =
      creatorRole === UserRole.ADMIN ? EnrollmentStatus.ACTIVE : EnrollmentStatus.PENDING;

    await this.studentsService.findByIdBasic(studentId, tx);
    // if (student.status !== StudentStatus.ACTIVE) {
    //   throw new BadRequestException('Only active students can be enrolled in classes');
    // }

    await this.classesService.findByIdBasic(classId, tx);

    const existingEnrollment = await prisma.enrollment.findFirst({
      where: {
        status: {
          in: [EnrollmentStatus.ACTIVE, EnrollmentStatus.PENDING],
        },
        studentId,
      },
    });

    if (existingEnrollment) {
      throw new BadRequestException(
        'لا يمكن تسجيل الطالب مرة أخرى لأن لديه تسجيل نشط أو قيد المراجعة حاليًا في أحد الفصول',
      );
    }

    const registrationType = await this.determineRegistrationType(classId, prisma);

    const enrollment = await prisma.enrollment.create({
      data: {
        classId,
        registrationType,
        status: initialStatus,
        studentId,
        transportationMethod,
      },
    });

    return this.mapEnrollmentToResponse(enrollment);
  }

  async update(
    enrollmentId: string,
    updateEnrollmentDto: UpdateEnrollmentDto,
    updaterRole: UserRole,
  ): Promise<EnrollmentResponseDto> {
    const enrollment = await this.prisma.enrollment.findUnique({
      include: {
        class: {
          include: {
            academicYear: true,
            teacher: true,
            template: true,
          },
        },
        student: true,
      },
      where: { id: enrollmentId },
    });

    if (!enrollment) {
      throw new NotFoundException(`التسجيل بالمعرف ${enrollmentId} غير موجود`);
    }

    // Prepare update data
    const updateData: {
      status?: EnrollmentStatus;
      classId?: string;
      registrationType?: RegistrationType;
    } = {};

    if (updateEnrollmentDto.status !== undefined) {
      updateData.status = updateEnrollmentDto.status;
    }

    // If classId is being updated, determine the new registration type
    if (updateEnrollmentDto.classId && updateEnrollmentDto.classId !== enrollment.class.id) {
      updateData.classId = updateEnrollmentDto.classId;

      // Determine registration type for the new class
      const registrationType = await this.determineRegistrationType(
        updateEnrollmentDto.classId,
        this.prisma,
        enrollmentId, // Exclude current enrollment from count
      );
      updateData.registrationType = registrationType;
    }

    const updatedEnrollment = await this.prisma.enrollment.update({
      data: updateData,
      include: {
        class: {
          include: {
            academicYear: true,
            teacher: true,
            template: true,
          },
        },
        student: true,
      },
      where: { id: enrollmentId },
    });

    return this.mapEnrollmentToResponse(updatedEnrollment);
  }

  async findByStudentId(studentId: string): Promise<EnrollmentResponseDto[]> {
    const enrollments = await this.prisma.enrollment.findMany({
      include: {
        class: {
          include: {
            academicYear: true,
            teacher: true,
            template: true,
          },
        },
        student: true,
      },
      orderBy: { enrollmentDate: 'desc' },
      where: { studentId },
    });

    return enrollments.map(enrollment => this.mapEnrollmentToResponse(enrollment));
  }

  async findByClassId(
    classId: string,
    requesterRole: UserRole,
    requesterId?: string,
  ): Promise<EnrollmentResponseDto[]> {
    // Check if class exists
    const classExists = await this.prisma.class.findUnique({
      where: { id: classId },
    });

    if (!classExists) {
      throw new NotFoundException(`الفصل بالمعرف ${classId} غير موجود`);
    }

    // If requester is a teacher, check if they are assigned to this class
    if (requesterRole === UserRole.TEACHER) {
      if (!requesterId || classExists.teacherId !== requesterId) {
        throw new ForbiddenException('لا يمكن الوصول إلى الفصول التي ليس لديك تعيين لها');
      }
    }

    const enrollments = await this.prisma.enrollment.findMany({
      include: {
        class: {
          include: {
            academicYear: true,
            teacher: true,
            template: true,
          },
        },
        student: true,
      },
      orderBy: { enrollmentDate: 'asc' },
      where: {
        classId,
        status: EnrollmentStatus.ACTIVE,
      },
    });

    return enrollments.map(enrollment => this.mapEnrollmentToResponse(enrollment));
  }

  async findById(enrollmentId: string): Promise<EnrollmentResponseDto> {
    const enrollment = await this.prisma.enrollment.findUnique({
      include: {
        class: {
          include: {
            academicYear: true,
            teacher: true,
            template: true,
          },
        },
        student: true,
      },
      where: { id: enrollmentId },
    });

    if (!enrollment) {
      throw new NotFoundException(`التسجيل بالمعرف ${enrollmentId} غير موجود`);
    }

    return this.mapEnrollmentToResponse(enrollment);
  }

  private async determineRegistrationType(
    classId: string,
    prisma: PrismaClient | PrismaTransactionClient,
    excludeEnrollmentId?: string,
  ): Promise<RegistrationType> {
    const classData = await prisma.class.findUnique({
      select: { maxCapacity: true },
      where: { id: classId },
    });

    if (!classData) {
      throw new NotFoundException(`الفصل بالمعرف ${classId} غير موجود`);
    }

    if (!classData.maxCapacity) {
      return RegistrationType.NORMAL;
    }

    const whereClause: {
      classId: string;
      status: EnrollmentStatus;
      id?: { not: string };
    } = {
      classId,
      status: EnrollmentStatus.ACTIVE,
    };

    if (excludeEnrollmentId) {
      whereClause.id = { not: excludeEnrollmentId };
    }

    const currentEnrollments = await prisma.enrollment.count({
      where: whereClause,
    });

    return currentEnrollments >= classData.maxCapacity
      ? RegistrationType.TEMPORARY
      : RegistrationType.NORMAL;
  }

  private mapEnrollmentToResponse(
    enrollment: Enrollment & {
      student?: Student;
      class?: Class & {
        academicYear: AcademicYear;
        template: ClassTemplate;
        teacher?: User | null;
      };
    },
  ): EnrollmentResponseDto {
    return {
      class: enrollment.class
        ? {
            academicYear: {
              endDate: enrollment.class.academicYear.endDate,
              id: enrollment.class.academicYear.id,
              name: enrollment.class.academicYear.name,
              startDate: enrollment.class.academicYear.startDate,
            },
            id: enrollment.class.id,
            level: enrollment.class.level,
            maxCapacity: enrollment.class.maxCapacity ?? undefined,
            teacher: enrollment.class.teacher
              ? {
                  email: enrollment.class.teacher.email ?? undefined,
                  id: enrollment.class.teacher.id,
                  name: enrollment.class.teacher.name ?? undefined,
                  phone: enrollment.class.teacher.phone ?? undefined,
                }
              : undefined,
            template: {
              id: enrollment.class.template.id,
              name: enrollment.class.template.name,
            },
          }
        : undefined,
      enrollmentDate: enrollment.enrollmentDate,
      id: enrollment.id,
      registrationType: enrollment.registrationType,
      status: enrollment.status,
      student: enrollment.student
        ? {
            dateOfBirth: enrollment.student.dateOfBirth,
            firstName: enrollment.student.firstName,
            id: enrollment.student.id,
            lastName: enrollment.student.lastName,
            status: enrollment.student.status,
          }
        : undefined,
      transportationMethod: enrollment.transportationMethod,
    };
  }
}
