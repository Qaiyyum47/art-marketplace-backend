-- Add composite indexes for common artworks listing queries
CREATE INDEX IF NOT EXISTS "artworks_artistId_createdAt_idx" ON "artworks"("artistId", "createdAt");
CREATE INDEX IF NOT EXISTS "artworks_isAvailable_createdAt_idx" ON "artworks"("isAvailable", "createdAt");
