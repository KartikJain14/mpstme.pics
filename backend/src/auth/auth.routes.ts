import { Router } from "express";
import { login, getUser } from "./auth.controller";
import { authenticate } from "./auth.middleware";

const router = Router();

router.post("/login", login);
router.get("/me", authenticate, getUser);

export default router;
