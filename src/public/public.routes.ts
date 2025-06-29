import { Router } from 'express';
import { getClubPublicPage, getPublicAlbum } from './public.controller';

const router = Router();

router.get('/:clubSlug', getClubPublicPage);
router.get('/:clubSlug/:albumSlug', getPublicAlbum);

export default router;