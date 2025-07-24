import { HttpError } from "../utils/httpErrors";

export const errorHandler = (err: any, _req: any, res: any, _next: any) => {
    console.log(err);

    if (err instanceof HttpError) {
        return res.status(err.status).json({ error: err.message });
    }
    res.status(500).json({ error: "Internal Server Error" });
};
