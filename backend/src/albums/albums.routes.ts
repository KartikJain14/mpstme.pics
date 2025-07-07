import { Router } from "express";
import {
  listAlbums,
  getAlbum,
  createAlbum,
  updateAlbum,
  deleteAlbum,
} from "./albums.controller";
import { authenticate, requireRole } from "../auth/auth.middleware";

const router = Router();

router.get("/me/albums", authenticate, requireRole("clubadmin"), listAlbums);
router.get(
  "/me/albums/:albumId",
  authenticate,
  requireRole("clubadmin"),
  getAlbum
);
router.post("/me/albums", authenticate, requireRole("clubadmin"), createAlbum);
router.patch(
  "/me/albums/:albumId",
  authenticate,
  requireRole("clubadmin"),
  updateAlbum
);
router.delete(
  "/me/albums/:albumId",
  authenticate,
  requireRole("clubadmin"),
  deleteAlbum
);

export default router;
