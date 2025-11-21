/*
  Warnings:

  - You are about to drop the column `registrationType` on the `students` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."enrollments" ADD COLUMN     "registrationType" "public"."RegistrationType" NOT NULL DEFAULT 'OFFICIAL';

-- AlterTable
ALTER TABLE "public"."students" DROP COLUMN "registrationType";
