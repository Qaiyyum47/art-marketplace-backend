-- Add index on imagePublicId for faster Cloudinary cleanup queries
CREATE INDEX IF NOT EXISTS "artworks_imagePublicId_idx" ON "artworks"("imagePublicId");