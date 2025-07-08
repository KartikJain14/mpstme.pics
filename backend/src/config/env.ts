import { config } from "dotenv";
import { z } from "zod";

config();

const envSchema = z.object({
    NODE_ENV: z.string().default("development"),
    PORT: z.coerce.number().default(3001),
    DATABASE_URL: z.string().url(),
    JWT_SECRET: z.string().min(10),
    S3_BUCKET_NAME: z.string(),
    AWS_REGION: z.string().default("ap-south-1"),
    AWS_ACCESS_KEY_ID: z.string(),
    AWS_SECRET_ACCESS_KEY: z.string(),
    UPLOAD_MAX_MB: z.coerce.number().default(10),
});

export const env = envSchema.parse(process.env);
