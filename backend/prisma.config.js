import path from 'node:path'
import { defineConfig } from 'prisma/config'
import { PrismaPg } from '@prisma/adapter-pg'
import { readFileSync, existsSync } from 'fs'
import dotenv from 'dotenv'

// Charger le .env en local s'il existe (développement)
// En production (Render), les variables sont déjà dans process.env
const envPath = path.join(process.cwd(), '.env')
if (existsSync(envPath)) {
  dotenv.config({ path: envPath })
}

const connectionString = process.env.DATABASE_URL

if (!connectionString) {
  throw new Error('DATABASE_URL is not defined in environment variables')
}

export default defineConfig({
  earlyAccess: true,
  schema: path.join('prisma', 'schema.prisma'),
  datasource: {
    url: connectionString
  },
  migrate: {
    async adapter() {
      return new PrismaPg({ connectionString })
    }
  }
})
