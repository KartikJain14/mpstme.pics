export class HttpError extends Error {
    status: number;
    constructor(status: number, message: string) {
        super(message);
        this.status = status;
    }
}

export const BadRequest = (msg: string) => new HttpError(400, msg);
export const Unauthorized = (msg: string) => new HttpError(401, msg);
export const Forbidden = (msg: string) => new HttpError(403, msg);
export const NotFound = (msg: string) => new HttpError(404, msg);
export const Conflict = (msg: string) => new HttpError(409, msg);
export const InternalError = (msg: string) => new HttpError(500, msg);
