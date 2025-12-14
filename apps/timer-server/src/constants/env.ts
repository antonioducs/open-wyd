import 'dotenv/config';
import { z } from 'zod';

const envSchema = z.object({
    RPC_PORT: z.coerce.number().min(1).default(50051),
});

const _env = envSchema.safeParse(process.env);

if (!_env.success) {
    console.error('Invalid environment variables:', _env.error.format());
    process.exit(1);
}

export const env = _env.data;
