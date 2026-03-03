import { Router, Request } from 'express';
import multer from 'multer';
import { uploadImage } from '../controllers/uploadController';
import { protect } from '../middleware/authMiddleware';
import { rateLimitUpload } from '../middleware/rateLimiter';

const router = Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req: Request, file: any, cb: any) => {
    const allowedMimes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only JPEG, PNG, JPG, and WebP images are allowed'));
    }
  },
});

router.post('/upload', protect, rateLimitUpload, upload.single('image'), uploadImage);

export default router;
