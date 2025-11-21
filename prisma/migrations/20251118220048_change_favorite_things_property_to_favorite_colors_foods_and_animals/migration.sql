/*
  Warnings:

  - You are about to drop the column `favoriteThings` on the `students` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."students" DROP COLUMN "favoriteThings",
ADD COLUMN     "favoriteAnimals" JSONB,
ADD COLUMN     "favoriteColors" JSONB,
ADD COLUMN     "favoriteFoods" JSONB;
