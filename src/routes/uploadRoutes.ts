import { Router, Request } from 'express';
import multer from 'multer';
import { uploadImage } from '../controllers/uploadController';
import { protect } from '../middleware/authMiddleware';
import { rateLimitUpload } from '../middleware/rateLimiter';

const router = Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB max
    files: 1, // Only 1 file per request
    fields: 10, // Max 10 non-file fields
    parts: 20, // Max 20 parts total
  },
  fileFilter: (_req: Request, file: any, cb: any) => {
    const allowedMimes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];
    
    // Validate MIME type
    if (!allowedMimes.includes(file.mimetype)) {
      return cb(new Error('Invalid file type. Only JPEG, PNG, JPG, and WebP images are allowed'), false);
    }
    
    // Block dangerous file extensions
    const originalname = file.originalname.toLowerCase();
    const dangerousExtensions = ['.svg', '.html', '.htm', '.js', '.exe', '.bat', '.sh', '.php', '.asp'];
    if (dangerousExtensions.some(ext => originalname.endsWith(ext))) {
      return cb(new Error('File extension not allowed'), false);
    }
    
    // Validate filename
    if (!file.originalname || file.originalname.length > 255) {
      return cb(new Error('Invalid filename'), false);
    }
    
    // Block path traversal attempts in filename
    if (file.originalname.includes('..') || file.originalname.includes('/') || file.originalname.includes('\\')) {
      return cb(new Error('Invalid filename characters'), false);
    }
    
    cb(null, true);
  },
});

// All authenticated users can upload images (for profile pictures, artworks, etc.)
// Rate limiting (20/15min) and file size limits (5MB) prevent abuse
router.post('/upload', protect, rateLimitUpload, upload.single('image'), uploadImage);

export default router;
