import { Router } from 'express';
import { UserRole } from '@prisma/client';
import { protect } from '../middleware/authMiddleware';
import { authorize } from '../middleware/authorizeMiddleware';
import { cachePublicAPI, cachePrivate } from '../middleware/cacheMiddleware';
import {
  createArtwork,
  getArtworks,
  getArtworkById,
  updateArtwork,
  deleteArtwork,
  toggleFavorite,
  getFavoriteArtworks,
  getMyWorks,
  getArtworkOptions,
} from '../controllers/artworkController';

const router = Router();

// Cache artwork options (rarely changes)
router.get('/options', cachePublicAPI, getArtworkOptions);

// Cache public artwork listings (5 min cache)
router.route('/')
  .post(protect, authorize([UserRole.ARTIST]), createArtwork)
  .get(cachePublicAPI, getArtworks);

// Private cache for user's works
router.get('/my-works', protect, authorize([UserRole.ARTIST]), cachePrivate, getMyWorks);

// Private cache for favorites
router.get('/favorites', protect, cachePrivate, getFavoriteArtworks);

// Cache individual artwork details (5 min cache)
router.route('/:id')
  .get(cachePublicAPI, getArtworkById)
  .put(protect, authorize([UserRole.ARTIST]), updateArtwork)
  .delete(protect, authorize([UserRole.ARTIST]), deleteArtwork);

router.post('/:id/favorite', protect, toggleFavorite);

export default router;