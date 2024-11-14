/*
  Warnings:

  - You are about to drop the column `residenceCountry` on the `Profile` table. All the data in the column will be lost.
  - You are about to drop the column `userPictureId` on the `Profile` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[applicationNumber]` on the table `Profile` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `nationality` to the `Profile` table without a default value. This is not possible if the table is not empty.
  - Added the required column `nationalityAcquisition` to the `Profile` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "DocumentType" AS ENUM ('FIRST_REQUEST', 'RENEWAL', 'MODIFICATION');

-- CreateEnum
CREATE TYPE "NationalityAcquisition" AS ENUM ('BIRTH', 'NATURALIZATION', 'MARRIAGE', 'OTHER');

-- DropForeignKey
ALTER TABLE "Profile" DROP CONSTRAINT "Profile_userPictureId_fkey";

-- AlterTable
ALTER TABLE "Profile" DROP COLUMN "residenceCountry",
DROP COLUMN "userPictureId",
ADD COLUMN     "applicationNumber" TEXT,
ADD COLUMN     "documentType" "DocumentType" NOT NULL DEFAULT 'FIRST_REQUEST',
ADD COLUMN     "employer" TEXT,
ADD COLUMN     "employerAddress" TEXT,
ADD COLUMN     "fatherFullName" TEXT,
ADD COLUMN     "lastActivityGabon" TEXT,
ADD COLUMN     "motherFullName" TEXT,
ADD COLUMN     "nationality" TEXT NOT NULL,
ADD COLUMN     "nationalityAcquisition" "NationalityAcquisition" NOT NULL,
ADD COLUMN     "passportExpiryDate" TIMESTAMP(3),
ADD COLUMN     "passportIssueDate" TIMESTAMP(3),
ADD COLUMN     "passportNumber" TEXT,
ADD COLUMN     "profession" TEXT,
ADD COLUMN     "spouseFullName" TEXT;

-- CreateTable
CREATE TABLE "EmergencyContact" (
    "id" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "relationship" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "profileId" TEXT NOT NULL,

    CONSTRAINT "EmergencyContact_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AddressGabon" (
    "id" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "district" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "profileId" TEXT NOT NULL,

    CONSTRAINT "AddressGabon_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "EmergencyContact_profileId_key" ON "EmergencyContact"("profileId");

-- CreateIndex
CREATE UNIQUE INDEX "AddressGabon_profileId_key" ON "AddressGabon"("profileId");

-- CreateIndex
CREATE UNIQUE INDEX "Profile_applicationNumber_key" ON "Profile"("applicationNumber");

-- AddForeignKey
ALTER TABLE "EmergencyContact" ADD CONSTRAINT "EmergencyContact_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "Profile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AddressGabon" ADD CONSTRAINT "AddressGabon_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "Profile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
