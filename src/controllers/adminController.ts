import { Request, Response } from 'express';
import { costMonitor } from '../utils/costMonitor';
import { queryMonitor } from '../utils/queryMonitor';
import { asyncHandler } from '../utils/asyncHandler';
import { findArtworksWithMissingImages } from '../services/cloudinaryCleanup';

/**
 * Get cost and performance metrics (Admin only)
 */
export const getCostMetrics = asyncHandler(async (_req: Request, res: Response) => {
  const costMetrics = costMonitor.getMetrics();
  const queryStats = queryMonitor.getStats();
  const n1Issues = queryMonitor.detectN1Issues();

  return res.json({
    cost: {
      dbQueries: costMetrics.dbQueriesCount,
      slowQueries: costMetrics.slowQueriesCount,
      uploadedFiles: costMetrics.uploadedFilesCount,
      uploadedMB: (costMetrics.uploadedBytes / 1024 / 1024).toFixed(2),
      largeResponses: costMetrics.largeResponsesCount,
      since: costMetrics.lastReset,
    },
    database: {
      totalQueries: queryStats.totalQueries,
      avgDurationMs: queryStats.avgDuration,
      slowQueries: queryStats.slowQueries,
      potentialN1Issues: n1Issues,
    },
  });
});

/**
 * Find artworks with data integrity issues (Admin only)
 */
export const getDataIntegrityIssues = asyncHandler(async (_req: Request, res: Response) => {
  const artworksWithMissingImages = await findArtworksWithMissingImages();

  return res.json({
    issues: {
      artworksWithoutCloudinaryId: artworksWithMissingImages.length,
      details: artworksWithMissingImages,
    },
    recommendations: [
      artworksWithMissingImages.length > 0
        ? `${artworksWithMissingImages.length} artwork(s) missing Cloudinary imagePublicId - these cannot be cleaned up properly`
        : 'No data integrity issues found',
    ],
  });
});

/**
 * Reset cost monitoring metrics (Admin only)
 */
export const resetCostMetrics = asyncHandler(async (_req: Request, res: Response) => {
  costMonitor.reset();
  queryMonitor.clear();

  return res.json({
    message: 'Cost monitoring metrics reset successfully',
  });
});
