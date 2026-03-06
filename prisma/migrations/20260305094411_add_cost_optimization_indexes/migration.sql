-- CreateIndex
CREATE INDEX "artworks_price_idx" ON "artworks"("price");

-- CreateIndex
CREATE INDEX "artworks_views_idx" ON "artworks"("views");

-- CreateIndex
CREATE INDEX "artworks_isFeatured_idx" ON "artworks"("isFeatured");

-- CreateIndex
CREATE INDEX "artworks_category_isAvailable_idx" ON "artworks"("category", "isAvailable");

-- CreateIndex
CREATE INDEX "artworks_createdAt_idx" ON "artworks"("createdAt");

-- CreateIndex
CREATE INDEX "users_role_idx" ON "users"("role");

-- CreateIndex
CREATE INDEX "users_email_idx" ON "users"("email");

-- CreateIndex
CREATE INDEX "users_createdAt_idx" ON "users"("createdAt");
