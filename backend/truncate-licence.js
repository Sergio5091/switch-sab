/**
 * Vide la table Licence pour permettre la migration du schéma.
 * Usage : node truncate-licence.js
 */
import pkg from '@prisma/client'
const { PrismaClient } = pkg
import { PrismaPg } from '@prisma/adapter-pg'
import { readFileSync } from 'fs'
import path from 'path'

const envFile = readFileSync(path.join(process.cwd(), '.env'), 'utf-8')
const env = {}
envFile.split('\n').forEach(line => {
  const trimmed = line.trim()
  if (trimmed && !trimmed.startsWith('#')) {
    const idx = trimmed.indexOf('=')
    if (idx > -1) env[trimmed.slice(0, idx).trim()] = trimmed.slice(idx + 1).trim()
  }
})

const adapter = new PrismaPg({ connectionString: env.DATABASE_URL })
const prisma = new PrismaClient({ adapter })

const count = await prisma.licence.deleteMany({})
console.log(`✅ ${count.count} licence(s) supprimée(s)`)
await prisma.$disconnect()
