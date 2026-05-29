/*
  Warnings:

  - A unique constraint covering the columns `[requestCode]` on the table `Licence` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[email]` on the table `User` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `requestCode` to the `Licence` table without a default value. This is not possible if the table is not empty.
  - Added the required column `signature` to the `Licence` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Licence" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "requestCode" TEXT NOT NULL,
ADD COLUMN     "signature" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Salle" ADD COLUMN     "disabled" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "active" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "email" TEXT,
ADD COLUMN     "nom" TEXT,
ADD COLUMN     "prenom" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Licence_requestCode_key" ON "Licence"("requestCode");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
