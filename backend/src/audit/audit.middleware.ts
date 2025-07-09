export function auditMiddleware(req: any, res: any, next: any) {
    const { method, originalUrl } = req;
    const timestamp = new Date().toISOString();
    const user = req.user ? req.user.id : "anonymous"; // Adjust as per your auth system
    res.once("finish", () => {
        console.log(res.locals.action)
    });
    next();
}