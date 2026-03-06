/**
 * Image validation utilities to prevent costly uploads and security issues
 * 
 * Security measures implemented:
 * 1. File size validation (max 5MB)
 * 2. MIME type validation (header check)
 * 3. Magic byte validation (prevents MIME spoofing)
 * 4. Dimension validation (min 400x400, max 4096x4096)
 * 5. Decompression bomb protection (max 16.7M pixels)
 * 6. SVG blocking (XSS vector)
 * 7. Supports: JPEG, PNG, WebP only
 * 
 * All file types are validated against their actual binary content,
 * not just the claimed MIME type or file extension.
 */

// Max file size: 5MB (same as multer, but double-check)
export const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

// Max dimensions to prevent abuse and decompression bombs
export const MAX_WIDTH = 4096;
export const MAX_HEIGHT = 4096;

// Minimum dimensions to ensure quality
export const MIN_WIDTH = 400;
export const MIN_HEIGHT = 400;

// Max pixel count to prevent decompression bombs
const MAX_PIXELS = MAX_WIDTH * MAX_HEIGHT; // 16.7 million pixels

// Allowed MIME types
export const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
] as const;

// File signatures (magic bytes) for validation
const FILE_SIGNATURES = {
  jpeg: [0xff, 0xd8, 0xff],
  png: [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a],
  webp: [0x52, 0x49, 0x46, 0x46], // RIFF header, need to check WEBP at offset 8
} as const;

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
 * Validate file content using magic bytes (file signature)
 * Prevents MIME type spoofing attacks
 */
export const validateFileSignature = (
  buffer: Buffer
): { valid: boolean; error?: string; detectedType?: string } => {
  if (!buffer || buffer.length < 12) {
    return { valid: false, error: 'File buffer is too small or corrupted' };
  }

  // Check for JPEG
  if (
    buffer[0] === FILE_SIGNATURES.jpeg[0] &&
    buffer[1] === FILE_SIGNATURES.jpeg[1] &&
    buffer[2] === FILE_SIGNATURES.jpeg[2]
  ) {
    return { valid: true, detectedType: 'jpeg' };
  }

  // Check for PNG
  if (
    buffer[0] === FILE_SIGNATURES.png[0] &&
    buffer[1] === FILE_SIGNATURES.png[1] &&
    buffer[2] === FILE_SIGNATURES.png[2] &&
    buffer[3] === FILE_SIGNATURES.png[3] &&
    buffer[4] === FILE_SIGNATURES.png[4] &&
    buffer[5] === FILE_SIGNATURES.png[5] &&
    buffer[6] === FILE_SIGNATURES.png[6] &&
    buffer[7] === FILE_SIGNATURES.png[7]
  ) {
    return { valid: true, detectedType: 'png' };
  }

  // Check for WebP (RIFF container with WEBP signature)
  if (
    buffer[0] === FILE_SIGNATURES.webp[0] &&
    buffer[1] === FILE_SIGNATURES.webp[1] &&
    buffer[2] === FILE_SIGNATURES.webp[2] &&
    buffer[3] === FILE_SIGNATURES.webp[3] &&
    buffer[8] === 0x57 && // W
    buffer[9] === 0x45 && // E
    buffer[10] === 0x42 && // B
    buffer[11] === 0x50 // P
  ) {
    return { valid: true, detectedType: 'webp' };
  }

  // Explicitly block SVG (XSS vector)
  const startStr = buffer.toString('utf8', 0, Math.min(100, buffer.length)).toLowerCase();
  if (startStr.includes('<svg') || startStr.includes('<?xml')) {
    return { valid: false, error: 'SVG files are not allowed for security reasons' };
  }

  return {
    valid: false,
    error: 'File signature does not match any allowed image type (possible file type spoofing)',
  };
};

/**
 * Get image dimensions from buffer
 * Validates dimensions and checks for decompression bombs
 */
export const validateImageDimensions = (
  buffer: Buffer
): { valid: boolean; error?: string; width?: number; height?: number } => {
  try {
    let width = 0;
    let height = 0;

    // For PNG - read from IHDR chunk
    if (buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4e && buffer[3] === 0x47) {
      if (buffer.length < 24) {
        return { valid: false, error: 'PNG file is corrupted or truncated' };
      }
      width = buffer.readUInt32BE(16);
      height = buffer.readUInt32BE(20);
    }
    // For JPEG - scan for SOF markers
    else if (buffer[0] === 0xff && buffer[1] === 0xd8) {
      let offset = 2;
      while (offset < buffer.length - 9) {
        if (buffer[offset] !== 0xff) break;
        
        const marker = buffer[offset + 1];
        // SOF markers (Start of Frame)
        if ((marker >= 0xc0 && marker <= 0xc3) || 
            (marker >= 0xc5 && marker <= 0xc7) ||
            (marker >= 0xc9 && marker <= 0xcb) ||
            (marker >= 0xcd && marker <= 0xcf)) {
          height = buffer.readUInt16BE(offset + 5);
          width = buffer.readUInt16BE(offset + 7);
          break;
        }
        
        // Move to next marker
        const segmentLength = buffer.readUInt16BE(offset + 2);
        offset += segmentLength + 2;
      }
      
      if (width === 0 || height === 0) {
        return { valid: false, error: 'Could not read JPEG dimensions' };
      }
    }
    // For WebP - read from VP8/VP8L/VP8X chunks
    else if (buffer[0] === 0x52 && buffer[1] === 0x49 && buffer[2] === 0x46 && buffer[3] === 0x46) {
      if (buffer.length < 30) {
        return { valid: false, error: 'WebP file is corrupted or truncated' };
      }
      
      const chunkHeader = buffer.toString('ascii', 12, 16);
      
      if (chunkHeader === 'VP8 ') {
        // Lossy WebP
        width = buffer.readUInt16LE(26) & 0x3fff;
        height = buffer.readUInt16LE(28) & 0x3fff;
      } else if (chunkHeader === 'VP8L') {
        // Lossless WebP
        const bits = buffer.readUInt32LE(21);
        width = (bits & 0x3fff) + 1;
        height = ((bits >> 14) & 0x3fff) + 1;
      } else if (chunkHeader === 'VP8X') {
        // Extended WebP
        width = (buffer.readUIntLE(24, 3) + 1);
        height = (buffer.readUIntLE(27, 3) + 1);
      }
      
      if (width === 0 || height === 0) {
        return { valid: false, error: 'Could not read WebP dimensions' };
      }
    } else {
      return { valid: false, error: 'Unknown image format' };
    }

    // Validate dimensions
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

    // Check for decompression bombs
    const pixelCount = width * height;
    if (pixelCount > MAX_PIXELS) {
      return {
        valid: false,
        error: `Image has too many pixels (${pixelCount}), possible decompression bomb`,
      };
    }
    
    return { valid: true, width, height };
  } catch (error) {
    return { valid: false, error: 'Failed to parse image dimensions' };
  }
};

/**
 * Comprehensive image validation with security checks
 */
export const validateImage = (
  file: Express.Multer.File
): { valid: boolean; errors: string[] } => {
  const errors: string[] = [];

  // 1. Validate file buffer exists
  if (!file.buffer || file.buffer.length === 0) {
    errors.push('File buffer is empty');
    return { valid: false, errors };
  }

  // 2. Validate file size
  const sizeCheck = validateFileSize(file.size);
  if (!sizeCheck.valid && sizeCheck.error) {
    errors.push(sizeCheck.error);
  }

  // 3. Validate MIME type from header
  const mimeCheck = validateMimeType(file.mimetype);
  if (!mimeCheck.valid && mimeCheck.error) {
    errors.push(mimeCheck.error);
  }

  // 4. Validate actual file content (magic bytes) - prevents MIME spoofing
  const signatureCheck = validateFileSignature(file.buffer);
  if (!signatureCheck.valid && signatureCheck.error) {
    errors.push(signatureCheck.error);
  }

  // 5. Validate dimensions and check for decompression bombs
  const dimensionCheck = validateImageDimensions(file.buffer);
  if (!dimensionCheck.valid && dimensionCheck.error) {
    errors.push(dimensionCheck.error);
  }

  return {
    valid: errors.length === 0,
    errors,
  };
};
