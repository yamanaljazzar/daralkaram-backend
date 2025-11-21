/*
  Warnings:

  - You are about to drop the column `transportationMethod` on the `students` table. All the data in the column will be lost.
  - The `parentsMaritalStatus` column on the `students` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "public"."ParentMaritalStatus" AS ENUM ('TOGETHER', 'SEPARATED', 'OTHERS');

-- CreateEnum
CREATE TYPE "public"."TransportationMethod" AS ENUM ('BUS', 'WALK');

-- AlterTable
ALTER TABLE "public"."enrollments" ADD COLUMN     "transportationMethod" "public"."TransportationMethod" NOT NULL DEFAULT 'WALK';

-- AlterTable
ALTER TABLE "public"."students" DROP COLUMN "transportationMethod",
DROP COLUMN "parentsMaritalStatus",
ADD COLUMN     "parentsMaritalStatus" "public"."ParentMaritalStatus";
