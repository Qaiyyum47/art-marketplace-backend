/**
 * Database query optimization utilities
 * Helps catch N+1 query issues and track query patterns
 */

interface QueryLog {
  model: string;
  action: string;
  duration: number;
  timestamp: Date;
}

class QueryMonitor {
  private queries: QueryLog[] = [];
  private readonly MAX_LOGS = 1000; // Keep last 1000 queries in memory
  private readonly WARN_THRESHOLD_MS = 1000;

  log(model: string, action: string, duration: number) {
    this.queries.push({
      model,
      action,
      duration,
      timestamp: new Date(),
    });

    // Keep only last MAX_LOGS
    if (this.queries.length > this.MAX_LOGS) {
      this.queries.shift();
    }

    // Warn about slow queries in development
    if (process.env.NODE_ENV === 'development' && duration > this.WARN_THRESHOLD_MS) {
      process.stderr.write(`🐌 Slow query: ${model}.${action} took ${duration}ms\n`);
    }
  }

  /**
   * Detect potential N+1 issues
   * Returns models that have high query counts relative to others
   */
  detectN1Issues(): { model: string; action: string; count: number }[] {
    const recentQueries = this.queries.slice(-100); // Check last 100 queries
    const counts = new Map<string, number>();

    for (const query of recentQueries) {
      const key = `${query.model}.${query.action}`;
      counts.set(key, (counts.get(key) || 0) + 1);
    }

    const issues: { model: string; action: string; count: number }[] = [];
    for (const [key, count] of counts.entries()) {
      // If a query appears more than 10 times in last 100 queries, flag it
      if (count > 10) {
        const [model, action] = key.split('.');
        issues.push({ model, action, count });
      }
    }

    return issues;
  }

  /**
   * Get query statistics
   */
  getStats() {
    if (this.queries.length === 0) {
      return { totalQueries: 0, avgDuration: 0, slowQueries: 0 };
    }

    const totalDuration = this.queries.reduce((sum, q) => sum + q.duration, 0);
    const slowQueries = this.queries.filter((q) => q.duration > this.WARN_THRESHOLD_MS).length;

    return {
      totalQueries: this.queries.length,
      avgDuration: Math.round(totalDuration / this.queries.length),
      slowQueries,
    };
  }

  clear() {
    this.queries = [];
  }
}

export const queryMonitor = new QueryMonitor();
