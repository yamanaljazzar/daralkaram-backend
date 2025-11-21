export class GuardianResponseDto {
  id: string;
  name: string;
  phone: string;
  dateOfBirth?: Date;
  educationLevel?: string;
  occupation?: string;
  maritalStatus?: string;
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
  students: Array<{
    id: string;
    relationToChild: string;
    firstName: string;
    lastName: string;
    dateOfBirth: Date;
    status: string;
  }>;
}
