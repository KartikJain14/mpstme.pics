import { Router } from "express";
import {
    createClub,
    updateClub,
    deleteClub,
    getMyClub,
} from "./clubs.controller";
import { authenticate, requireRole } from "../auth/auth.middleware";

const router = Router();

router.post(
    "/admin/clubs",
    authenticate,
    requireRole("superadmin"),
    createClub,
);
router.patch(
    "/admin/clubs/:clubId",
    authenticate,
    requireRole("superadmin"),
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
