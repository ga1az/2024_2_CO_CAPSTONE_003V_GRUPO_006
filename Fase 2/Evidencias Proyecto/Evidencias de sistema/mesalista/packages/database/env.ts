import { boolean } from 'boolean'
import { z } from 'zod'

const zParsedBoolean = z
  .string()
  .transform((v) => boolean(v))
  .optional()
  .default('false')

const envSchema = z.object({
  DATABASE_URL: z.string().url(),
  DATABASE_DEBUG: zParsedBoolean,
  REDIS_URL: z.string().url(),
  REDIS_PASS: z.string()
})

export const env = envSchema.parse(process.env)
