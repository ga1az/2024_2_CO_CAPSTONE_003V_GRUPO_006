import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import { env } from '../env'
import * as schema from './schema'
import { Redis } from '@upstash/redis'

const sql = postgres(env.DATABASE_URL!)

export const db = drizzle(sql, {
  schema,
  logger: env.DATABASE_DEBUG
})

export const redis = new Redis({
  url: env.REDIS_URL,
  token: env.REDIS_PASS
})
