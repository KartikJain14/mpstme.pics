import { Router } from "express";
import { getClubPublicPage, getPublicAlbum, servePublicPhoto } from "./public.controller";

const router = Router();

router.get("/committee/:clubSlug", getClubPublicPage);
router.get("/committee/:clubSlug/:albumSlug", getPublicAlbum);
router.get("/committee/:clubSlug/:albumSlug/photo/:photoId", servePublicPhoto);

export default router;
