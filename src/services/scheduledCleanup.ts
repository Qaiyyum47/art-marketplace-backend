/**
 * Scheduled cleanup service to prevent storage cost bloat
 * 
 * This service should be run periodically (e.g., daily via cron job)
 * to clean up orphaned Cloudinary images that are no longer referenced
 * in the database.
 * 
 * Cost savings:
 * - Cloudinary charges for storage based on total assets
 * - Orphaned images from failed uploads or deleted artworks cost money
 * - Regular cleanup can save 10-30% on storage costs
 * 
 * Setup options:
 * 1. Run manually via admin API endpoint
 * 2. Use node-cron for in-app scheduling
 * 3. Use external cron job to call cleanup endpoint
 * 4. Use cloud scheduler (AWS EventBridge, Google Cloud Scheduler)
 */

import cloudinary from '../config/cloudinary';
import prisma from '../config/database';

interface CleanupReport {
  totalCloudinaryImages: number;
  totalDatabaseImages: number;
  orphanedImages: string[];
  deletedCount: number;
  errors: string[];
}

/**
 * Find all images in Cloudinary folder
 */
async function getAllCloudinaryImages(): Promise<string[]> {
  const images: string[] = [];
  let nextCursor: string | undefined;

  try {
    do {
      const result = await cloudinary.api.resources({
        type: 'upload',
        prefix: 'art-marketplace/artworks',
        max_results: 500,
        next_cursor: nextCursor,
      });

      images.push(...result.resources.map((r: any) => r.public_id));
      nextCursor = result.next_cursor;
    } while (nextCursor);

    return images;
  } catch (error) {
    throw new Error(`Failed to fetch Cloudinary images: ${error instanceof Error ? error.message : 'unknown'}`);
  }
}

/**
 * Find all image public IDs referenced in database
 */
async function getAllDatabaseImages(): Promise<Set<string>> {
  const artworks = await prisma.artwork.findMany({
    select: { imagePublicId: true },
    where: { imagePublicId: { not: null } },
  });

  const users = await prisma.user.findMany({
    select: { profileImage: true },
    where: { 
      profileImage: { 
        contains: 'cloudinary.com',
      },
    },
  });

  const imageIds = new Set<string>();

  // Add artwork images
  artworks.forEach((artwork) => {
    if (artwork.imagePublicId) {
      imageIds.add(artwork.imagePublicId);
    }
  });

  // Extract public IDs from profile image URLs
  users.forEach((user) => {
    if (user.profileImage) {
      const match = user.profileImage.match(/art-marketplace\/[^/]+\/[^.]+/);
      if (match) {
        imageIds.add(match[0]);
      }
    }
  });

  return imageIds;
}

/**
 * Delete orphaned images from Cloudinary
 */
async function deleteOrphanedImages(orphanedIds: string[]): Promise<{ deleted: number; errors: string[] }> {
  const errors: string[] = [];
  let deleted = 0;

  // Delete in batches to avoid rate limits
  const batchSize = 10;
  for (let i = 0; i < orphanedIds.length; i += batchSize) {
    const batch = orphanedIds.slice(i, i + batchSize);

    await Promise.all(
      batch.map(async (publicId) => {
        try {
          await cloudinary.uploader.destroy(publicId, {
            resource_type: 'image',
            invalidate: true,
          });
          deleted++;
        } catch (error) {
          errors.push(`Failed to delete ${publicId}: ${error instanceof Error ? error.message : 'unknown'}`);
        }
      })
    );

    // Rate limiting: wait 1 second between batches
    if (i + batchSize < orphanedIds.length) {
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
  }

  return { deleted, errors };
}

/**
 * Run cleanup and return report
 * WARNING: This can be expensive if you have many orphaned images
 * Consider running during off-peak hours
 */
export async function runCloudinaryCleanup(dryRun: boolean = true): Promise<CleanupReport> {
  try {
    process.stdout.write(`[Cloudinary Cleanup] Starting ${dryRun ? '(DRY RUN)' : '(LIVE)'}...\n`);

    // Fetch all images from Cloudinary
    const cloudinaryImages = await getAllCloudinaryImages();
    process.stdout.write(`[Cloudinary Cleanup] Found ${cloudinaryImages.length} images in Cloudinary\n`);

    // Fetch all referenced images from database
    const databaseImages = await getAllDatabaseImages();
    process.stdout.write(`[Cloudinary Cleanup] Found ${databaseImages.size} referenced images in database\n`);

    // Find orphaned images
    const orphanedImages = cloudinaryImages.filter((img) => !databaseImages.has(img));
    process.stdout.write(`[Cloudinary Cleanup] Found ${orphanedImages.length} orphaned images\n`);

    let deletedCount = 0;
    let errors: string[] = [];

    if (!dryRun && orphanedImages.length > 0) {
      const result = await deleteOrphanedImages(orphanedImages);
      deletedCount = result.deleted;
      errors = result.errors;
      process.stdout.write(`[Cloudinary Cleanup] Deleted ${deletedCount} orphaned images\n`);
    }

    return {
      totalCloudinaryImages: cloudinaryImages.length,
      totalDatabaseImages: databaseImages.size,
      orphanedImages: dryRun ? orphanedImages : [],
      deletedCount,
      errors,
    };
  } catch (error) {
    throw new Error(`Cleanup failed: ${error instanceof Error ? error.message : 'unknown'}`);
  }
}
