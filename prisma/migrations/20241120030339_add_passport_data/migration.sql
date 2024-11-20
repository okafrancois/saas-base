/*
  Warnings:

  - Added the required column `passportExpiryDate` to the `Profile` table without a default value. This is not possible if the table is not empty.
  - Added the required column `passportIssueAuthority` to the `Profile` table without a default value. This is not possible if the table is not empty.
  - Added the required column `passportIssueDate` to the `Profile` table without a default value. This is not possible if the table is not empty.
  - Added the required column `passportNumber` to the `Profile` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Profile" ADD COLUMN     "passportExpiryDate" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "passportIssueAuthority" TEXT NOT NULL,
ADD COLUMN     "passportIssueDate" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "passportNumber" TEXT NOT NULL;
