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
        resource_type: 'auto',
        public_id: `${Date.now()}-${safeName}`,
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
  try {
    await cloudinary.uploader.destroy(publicId);
  } catch (error) {
    // Silently fail - image may already be deleted
    // In production, log to proper logging service (not console)
  }
};
