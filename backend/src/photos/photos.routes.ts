import { Router } from "express";
import {
    listPhotos,
    uploadPhotos,
    deletePhoto,
    togglePhotoVisibility,
    serveAdminPhoto,
} from "./photos.controller";
import { authenticate, requireRole } from "../auth/auth.middleware";
import { upload } from "./upload.middleware";

const router = Router();

router.get(
    "/albums/:albumId/photos",
    authenticate,
    requireRole("clubadmin"),
    listPhotos,
);
router.post(
    "/albums/:albumId/photos",
    authenticate,
    requireRole("clubadmin"),
    upload.array("photos"),
    uploadPhotos,
);
router.get(
    "/photos/:photoId",
    authenticate,
    requireRole("clubadmin"),
    serveAdminPhoto,
);
router.delete(
    "/photos/:photoId",
    authenticate,
    requireRole("clubadmin"),
    deletePhoto,
);
router.patch(
    "/photos/:photoId",
    authenticate,
    requireRole("clubadmin"),
    togglePhotoVisibility,
);

export default router;
