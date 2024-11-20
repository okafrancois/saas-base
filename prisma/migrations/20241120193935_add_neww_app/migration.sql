-- AlterTable
ALTER TABLE "Appointment" ADD COLUMN     "description" TEXT,
ALTER COLUMN "status" SET DEFAULT 'SCHEDULED';
