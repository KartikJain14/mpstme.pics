import "express";

declare module "express" {
    interface Request {
        user?: {
            id: number;
            role: "superadmin" | "clubadmin";
            clubId?: number;
        };
    }
}
