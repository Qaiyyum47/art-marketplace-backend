/**
 * Image validation utilities to prevent costly uploads
 */

// Max file size: 5MB (same as multer, but double-check)
export const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

// Max dimensions to prevent abuse (adjust based on your needs)
export const MAX_WIDTH = 4096;
export const MAX_HEIGHT = 4096;

// Minimum dimensions to ensure quality
export const MIN_WIDTH = 400;
export const MIN_HEIGHT = 400;

// Allowed MIME types
export const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
] as const;

/**
 * Validate file size
 */
export const validateFileSize = (fileSize: number): { valid: boolean; error?: string } => {
  if (fileSize > MAX_FILE_SIZE) {
    return {
      valid: false,
      error: `File size exceeds ${MAX_FILE_SIZE / 1024 / 1024}MB limit`,
    };
  }
  return { valid: true };
};

/**
 * Validate MIME type
 */
export const validateMimeType = (mimeType: string): { valid: boolean; error?: string } => {
  if (!ALLOWED_MIME_TYPES.includes(mimeType as any)) {
    return {
      valid: false,
      error: `File type ${mimeType} not allowed. Allowed types: ${ALLOWED_MIME_TYPES.join(', ')}`,
    };
  }
  return { valid: true };
};

/**
 * Get image dimensions from buffer
 * This is a simple implementation - for production, consider using 'sharp' or 'image-size' npm package
 */
export const validateImageDimensions = (
  buffer: Buffer
): { valid: boolean; error?: string; width?: number; height?: number } => {
  try {
    // For PNG
    if (buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4e && buffer[3] === 0x47) {
      const width = buffer.readUInt32BE(16);
      const height = buffer.readUInt32BE(20);
      
      if (width > MAX_WIDTH || height > MAX_HEIGHT) {
        return {
          valid: false,
          error: `Image dimensions ${width}x${height} exceed max ${MAX_WIDTH}x${MAX_HEIGHT}`,
        };
      }
      
      if (width < MIN_WIDTH || height < MIN_HEIGHT) {
        return {
          valid: false,
          error: `Image dimensions ${width}x${height} below min ${MIN_WIDTH}x${MIN_HEIGHT}`,
        };
      }
      
      return { valid: true, width, height };
    }

    // For JPEG
    if (buffer[0] === 0xff && buffer[1] === 0xd8) {
      // JPEG parsing is complex - skip dimension check or use library
      // For now, accept JPEG files (they passed size check)
      return { valid: true };
    }

    // For other formats, skip dimension check (or add library)
    return { valid: true };
  } catch (error) {
    return { valid: false, error: 'Failed to parse image' };
  }
};

/**
 * Comprehensive image validation
 */
export const validateImage = (
  file: Express.Multer.File
): { valid: boolean; errors: string[] } => {
  const errors: string[] = [];

  // Validate size
  const sizeCheck = validateFileSize(file.size);
  if (!sizeCheck.valid && sizeCheck.error) {
    errors.push(sizeCheck.error);
  }

  // Validate MIME type
  const mimeCheck = validateMimeType(file.mimetype);
  if (!mimeCheck.valid && mimeCheck.error) {
    errors.push(mimeCheck.error);
  }

  // Validate dimensions
  const dimensionCheck = validateImageDimensions(file.buffer);
  if (!dimensionCheck.valid && dimensionCheck.error) {
    errors.push(dimensionCheck.error);
  }

  return {
    valid: errors.length === 0,
    errors,
  };
};
