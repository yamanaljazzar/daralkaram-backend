/*
  Warnings:

  - You are about to drop the column `relationToChild` on the `guardians` table. All the data in the column will be lost.
  - You are about to drop the `_GuardianToStudent` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."_GuardianToStudent" DROP CONSTRAINT "_GuardianToStudent_A_fkey";

-- DropForeignKey
ALTER TABLE "public"."_GuardianToStudent" DROP CONSTRAINT "_GuardianToStudent_B_fkey";

-- AlterTable
ALTER TABLE "public"."guardians" DROP COLUMN "relationToChild";

-- DropTable
DROP TABLE "public"."_GuardianToStudent";

-- CreateTable
CREATE TABLE "public"."student_guardian_relations" (
    "studentId" TEXT NOT NULL,
    "guardianId" TEXT NOT NULL,
    "relationToChild" TEXT NOT NULL,

    CONSTRAINT "student_guardian_relations_pkey" PRIMARY KEY ("studentId","guardianId")
);

-- AddForeignKey
ALTER TABLE "public"."student_guardian_relations" ADD CONSTRAINT "student_guardian_relations_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "public"."students"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."student_guardian_relations" ADD CONSTRAINT "student_guardian_relations_guardianId_fkey" FOREIGN KEY ("guardianId") REFERENCES "public"."guardians"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
