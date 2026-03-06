import { Request, Response } from 'express';
import { uploadToCloudinary } from '../services/cloudinaryService';
import { validateImage } from '../utils/imageValidator';
import { costMonitor } from '../utils/costMonitor';
import { asyncHandler } from '../utils/asyncHandler';

export const uploadImage = asyncHandler(async (req: Request, res: Response) => {
  const file = req.file;
  if (!file) {
    return res.status(400).json({ message: 'No file uploaded' });
  }

  // Validate image before uploading to Cloudinary
  const validation = validateImage(file);
  if (!validation.valid) {
    return res.status(400).json({ 
      message: 'Invalid image', 
      errors: validation.errors 
    });
  }

  // Track upload for cost monitoring
  costMonitor.trackUpload(file.size);

  // Upload to Cloudinary
  const { imageUrl, imagePublicId } = await uploadToCloudinary(
    file.buffer,
    file.originalname
  );

  return res.json({
    imageUrl,
    imagePublicId,
    message: 'Image uploaded successfully to Cloudinary',
  });
});
