/*
  Warnings:

  - You are about to drop the column `acquisition` on the `Profile` table. All the data in the column will be lost.
  - Changed the type of `type` on the `Request` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "RequestType" AS ENUM ('FIRST_REQUEST', 'RENEWAL', 'MODIFICATION');

-- AlterTable
ALTER TABLE "Profile" DROP COLUMN "acquisition",
ADD COLUMN     "acquisitionMode" "NationalityAcquisition" DEFAULT 'BIRTH';

-- AlterTable
ALTER TABLE "Request" DROP COLUMN "type",
ADD COLUMN     "type" "RequestType" NOT NULL;

-- DropEnum
DROP TYPE "DocumentType";
