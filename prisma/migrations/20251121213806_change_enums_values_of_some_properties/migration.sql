/*
  Warnings:

  - The values [OFFICIAL,SPECIAL] on the enum `RegistrationType` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
ALTER TYPE "public"."EnrollmentStatus" ADD VALUE 'PENDING';

-- AlterEnum
BEGIN;
CREATE TYPE "public"."RegistrationType_new" AS ENUM ('NORMAL', 'TEMPORARY');
ALTER TABLE "public"."enrollments" ALTER COLUMN "registrationType" DROP DEFAULT;
ALTER TABLE "public"."enrollments" ALTER COLUMN "registrationType" TYPE "public"."RegistrationType_new" USING ("registrationType"::text::"public"."RegistrationType_new");
ALTER TYPE "public"."RegistrationType" RENAME TO "RegistrationType_old";
ALTER TYPE "public"."RegistrationType_new" RENAME TO "RegistrationType";
DROP TYPE "public"."RegistrationType_old";
ALTER TABLE "public"."enrollments" ALTER COLUMN "registrationType" SET DEFAULT 'NORMAL';
COMMIT;

-- AlterTable
ALTER TABLE "public"."enrollments" ALTER COLUMN "status" SET DEFAULT 'PENDING',
ALTER COLUMN "registrationType" SET DEFAULT 'NORMAL';
