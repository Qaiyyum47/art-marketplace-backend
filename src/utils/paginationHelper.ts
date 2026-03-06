/**
 * Pagination utilities for consistent request handling
 */

const DEFAULT_LIMIT = 12;
const MAX_LIMIT = 100;
const MAX_OFFSET = 10000;

export interface PaginationParams {
  limit: number;
  offset: number;
}

/**
 * Parse and validate pagination parameters from query strings
 * @param limit - Requested limit (defaults to 12, max 100)
 * @param offset - Requested offset (defaults to 0, max 10000)
 * @returns Validated pagination parameters
 */
export const parsePaginationParams = (
  limit: string | undefined,
  offset: string | undefined
): PaginationParams => {
  const limitNum = Math.max(1, Math.min(Number(limit) || DEFAULT_LIMIT, MAX_LIMIT));
  const offsetNum = Math.max(0, Math.min(Number(offset) || 0, MAX_OFFSET));

  return { limit: limitNum, offset: offsetNum };
};

/**
 * Create a sort order object based on sort query parameter
 * @param sort - Sort parameter (newest, oldest, price_asc, price_desc, popular)
 * @returns Prisma orderBy object
 */
export const parseSortParam = (sort: string | undefined): Record<string, 'asc' | 'desc'> => {
  switch (sort) {
    case 'price_asc':
      return { price: 'asc' };
    case 'price_desc':
      return { price: 'desc' };
    case 'popular':
      return { views: 'desc' };
    case 'oldest':
      return { createdAt: 'asc' };
    case 'newest':
    default:
      return { createdAt: 'desc' };
  }
};
