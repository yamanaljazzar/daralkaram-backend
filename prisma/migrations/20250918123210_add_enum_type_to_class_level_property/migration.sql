/*
  Warnings:

  - Changed the type of `level` on the `classes` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "public"."Level" AS ENUM ('KG1', 'KG2', 'KG3', 'FIRST_GRADE');

-- AlterTable
ALTER TABLE "public"."classes" DROP COLUMN "level",
ADD COLUMN     "level" "public"."Level" NOT NULL;
