import { Router } from 'express';
import { getAllArtists, getArtistById, toggleFollowArtist, getArtistFollowers } from '../controllers/artistController';
import { protect } from '../middleware/authMiddleware';
import { cachePublicAPI } from '../middleware/cacheMiddleware';

const router = Router();

// Cache artist listings (5 min cache saves bandwidth)
router.get('/', cachePublicAPI, getAllArtists);
router.get('/:id', cachePublicAPI, getArtistById);
router.post('/:id/follow', protect, toggleFollowArtist);
router.get('/:id/followers', cachePublicAPI, getArtistFollowers);

export default router;
