import { Router } from 'express';
import { registerUser, loginUser, getUserProfile, updateUserProfile, getFollowing } from '../controllers/authController';
import { protect } from '../middleware/authMiddleware';
import { rateLimitAuth } from '../middleware/rateLimiter';

const router = Router();

router.post('/register', rateLimitAuth, registerUser);
router.post('/login', rateLimitAuth, loginUser);
router.get('/profile', protect, getUserProfile);
router.put('/profile', protect, updateUserProfile);
router.get('/following', protect, getFollowing);

export default router;
