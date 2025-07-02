import { NextFunction } from "express";
import { verifyToken } from "./auth.utils";

export const authenticate = (req: any, res: any, next: NextFunction) => {
    const header = req.headers.authorization;
    if (!header || !header.startsWith("Bearer ")) {
        return res
            .status(401)
            .json({
                success: false,
                message: null,
                error: "Missing or invalid token",
                data: null,
            });
    }

    try {
        const token = header.split(" ")[1];
        const user = verifyToken(token);
        req.user = user;
        next();
    } catch {
        return res
            .status(401)
            .json({
                success: false,
                message: null,
                error: "Invalid or expired token",
                data: null,
            });
    }
};

export const requireRole =
    (role: "superadmin" | "clubadmin") =>
    (req: any, res: any, next: NextFunction) => {
        if (req.user?.role !== role) {
            return res
                .status(403)
                .json({
                    success: false,
                    message: null,
                    error: "Insufficient permissions",
                    data: null,
                });
        }
        next();
    };
