-- AlterTable
ALTER TABLE "artworks" ADD COLUMN "artworkType" TEXT,
ADD COLUMN "edition" TEXT,
ADD COLUMN "series" TEXT,
ADD COLUMN "condition" TEXT,
ADD COLUMN "signaturePresent" BOOLEAN,
ADD COLUMN "certificationIncluded" BOOLEAN,
ADD COLUMN "provenance" TEXT,
ADD COLUMN "materials" TEXT;
