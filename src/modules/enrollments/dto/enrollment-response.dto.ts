import { RegistrationType, TransportationMethod } from '@prisma/client';

export class EnrollmentResponseDto {
  id: string;
  enrollmentDate: Date;
  status: string;
  registrationType: RegistrationType;
  transportationMethod: TransportationMethod;
  student?: {
    id: string;
    firstName: string;
    lastName: string;
    dateOfBirth: Date;
    status: string;
  };
  class?: {
    id: string;
    level: string;
    maxCapacity?: number;
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
      name?: string;
      email?: string;
      phone?: string;
    };
  };
}
