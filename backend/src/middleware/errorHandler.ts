import { HttpError } from "../utils/httpErrors";

export const errorHandler = (err: any, _req: any, res: any, _next: any) => {
    if (err instanceof HttpError) {
        return res.status(err.status).json({ error: err.message });
    }

    console.error(err); // still log
    res.status(500).json({ error: "Internal Server Error" });
};
