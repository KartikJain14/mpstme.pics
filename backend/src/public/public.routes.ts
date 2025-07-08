import { Router } from "express";
import {
    getClubPublicPage,
    getPublicAlbum,
    servePublicPhoto,
    getAllPublicClubs,
    proxyClubLogo,
} from "./public.controller";

const router = Router();

router.get("/clubs", getAllPublicClubs);
router.get("/club/:clubSlug", getClubPublicPage);
router.get("/club/:clubSlug/:albumSlug", getPublicAlbum);
router.get("/club/:clubSlug/:albumSlug/photo/:photoId", servePublicPhoto);
router.get("/club/:clubSlug/logo", proxyClubLogo);

export default router;
