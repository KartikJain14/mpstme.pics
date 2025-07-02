import { Router } from "express";
import { getClubPublicPage, getPublicAlbum } from "./public.controller";

const router = Router();

router.get("/committee/:clubSlug", getClubPublicPage);
router.get("/committee/:clubSlug/:albumSlug", getPublicAlbum);

export default router;
