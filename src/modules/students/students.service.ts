import * as bcrypt from 'bcryptjs';

import {
  Inject,
  Injectable,
  forwardRef,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';

import {
  UserRole,
  PrismaClient,
  StudentStatus,
  EnrollmentStatus,
  RegistrationType,
  TransportationMethod,
} from '@prisma/client';

import { PrismaService } from '@/database';
import { GuardiansService } from '@/modules/guardians/guardians.service';
import { EnrollmentsService } from '@/modules/enrollments/enrollments.service';

type PrismaTransactionClient = Parameters<Parameters<PrismaClient['$transaction']>[0]>[0];

import {
  CreateStudentDto,
  StudentResponseDto,
  FindStudentsQueryDto,
  CreateStudentResponseDto,
} from './dto';

@Injectable()
export class StudentsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly guardiansService: GuardiansService,
    @Inject(forwardRef(() => EnrollmentsService))
    private readonly enrollmentsService: EnrollmentsService,
  ) {}

  async create(
    createStudentDto: CreateStudentDto,
    creatorRole: UserRole,
  ): Promise<CreateStudentResponseDto> {
    const { classId, guardians, transportationMethod, ...studentData } = createStudentDto;

    const initialStatus =
      creatorRole === UserRole.ADMIN ? StudentStatus.ACTIVE : StudentStatus.PENDING_APPROVAL;

    const generatedPasswords: Array<{ guardianName: string; phone: string; password: string }> = [];

    return await this.prisma.$transaction(async tx => {
      const student = await tx.student.create({
        data: {
          ...studentData,
          dateOfBirth: new Date(studentData.dateOfBirth),

          status: initialStatus,
        },
      });

      // Process guardians
      for (const guardianInput of guardians) {
        const { createLoginAccount, relationToChild, ...guardianData } = guardianInput;

        const guardian = await this.guardiansService.findOrCreate(guardianData, tx);

        if (createLoginAccount) {
          let user = await tx.user.findUnique({
            where: { phone: guardianData.phone },
          });

          if (!user) {
            const password = this.generateRandomPassword();
            const passwordHash = await bcrypt.hash(password, 10);

            user = await tx.user.create({
              data: {
                isActive: true,
                isVerified: initialStatus === 'ACTIVE' ? true : false,
                name: guardianData.name,
                passwordHash,
                phone: guardianData.phone,
                role: UserRole.GUARDIAN,
              },
            });

            generatedPasswords.push({
              guardianName: guardianData.name,
              password,
              phone: guardianData.phone,
            });
          }

          await tx.guardian.update({
            data: { userId: user.id },
            where: { id: guardian.id },
          });
        }

        await tx.studentGuardianRelation.create({
          data: {
            guardianId: guardian.id,
            relationToChild,
            studentId: student.id,
          },
        });
      }

      await this.enrollmentsService.create(
        student.id,
        { classId, transportationMethod },
        creatorRole,
        tx,
      );

      const completeStudent = await tx.student.findUnique({
        include: {
          enrollments: {
            include: {
              class: {
                include: {
                  academicYear: true,
                  teacher: true,
                  template: true,
                },
              },
            },
          },
          guardians: {
            include: {
              guardian: {
                include: {
                  user: true,
                },
              },
            },
          },
        },
        where: { id: student.id },
      });

      if (!completeStudent) {
        throw new Error('تعذر استرجاع بيانات الطالب الذي تم إنشاؤه');
      }

      return {
        generatedPasswords,
        student: this.mapStudentToResponse(completeStudent),
      };
    });
  }

  async findAll(
    query: FindStudentsQueryDto,
  ): Promise<{ data: StudentResponseDto[]; total: number }> {
    const { limit = 10, page = 1, search, status } = query;
    const skip = (page - 1) * limit;

    const where: {
      status?: any;
      OR?: any;
    } = {};

    if (status) {
      where.status = status;
    }

    if (search) {
      where.OR = [
        { lastName: { contains: search, mode: 'insensitive' } },
        { firstName: { contains: search, mode: 'insensitive' } },
        { homePhone: { contains: search, mode: 'insensitive' } },
        { homeAddress: { contains: search, mode: 'insensitive' } },
        { guardians: { some: { guardian: { name: { contains: search, mode: 'insensitive' } } } } },
      ];
    }

    const [students, total] = await Promise.all([
      this.prisma.student.findMany({
        include: {
          enrollments: {
            include: {
              class: {
                include: {
                  academicYear: true,
                  teacher: true,
                  template: true,
                },
              },
            },
          },
          guardians: {
            include: {
              guardian: {
                include: {
                  user: true,
                },
              },
            },
          },
        },
        orderBy: { enrollmentDate: 'desc' },
        skip,
        take: limit,
        where,
      }),
      this.prisma.student.count({ where }),
    ]);

    return {
      data: students.map(student => this.mapStudentToResponse(student)),
      total,
    };
  }

  async findById(id: string): Promise<StudentResponseDto> {
    const student = await this.prisma.student.findUnique({
      include: {
        enrollments: {
          include: {
            class: {
              include: {
                academicYear: true,
                teacher: true,
                template: true,
              },
            },
          },
        },
        guardians: {
          include: {
            guardian: {
              include: {
                user: true,
              },
            },
          },
        },
      },
      where: { id },
    });

    if (!student) {
      throw new NotFoundException(`لم يتم العثور على طالب بالمعرف ${id}`);
    }

    return this.mapStudentToResponse(student);
  }

  /**
   * Find student by ID without expensive joins
   * Useful for simple existence checks or when used within transactions
   * @param id - Student ID
   * @param tx - Optional Prisma transaction client
   * @returns Student record without relations or throws NotFoundException
   */
  async findByIdBasic(
    id: string,
    tx?: PrismaTransactionClient,
  ): Promise<{ id: string; firstName: string; lastName: string; status: StudentStatus }> {
    const prisma = (tx || this.prisma) as PrismaClient;
    const student = await prisma.student.findUnique({
      select: {
        firstName: true,
        id: true,
        lastName: true,
        status: true,
      },
      where: { id },
    });

    if (!student) {
      throw new NotFoundException(`الطالب بالمعرف ${id} غير موجود`);
    }

    return student;
  }

  async approve(id: string): Promise<StudentResponseDto> {
    const student = await this.findById(id);

    if (student.status !== StudentStatus.PENDING_APPROVAL) {
      throw new BadRequestException('يمكن فقط الموافقة على الطلاب ذوي الحالة "قيد المراجعة"');
    }

    const updatedStudent = await this.prisma.student.update({
      data: { status: StudentStatus.ACTIVE },
      include: {
        enrollments: {
          include: {
            class: {
              include: {
                academicYear: true,
                teacher: true,
                template: true,
              },
            },
          },
        },
        guardians: {
          include: {
            guardian: true,
          },
        },
      },
      where: { id },
    });

    return this.mapStudentToResponse(updatedStudent);
  }

  async reject(id: string): Promise<StudentResponseDto> {
    const student = await this.findById(id);

    if (student.status !== StudentStatus.PENDING_APPROVAL) {
      throw new BadRequestException('يمكن فقط رفض الطلاب ذوي الحالة "قيد المراجعة"');
    }
    const updatedStudent = await this.prisma.student.update({
      data: { status: StudentStatus.REJECTED },
      include: {
        enrollments: {
          include: {
            class: {
              include: {
                academicYear: true,
                teacher: true,
                template: true,
              },
            },
          },
        },
        guardians: {
          include: {
            guardian: {
              include: {
                user: true,
              },
            },
          },
        },
      },
      where: { id },
    });

    return this.mapStudentToResponse(updatedStudent);
  }

  private generateRandomPassword(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let password = '';
    for (let i = 0; i < 8; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
  }

  private mapStudentToResponse(student: {
    id: string;
    firstName: string;
    lastName: string;
    dateOfBirth: Date;
    photoUrl?: string | null;
    enrollmentDate: Date;
    status: string;
    // registrationType: string;
    homeAddress?: string | null;
    homePhone?: string | null;
    grandfatherName?: string | null;
    siblingsCount: number;
    pickupPerson?: string | null;
    personalityTraits?: any;
    fears?: any;
    favoriteColors?: any;
    favoriteFoods?: any;
    favoriteActivities?: any;
    favoriteAnimals?: any;
    forcedToEat?: boolean | null;
    doctorName?: string | null;
    doctorPhone?: string | null;
    specialConditions?: string | null;
    emergencyContactAddress?: string | null;
    emergencyContactName?: string | null;
    emergencyContactPhone?: string | null;
    guardians: Array<{
      relationToChild: string;
      guardian: {
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
      };
    }>;
    enrollments: Array<{
      id: string;
      enrollmentDate: Date;
      status: EnrollmentStatus;
      transportationMethod: TransportationMethod;
      registrationType: RegistrationType;
      class: {
        id: string;
        level: string;
        maxCapacity?: number | null;
        academicYear: {
          id: string;
          name: string;
          startDate: Date;
          endDate: Date;
        };
        template: {
          id: string;
          name: string;
        };
        teacher?: {
          id: string;
          name?: string | null;
          email?: string | null;
          phone?: string | null;
        } | null;
      };
    }>;
  }): StudentResponseDto {
    return {
      dateOfBirth: student.dateOfBirth,
      doctorName: student.doctorName ?? undefined,
      doctorPhone: student.doctorPhone ?? undefined,
      emergencyContactAddress: student.emergencyContactAddress ?? undefined,
      emergencyContactName: student.emergencyContactName ?? undefined,
      emergencyContactPhone: student.emergencyContactPhone ?? undefined,
      enrollmentDate: student.enrollmentDate,
      enrollments: student.enrollments.map(enrollment => ({
        class: {
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
        },
        enrollmentDate: enrollment.enrollmentDate,
        id: enrollment.id,
        registrationType: enrollment.registrationType,
        status: enrollment.status,
        transportationMethod: enrollment.transportationMethod,
      })),
      favoriteAnimals: student.favoriteAnimals as string[],
      favoriteColors: student.favoriteColors as string[],
      favoriteFoods: student.favoriteFoods as string[],
      fears: student.fears as string[],
      firstName: student.firstName,
      forcedToEat: student.forcedToEat ?? undefined,
      grandfatherName: student.grandfatherName ?? undefined,
      guardians: student.guardians.map(relation => ({
        createdAt: relation.guardian.createdAt,
        dateOfBirth: relation.guardian.dateOfBirth ?? undefined,
        educationLevel: relation.guardian.educationLevel ?? undefined,
        id: relation.guardian.id,
        maritalStatus: relation.guardian.maritalStatus ?? undefined,
        name: relation.guardian.name,
        occupation: relation.guardian.occupation ?? undefined,
        phone: relation.guardian.phone,
        relationToChild: relation.relationToChild,
        updatedAt: relation.guardian.updatedAt,
        user: relation.guardian.user
          ? {
              email: relation.guardian.user.email ?? undefined,
              id: relation.guardian.user.id,
              isActive: relation.guardian.user.isActive,
              isVerified: relation.guardian.user.isVerified,
              name: relation.guardian.user.name ?? undefined,
              phone: relation.guardian.user.phone ?? undefined,
            }
          : undefined,
      })),
      homeAddress: student.homeAddress ?? undefined,
      homePhone: student.homePhone ?? undefined,
      id: student.id,
      lastName: student.lastName,
      personalityTraits: student.personalityTraits as string[],
      photoUrl: student.photoUrl ?? undefined,
      pickupPerson: student.pickupPerson ?? undefined,
      // registrationType: student.registrationType,
      siblingsCount: student.siblingsCount,
      specialConditions: student.specialConditions ?? undefined,
      status: student.status,
      transportationMethod: student.enrollments[0]?.transportationMethod ?? undefined,
    };
  }
}
