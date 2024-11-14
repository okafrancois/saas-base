-- DropForeignKey
ALTER TABLE "Profile" DROP CONSTRAINT "Profile_consulateId_fkey";

-- AlterTable
ALTER TABLE "Profile" ALTER COLUMN "consulateId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Profile" ADD CONSTRAINT "Profile_consulateId_fkey" FOREIGN KEY ("consulateId") REFERENCES "Consulate"("id") ON DELETE SET NULL ON UPDATE CASCADE;
