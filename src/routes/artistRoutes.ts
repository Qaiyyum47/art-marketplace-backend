import { Router } from 'express';
import { getAllArtists, getArtistById, toggleFollowArtist, getArtistFollowers } from '../controllers/artistController';
import { protect } from '../middleware/authMiddleware';

const router = Router();

router.get('/', getAllArtists);
router.get('/:id', getArtistById);
router.post('/:id/follow', protect, toggleFollowArtist);
router.get('/:id/followers', getArtistFollowers);

export default router;
