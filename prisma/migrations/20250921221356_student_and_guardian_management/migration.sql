-- CreateEnum
CREATE TYPE "public"."StudentStatus" AS ENUM ('PENDING_APPROVAL', 'ACTIVE', 'REJECTED', 'GRADUATED', 'WITHDRAWN');

-- CreateEnum
CREATE TYPE "public"."RegistrationType" AS ENUM ('OFFICIAL', 'SPECIAL');

-- CreateEnum
CREATE TYPE "public"."EnrollmentStatus" AS ENUM ('ACTIVE', 'COMPLETED', 'WITHDRAWN');

-- CreateTable
CREATE TABLE "public"."students" (
    "id" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "dateOfBirth" TIMESTAMP(3) NOT NULL,
    "photoUrl" TEXT,
    "enrollmentDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" "public"."StudentStatus" NOT NULL DEFAULT 'PENDING_APPROVAL',
    "registrationType" "public"."RegistrationType" NOT NULL DEFAULT 'OFFICIAL',
    "homeAddress" TEXT,
    "homePhone" TEXT,
    "grandfatherName" TEXT,
    "siblingsCount" INTEGER NOT NULL DEFAULT 0,
    "transportationMethod" TEXT,
    "pickupPerson" TEXT,
    "personalityTraits" JSONB,
    "fears" JSONB,
    "favoriteThings" JSONB,
    "forcedToEat" BOOLEAN,
    "doctorName" TEXT,
    "doctorPhone" TEXT,
    "specialConditions" TEXT,
    "emergencyContact" TEXT,

    CONSTRAINT "students_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."guardians" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "relationToChild" TEXT NOT NULL,
    "dateOfBirth" TIMESTAMP(3),
    "educationLevel" TEXT,
    "occupation" TEXT,
    "maritalStatus" TEXT,
    "userId" TEXT,

    CONSTRAINT "guardians_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."enrollments" (
    "id" TEXT NOT NULL,
    "enrollmentDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" "public"."EnrollmentStatus" NOT NULL DEFAULT 'ACTIVE',
    "studentId" TEXT NOT NULL,
    "classId" TEXT NOT NULL,

    CONSTRAINT "enrollments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."_GuardianToStudent" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_GuardianToStudent_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "guardians_phone_key" ON "public"."guardians"("phone");

-- CreateIndex
CREATE UNIQUE INDEX "guardians_userId_key" ON "public"."guardians"("userId");

-- CreateIndex
CREATE INDEX "_GuardianToStudent_B_index" ON "public"."_GuardianToStudent"("B");

-- AddForeignKey
ALTER TABLE "public"."guardians" ADD CONSTRAINT "guardians_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."enrollments" ADD CONSTRAINT "enrollments_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "public"."students"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."enrollments" ADD CONSTRAINT "enrollments_classId_fkey" FOREIGN KEY ("classId") REFERENCES "public"."classes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."_GuardianToStudent" ADD CONSTRAINT "_GuardianToStudent_A_fkey" FOREIGN KEY ("A") REFERENCES "public"."guardians"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."_GuardianToStudent" ADD CONSTRAINT "_GuardianToStudent_B_fkey" FOREIGN KEY ("B") REFERENCES "public"."students"("id") ON DELETE CASCADE ON UPDATE CASCADE;
