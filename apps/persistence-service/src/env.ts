import 'dotenv/config';
import { z } from 'zod';

const envSchema = z.object({
    MONGODB_URI: z.string().url(),
    LOCALSTACK_ENDPOINT: z.string().url().optional(),
});

const _env = envSchema.safeParse(process.env);

if (!_env.success) {
    console.error('Invalid environment variables:', _env.error.format());
    throw new Error('Invalid environment variables');
}

export const env = _env.data;
