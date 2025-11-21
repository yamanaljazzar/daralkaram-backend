/*
  Warnings:

  - You are about to drop the column `maritalStatus` on the `guardians` table. All the data in the column will be lost.
  - You are about to drop the column `emergencyContact` on the `students` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."guardians" DROP COLUMN "maritalStatus";

-- AlterTable
ALTER TABLE "public"."students" DROP COLUMN "emergencyContact",
ADD COLUMN     "emergencyContactAddress" TEXT,
ADD COLUMN     "emergencyContactName" TEXT,
ADD COLUMN     "emergencyContactPhone" TEXT,
ADD COLUMN     "parentsMaritalStatus" TEXT;
