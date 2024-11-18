-- CreateEnum
CREATE TYPE "NationalityAcquisition" AS ENUM ('BIRTH', 'NATURALIZATION', 'MARRIAGE', 'OTHER');

-- AlterTable
ALTER TABLE "Profile" ADD COLUMN     "acquisition" "NationalityAcquisition";
