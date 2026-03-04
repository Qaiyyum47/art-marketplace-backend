import { Request, Response } from 'express';
import { uploadToCloudinary } from '../services/cloudinaryService';
import { validateImage } from '../utils/imageValidator';
import { costMonitor } from '../utils/costMonitor';

export const uploadImage = async (req: Request, res: Response) => {
  try {
    const file = req.file;
    if (!file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // Validate image before uploading to Cloudinary
    const validation = validateImage(file);
    if (!validation.valid) {
      return res.status(400).json({ 
        error: 'Invalid image', 
        details: validation.errors 
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
      filename: file.originalname,
      message: 'Image uploaded successfully to Cloudinary',
    });
  } catch (error) {
    // Don't log full error (may contain sensitive data)
    return res.status(500).json({ error: 'Upload failed' });
  }
};
