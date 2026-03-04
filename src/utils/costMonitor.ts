/**
 * Cost monitoring utilities to track and prevent excessive resource usage
 */

interface CostMetrics {
  dbQueriesCount: number;
  slowQueriesCount: number;
  uploadedFilesCount: number;
  uploadedBytes: number;
  largeResponsesCount: number;
  lastReset: Date;
}

class CostMonitor {
  private metrics: CostMetrics = {
    dbQueriesCount: 0,
    slowQueriesCount: 0,
    uploadedFilesCount: 0,
    uploadedBytes: 0,
    largeResponsesCount: 0,
    lastReset: new Date(),
  };

  // Thresholds
  private readonly SLOW_QUERY_MS = 3000;
  private readonly LARGE_RESPONSE_KB = 500;

  trackDbQuery(durationMs: number) {
    this.metrics.dbQueriesCount++;
    if (durationMs > this.SLOW_QUERY_MS) {
      this.metrics.slowQueriesCount++;
    }
  }

  trackUpload(fileSizeBytes: number) {
    this.metrics.uploadedFilesCount++;
    this.metrics.uploadedBytes += fileSizeBytes;
  }

  trackResponse(responseSizeBytes: number) {
    if (responseSizeBytes > this.LARGE_RESPONSE_KB * 1024) {
      this.metrics.largeResponsesCount++;
    }
  }

  getMetrics(): CostMetrics {
    return { ...this.metrics };
  }

  reset() {
    this.metrics = {
      dbQueriesCount: 0,
      slowQueriesCount: 0,
      uploadedFilesCount: 0,
      uploadedBytes: 0,
      largeResponsesCount: 0,
      lastReset: new Date(),
    };
  }
}

// Singleton instance
export const costMonitor = new CostMonitor();

/**
 * Middleware to track response sizes
 */
export const responseSizeTracker = (req: any, res: any, next: any) => {
  const originalJson = res.json;
  
  res.json = function (data: any) {
    const jsonString = JSON.stringify(data);
    const sizeBytes = Buffer.byteLength(jsonString, 'utf8');
    
    costMonitor.trackResponse(sizeBytes);
    
    // Warn about large responses in development
    if (process.env.NODE_ENV === 'development' && sizeBytes > 100 * 1024) {
      console.warn(`⚠️  Large response: ${(sizeBytes / 1024).toFixed(1)}KB for ${req.method} ${req.path}`);
    }
    
    return originalJson.call(this, data);
  };
  
  next();
};
