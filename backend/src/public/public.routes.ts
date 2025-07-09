import { Router } from "express";
import {
    getClubPublicPage,
    getPublicAlbum,
    servePublicPhoto,
    getAllPublicClubs,
    proxyClubLogo,
    getPhotoCount,
} from "./public.controller";

const router = Router();

router.get("/photoCount", getPhotoCount)
router.get("/clubs", getAllPublicClubs);
router.get("/club/:clubSlug", getClubPublicPage);
router.get("/club/:clubSlug/logo", proxyClubLogo);
router.get("/club/:clubSlug/:albumSlug", getPublicAlbum);
router.get("/club/:clubSlug/:albumSlug/photo/:photoId", servePublicPhoto);

export default router;
