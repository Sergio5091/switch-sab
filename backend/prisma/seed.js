import pkg from '@prisma/client'
const { PrismaClient } = pkg
import { PrismaPg } from '@prisma/adapter-pg'
import bcrypt from 'bcryptjs'
import { readFileSync } from 'fs'
import path from 'path'

const envFile = readFileSync(path.join(process.cwd(), '.env'), 'utf-8')
const env = {}
envFile.split('\n').forEach(line => {
  const trimmed = line.trim()
  if (trimmed && !trimmed.startsWith('#')) {
    const idx = trimmed.indexOf('=')
    if (idx > -1) {
      env[trimmed.slice(0, idx).trim()] = trimmed.slice(idx + 1).trim()
    }
  }
})

const adapter = new PrismaPg({ connectionString: env.DATABASE_URL })
const prisma = new PrismaClient({ adapter })

async function main() {
  console.log('🌱 Seed Licence Manager en cours...')

  const salle = await prisma.salle.upsert({
    where: { id: 1 },
    update: {},
    create: {
      nom: 'Salle Démo',
      proprietaire: 'Éditeur Demo',
      telephone: '+33123456789',
      pays: 'France',
      ville: 'Paris',
      quartier: '1er arrondissement',
      machineId: 'MACHINE-DEMO-001',
    },
  })

  const superadmin = await prisma.user.upsert({
    where: { email: 'superadmin@licencemanager.local' },
    update: {},
    create: {
      pseudo: 'superadmin',
      email: 'superadmin@licencemanager.local',
      motDePasse: bcrypt.hashSync('superadmin123', 10),
      role: 'SUPERADMIN',
      active: true,
    },
  })

  console.log('✅ Salle créée :', salle.nom)
  console.log('✅ Superadmin créé :', superadmin.email)
  console.log('\n📝 Connexion : email superadmin@licencemanager.local / motDePasse superadmin123')
}

main()
  .catch((e) => {
    console.error('❌ Erreur seed :', e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
