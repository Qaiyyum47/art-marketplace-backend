import { Router } from 'express';
import { UserRole } from '@prisma/client';
import { protect } from '../middleware/authMiddleware';
import { authorize } from '../middleware/authorizeMiddleware';
import {
  createArtwork,
  getArtworks,
  getArtworkById,
  updateArtwork,
  deleteArtwork,
  toggleFavorite,
  getFavoriteArtworks,
} from '../controllers/artworkController';

const router = Router();

router.route('/')
  .post(protect, authorize([UserRole.ARTIST]), createArtwork)
  .get(getArtworks);

router.get('/favorites', protect, getFavoriteArtworks);

router.route('/:id')
  .get(getArtworkById)
  .put(protect, authorize([UserRole.ARTIST]), updateArtwork)
  .delete(protect, authorize([UserRole.ARTIST]), deleteArtwork);

router.post('/:id/favorite', protect, toggleFavorite);

export default router;