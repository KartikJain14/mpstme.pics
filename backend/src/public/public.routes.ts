import { Router } from "express";
import { getClubPublicPage, getPublicAlbum, servePublicPhoto } from "./public.controller";

const router = Router();

router.get("/club/:clubSlug", getClubPublicPage);
router.get("/club/:clubSlug/:albumSlug", getPublicAlbum);
router.get("/club/:clubSlug/:albumSlug/photo/:photoId", servePublicPhoto);

export default router;
