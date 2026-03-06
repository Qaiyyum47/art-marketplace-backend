/**
 * HTTP caching middleware to reduce bandwidth costs
 * 
 * Adds appropriate Cache-Control headers based on route type:
 * - Public static resources: Long cache (1 year)
 * - API responses: Short cache with revalidation
 * - User-specific data: No cache or private cache
 * 
 * Benefits:
 * - Reduces server bandwidth (CDN serves cached responses)
 * - Reduces database queries
 * - Improves user experience (faster load times)
 * - Can save 30-50% on bandwidth costs
 */

import { Request, Response, NextFunction } from 'express';

interface CacheOptions {
  maxAge?: number; // in seconds
  sMaxAge?: number; // CDN cache duration
  public?: boolean;
  private?: boolean;
  noCache?: boolean;
  noStore?: boolean;
  mustRevalidate?: boolean;
}

/**
 * Add cache headers to response
 */
function setCacheHeaders(res: Response, options: CacheOptions): void {
  const directives: string[] = [];

  if (options.noStore) {
    directives.push('no-store');
  } else if (options.noCache) {
    directives.push('no-cache');
  } else {
    if (options.public) {
      directives.push('public');
    } else if (options.private) {
      directives.push('private');
    }

    if (options.maxAge !== undefined) {
      directives.push(`max-age=${options.maxAge}`);
    }

    if (options.sMaxAge !== undefined) {
      directives.push(`s-maxage=${options.sMaxAge}`);
    }

    if (options.mustRevalidate) {
      directives.push('must-revalidate');
    }
  }

  if (directives.length > 0) {
    res.setHeader('Cache-Control', directives.join(', '));
  }
}

/**
 * Cache public API responses for 5 minutes
 * Use for: artwork listings, artist listings, public profiles
 */
export const cachePublicAPI = (req: Request, res: Response, next: NextFunction) => {
  // Only cache GET requests
  if (req.method === 'GET') {
    setCacheHeaders(res, {
      public: true,
      maxAge: 300, // 5 minutes browser cache
      sMaxAge: 600, // 10 minutes CDN cache
      mustRevalidate: true,
    });
  }
  next();
};

/**
 * Cache static/immutable resources for 1 year
 * Use for: images from Cloudinary (they have unique URLs)
 */
export const cacheImmutable = (_req: Request, res: Response, next: NextFunction) => {
  setCacheHeaders(res, {
    public: true,
    maxAge: 31536000, // 1 year
    sMaxAge: 31536000,
  });
  res.setHeader('Immutable', 'true');
  next();
};

/**
 * Short cache for frequently changing data
 * Use for: featured artworks, recent artworks
 */
export const cacheShort = (req: Request, res: Response, next: NextFunction) => {
  if (req.method === 'GET') {
    setCacheHeaders(res, {
      public: true,
      maxAge: 60, // 1 minute browser cache
      sMaxAge: 120, // 2 minutes CDN cache
      mustRevalidate: true,
    });
  }
  next();
};

/**
 * Private cache for user-specific data
 * Use for: user profile, favorites, cart
 */
export const cachePrivate = (req: Request, res: Response, next: NextFunction) => {
  if (req.method === 'GET') {
    setCacheHeaders(res, {
      private: true,
      maxAge: 60, // 1 minute
      mustRevalidate: true,
    });
  }
  next();
};

/**
 * No cache for sensitive or real-time data
 * Use for: authentication, checkout, admin endpoints
 */
export const noCache = (_req: Request, res: Response, next: NextFunction) => {
  setCacheHeaders(res, {
    noStore: true,
  });
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  next();
};

/**
 * Conditional cache based on authentication
 * Public users get cached responses, authenticated users get fresh data
 */
export const cacheConditional = (req: Request, res: Response, next: NextFunction) => {
  if (req.method === 'GET') {
    if (req.userId) {
      // Authenticated user - private cache
      setCacheHeaders(res, {
        private: true,
        maxAge: 60,
        mustRevalidate: true,
      });
    } else {
      // Public user - public cache
      setCacheHeaders(res, {
        public: true,
        maxAge: 300,
        sMaxAge: 600,
        mustRevalidate: true,
      });
    }
  }
  next();
};

/**
 * Add ETags for conditional requests (saves bandwidth)
 */
export const addETag = (req: Request, res: Response, next: NextFunction) => {
  const originalJson = res.json;

  res.json = function (data: unknown) {
    // Generate simple ETag from response data
    const content = JSON.stringify(data);
    const etag = `W/"${Buffer.from(content).toString('base64').slice(0, 27)}"`;

    res.setHeader('ETag', etag);

    // Check if client has current version
    const clientETag = req.headers['if-none-match'];
    if (clientETag === etag) {
      res.status(304).end();
      return res;
    }

    return originalJson.call(this, data);
  };

  next();
};
