/*
  Warnings:

  - You are about to drop the column `salleId` on the `Licence` table. All the data in the column will be lost.
  - Added the required column `nomSalle` to the `Licence` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Licence" DROP CONSTRAINT "Licence_salleId_fkey";

-- AlterTable
ALTER TABLE "Licence" DROP COLUMN "salleId",
ADD COLUMN     "nomSalle" TEXT NOT NULL;
