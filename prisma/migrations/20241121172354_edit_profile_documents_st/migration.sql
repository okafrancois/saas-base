/*
  Warnings:

  - You are about to drop the column `addressProof` on the `Profile` table. All the data in the column will be lost.
  - You are about to drop the column `birthCertificate` on the `Profile` table. All the data in the column will be lost.
  - You are about to drop the column `identityPicture` on the `Profile` table. All the data in the column will be lost.
  - You are about to drop the column `passport` on the `Profile` table. All the data in the column will be lost.
  - You are about to drop the column `residencePermit` on the `Profile` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[passportId]` on the table `Profile` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[birthCertificateId]` on the table `Profile` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[residencePermitId]` on the table `Profile` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[addressProofId]` on the table `Profile` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Document" ALTER COLUMN "profileId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Profile" DROP COLUMN "addressProof",
DROP COLUMN "birthCertificate",
DROP COLUMN "identityPicture",
DROP COLUMN "passport",
DROP COLUMN "residencePermit",
ADD COLUMN     "addressProofId" TEXT,
ADD COLUMN     "birthCertificateId" TEXT,
ADD COLUMN     "passportId" TEXT,
ADD COLUMN     "residencePermitId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Profile_passportId_key" ON "Profile"("passportId");

-- CreateIndex
CREATE UNIQUE INDEX "Profile_birthCertificateId_key" ON "Profile"("birthCertificateId");

-- CreateIndex
CREATE UNIQUE INDEX "Profile_residencePermitId_key" ON "Profile"("residencePermitId");

-- CreateIndex
CREATE UNIQUE INDEX "Profile_addressProofId_key" ON "Profile"("addressProofId");

-- AddForeignKey
ALTER TABLE "Profile" ADD CONSTRAINT "Profile_passportId_fkey" FOREIGN KEY ("passportId") REFERENCES "Document"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Profile" ADD CONSTRAINT "Profile_birthCertificateId_fkey" FOREIGN KEY ("birthCertificateId") REFERENCES "Document"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Profile" ADD CONSTRAINT "Profile_residencePermitId_fkey" FOREIGN KEY ("residencePermitId") REFERENCES "Document"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Profile" ADD CONSTRAINT "Profile_addressProofId_fkey" FOREIGN KEY ("addressProofId") REFERENCES "Document"("id") ON DELETE SET NULL ON UPDATE CASCADE;
