import { config } from 'dotenv';
import { z } from 'zod';

if (process.env.NODE_ENV === undefined || process.env.NODE_ENV === 'development') {
  config({ path: '.env.development', override: false });
}

const EnvSchema = z
  .object({
    NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
    PORT: z
      .string()
      .optional()
      .transform((value) => (value ? Number.parseInt(value, 10) : undefined))
      .pipe(z.number().int().min(1024).max(65535).default(5000)),
    ESPN_TIMEOUT_MS: z
      .string()
      .optional()
      .transform((value) => (value ? Number.parseInt(value, 10) : undefined))
      .pipe(z.number().int().positive().default(8000)),
    SCOREBOARD_TTL_MS: z
      .string()
      .optional()
      .transform((value) => (value ? Number.parseInt(value, 10) : undefined))
      .pipe(z.number().int().positive().default(15 * 60 * 1000)),
  })
  .transform((env) => ({
    nodeEnv: env.NODE_ENV,
    port: env.PORT,
    espnTimeoutMs: env.ESPN_TIMEOUT_MS,
    scoreboardTtlMs: env.SCOREBOARD_TTL_MS,
  }));

export type EnvironmentConfig = z.infer<typeof EnvSchema>;

export const ENV: EnvironmentConfig = EnvSchema.parse(process.env);
