import { z } from 'zod';

const envSchema = z.object({
  // queues
  AUDIT_QUEUE_URL: z.string(),
  GAME_EVENTS_QUEUE_URL: z.string(),

  // aws configs
  AWS_ENDPOINT: z.string(),
  AWS_REGION: z.string(),
  AWS_ACCESS_KEY_ID: z.string(),
  AWS_SECRET_ACCESS_KEY: z.string(),
});

const _env = envSchema.safeParse(process.env);

if (!_env.success) {
  console.error('Invalid environment variables:', _env.error.format());
  process.exit(1);
}

export const env = _env.data;
