import dotenv from 'dotenv'
import pkg from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'

dotenv.config()

const { PrismaClient } = pkg

const connectionString = process.env.DATABASE_URL

if (!connectionString) {
	console.warn('Warning: DATABASE_URL is not set in environment. Prisma may fail to connect.')
}

const adapter = new PrismaPg({ connectionString })

export const prisma = new PrismaClient({ adapter })
