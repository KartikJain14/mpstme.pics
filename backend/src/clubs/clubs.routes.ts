import { Router } from "express";
import {
    createClub,
    updateClub,
    deleteClub,
    getMyClub,
    getAllClubs,
} from "./clubs.controller";
import { authenticate, requireRole } from "../auth/auth.middleware";
import { clubLogoUpload } from "./logoUpload.middleware";

const router = Router();

router.get(
    "/admin/clubs",
    authenticate,
    requireRole("superadmin"),
    getAllClubs,
);
router.post(
    "/admin/clubs",
    authenticate,
    requireRole("superadmin"),
    clubLogoUpload.single("logo"), // Accept file upload for logo
    createClub,
);
router.patch(
    "/admin/clubs/:clubId",
    authenticate,
    requireRole("superadmin"),
    clubLogoUpload.single("logo"), // Accept file upload for logo on update
    updateClub,
);
router.delete(
    "/admin/clubs/:clubId",
    authenticate,
    requireRole("superadmin"),
    deleteClub,
);
router.get("/me/club", authenticate, requireRole("clubadmin"), getMyClub);

export default router;
