-- Restore index on imagePublicId for efficient Cloudinary cleanup/data-integrity queries
CREATE INDEX IF NOT EXISTS "artworks_imagePublicId_idx" ON "artworks"("imagePublicId");
