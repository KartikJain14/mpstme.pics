import { db } from "../config/db";
import { users } from "../db/schema";
import { eq } from "drizzle-orm";
import { comparePassword, generateToken } from "./auth.utils";
import { loginSchema } from "./auth.validation";

export const login = async (req: any, res: any) => {
    const parseResult = loginSchema.safeParse(req.body);
    if (!parseResult.success) {
        return res
            .status(400)
            .json({
                success: false,
                message: null,
                error: "Invalid request body",
                data: parseResult.error.errors,
            });
    }
    const { email, password } = parseResult.data;

    const [user] = await db.select().from(users).where(eq(users.email, email));
    if (!user)
        return res
            .status(401)
            .json({
                success: false,
                message: null,
                error: "Invalid credentials",
                data: null,
            });

    const isValid = await comparePassword(password, user.passwordHash);
    if (!isValid)
        return res
            .status(401)
            .json({
                success: false,
                message: null,
                error: "Invalid credentials",
                data: null,
            });

    const token = generateToken({
        id: user.id,
        role: user.role,
        clubId: user.clubId ?? undefined,
    });

    res.json({
        success: true,
        message: "Login successful",
        error: null,
        data: { token },
    });
};
