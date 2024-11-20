-- CreateEnum
CREATE TYPE "DocumentType" AS ENUM ('PASSPORT', 'IDENTITY_PICTURE', 'BIRTH_CERTIFICATE', 'RESIDENCE_PERMIT', 'ADDRESS_PROOF', 'MARRIAGE_CERTIFICATE', 'DIVORCE_DECREE', 'DEATH_CERTIFICATE', 'OTHER');

-- CreateEnum
CREATE TYPE "DocumentStatus" AS ENUM ('PENDING', 'VALIDATED', 'REJECTED', 'EXPIRED', 'INCOMPLETE');

-- CreateEnum
CREATE TYPE "DocumentValidityPeriod" AS ENUM ('THREE_MONTHS', 'SIX_MONTHS', 'ONE_YEAR', 'FIVE_YEARS', 'TEN_YEARS', 'UNLIMITED');

-- CreateTable
CREATE TABLE "Document" (
    "id" TEXT NOT NULL,
    "type" "DocumentType" NOT NULL,
    "status" "DocumentStatus" NOT NULL DEFAULT 'PENDING',
    "fileUrl" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "fileSize" INTEGER NOT NULL,
    "mimeType" TEXT NOT NULL,
    "uploadedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "validUntil" TIMESTAMP(3),
    "validatedAt" TIMESTAMP(3),
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "verifiedBy" TEXT,
    "verifiedAt" TIMESTAMP(3),
    "notes" TEXT,
    "rejectionReason" TEXT,
    "userId" TEXT NOT NULL,
    "requestId" TEXT,
    "validityPeriod" "DocumentValidityPeriod",
    "isOriginal" BOOLEAN NOT NULL DEFAULT false,
    "needsRenewal" BOOLEAN NOT NULL DEFAULT false,
    "aiAnalysisResults" JSONB,
    "aiConfidenceScore" DOUBLE PRECISION,
    "extractedData" JSONB,
    "createdBy" TEXT,
    "updatedBy" TEXT,

    CONSTRAINT "Document_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Document_userId_idx" ON "Document"("userId");

-- CreateIndex
CREATE INDEX "Document_type_idx" ON "Document"("type");

-- CreateIndex
CREATE INDEX "Document_status_idx" ON "Document"("status");

-- CreateIndex
CREATE INDEX "Document_validUntil_idx" ON "Document"("validUntil");

-- CreateIndex
CREATE UNIQUE INDEX "Document_userId_type_requestId_key" ON "Document"("userId", "type", "requestId");

-- AddForeignKey
ALTER TABLE "Document" ADD CONSTRAINT "Document_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Document" ADD CONSTRAINT "Document_requestId_fkey" FOREIGN KEY ("requestId") REFERENCES "Request"("id") ON DELETE SET NULL ON UPDATE CASCADE;
