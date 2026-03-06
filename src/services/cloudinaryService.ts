import cloudinary from '../config/cloudinary';

interface CloudinaryUploadResponse {
  imageUrl: string;
  imagePublicId: string;
}

const sanitizePublicIdPart = (filename: string): string => {
  const base = filename.split('.').slice(0, -1).join('.') || filename;
  return base
    .toLowerCase()
    .replace(/[^a-z0-9-_]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 80) || 'image';
};

export const uploadToCloudinary = async (
  buffer: Buffer,
  filename: string
): Promise<CloudinaryUploadResponse> => {
  const safeName = sanitizePublicIdPart(filename);

  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: 'art-marketplace/artworks',
        resource_type: 'image', // Explicitly set to image only
        public_id: `${Date.now()}-${safeName}`,
        allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
        format: 'jpg', // Convert all uploads to JPEG for consistency
        quality: 'auto:good',
      },
      (error, result) => {
        if (error) {
          reject(error);
        } else if (result) {
          resolve({
            imageUrl: result.secure_url,
            imagePublicId: result.public_id,
          });
        } else {
          reject(new Error('Unknown upload error'));
        }
      }
    );

    uploadStream.end(buffer);
  });
};

export const deleteFromCloudinary = async (publicId: string): Promise<void> => {
  // Validate publicId to prevent injection attacks
  if (!publicId || typeof publicId !== 'string') {
    throw new Error('Invalid publicId: must be a non-empty string');
  }
  
  // Ensure publicId is from our folder (prevent deletion of other resources)
  if (!publicId.startsWith('art-marketplace/')) {
    throw new Error(`Invalid publicId: not from art-marketplace folder. Got: ${publicId}`);
  }
  
  // Sanitize publicId - remove any dangerous characters
  const sanitizedPublicId = publicId.replace(/[^a-zA-Z0-9/_-]/g, '');
  
  try {
    await cloudinary.uploader.destroy(sanitizedPublicId, {
      resource_type: 'image',
      invalidate: true, // Invalidate CDN cache
    });
  } catch (error) {
    // Re-throw with context so callers can decide how to handle
    const errorMsg = error instanceof Error ? error.message : 'Unknown Cloudinary error';
    throw new Error(`Failed to delete Cloudinary image: ${errorMsg}`);
  }
};
