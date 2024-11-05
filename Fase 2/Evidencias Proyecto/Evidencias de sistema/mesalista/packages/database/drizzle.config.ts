import { env } from './env'
import 'dotenv/config'

import type { Config } from 'drizzle-kit'

const config: Config = {
  schema: './src/schema',
  out: './src/migrations',
  dialect: 'postgresql',
  verbose: env.DATABASE_DEBUG,
  dbCredentials: {
    url: env.DATABASE_URL as string
  }
}

export default config
