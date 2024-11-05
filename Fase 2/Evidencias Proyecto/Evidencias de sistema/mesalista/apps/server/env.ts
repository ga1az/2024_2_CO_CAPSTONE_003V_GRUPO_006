import { z } from 'zod'

const envSchema = z.object({
  SECRET: z.string(),
  DATABASE_URL: z.string(),
  DATABASE_DEBUG: z.string(),
  RESEND_API_KEY: z.string(),
  PORT: z.string(),
  TZ: z.string(),
  JWT_EXPIRES_IN: z.string(),
  SUPABASE_URL: z.string(),
  SUPABASE_ANON_KEY: z.string(),
  REDIS_URL: z.string().url(),
  REDIS_PASS: z.string()
})

export const env = envSchema.parse(Bun.env)
