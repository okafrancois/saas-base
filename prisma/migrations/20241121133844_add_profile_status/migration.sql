/*
  Warnings:

  - The `status` column on the `Profile` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterEnum
ALTER TYPE "RequestStatus" ADD VALUE 'VALID';

-- AlterTable
ALTER TABLE "Profile" DROP COLUMN "status",
ADD COLUMN     "status" "RequestStatus" NOT NULL DEFAULT 'INCOMPLETE';
