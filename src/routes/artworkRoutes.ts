import { Router } from 'express';
import { protect } from '../middleware/authMiddleware';
import {
  createArtwork,
  getArtworks,
  getArtworkById,
  updateArtwork,
  deleteArtwork,
} from '../controllers/artworkController';

const router = Router();

router.route('/')
  .post(protect, createArtwork)
  .get(getArtworks);

router.route('/:id')
  .get(getArtworkById)
  .put(protect, updateArtwork)
  .delete(protect, deleteArtwork);

export default router;
