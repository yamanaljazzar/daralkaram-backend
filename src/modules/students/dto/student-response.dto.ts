export class GuardianResponseDto {
  id: string;
  name: string;
  phone: string;
  relationToChild: string;
  dateOfBirth?: Date;
  educationLevel?: string;
  occupation?: string;
  createdAt: Date;
  updatedAt: Date;
  user?: {
    id: string;
    name?: string;
    email?: string;
    phone?: string;
    isActive: boolean;
    isVerified: boolean;
  };
}

export class EnrollmentResponseDto {
  id: string;
  enrollmentDate: Date;
  status: string;
  registrationType: string;
  class: {
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

export class StudentResponseDto {
  id: string;
  firstName: string;
  lastName: string;
  dateOfBirth: Date;
  photoUrl?: string;
  enrollmentDate: Date;
  status: string;
  // registrationType: string;
  homeAddress?: string;
  homePhone?: string;
  grandfatherName?: string;
  siblingsCount: number;
  transportationMethod?: string;

  pickupPerson?: string;
  personalityTraits?: string[];
  fears?: string[];
  favoriteColors?: string[];
  favoriteFoods?: string[];
  favoriteAnimals?: string[];
  forcedToEat?: boolean;
  doctorName?: string;
  doctorPhone?: string;
  specialConditions?: string;
  emergencyContactAddress?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  parentsMaritalStatus?: string;
  guardians: GuardianResponseDto[];
  enrollments: EnrollmentResponseDto[];
}

export class CreateStudentResponseDto {
  student: StudentResponseDto;
  generatedPasswords: Array<{
    guardianName: string;
    phone: string;
    password: string;
  }>;
}
